import { NextRequest, NextResponse } from 'next/server';
import { orderSchema } from '@/lib/validations/order';
import { getProductBySlug, getVariantById } from '@/lib/products';
import { generateUniqueCode } from '@/lib/unique-code';
import { generateOrderId } from '@/lib/order-id';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { normalizePhone, isValidPhone, maskName } from '@/lib/utils';
import { ORDER_EXPIRATION_HOURS } from '@/lib/config';

// Simple in-memory rate limiter for serverless
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 orders per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || request.headers.get('x-real-ip') 
      || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate with Zod
    const parseResult = orderSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Data tidak valid' },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate product
    const product = getProductBySlug(data.productSlug);
    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate variant
    const variant = getVariantById(product, data.variantId);
    if (!variant) {
      return NextResponse.json(
        { error: 'Varian tidak ditemukan' },
        { status: 400 }
      );
    }

    if (!variant.active) {
      return NextResponse.json(
        { error: 'Varian tidak tersedia' },
        { status: 400 }
      );
    }

    // Validate phone
    const normalizedPhone = normalizePhone(data.customerPhone);
    if (!isValidPhone(data.customerPhone)) {
      return NextResponse.json(
        { error: 'Nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check idempotency
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('order_id, invoice_token, total_amount, unique_code, expires_at')
      .eq('idempotency_key', data.idempotencyKey)
      .single();

    if (existingOrder) {
      return NextResponse.json({
        orderId: existingOrder.order_id,
        invoiceToken: existingOrder.invoice_token,
        totalAmount: existingOrder.total_amount,
        uniqueCode: existingOrder.unique_code,
        expiresAt: existingOrder.expires_at,
      });
    }

    // Server-side price from product config (never trust client)
    const price = variant.price;

    // Generate unique code
    const uniqueCode = await generateUniqueCode(price, data.paymentMethod);
    const totalAmount = price + uniqueCode;

    // Generate order ID and invoice token
    const { orderId, invoiceToken } = await generateOrderId(product.slug);

    // Calculate expiration
    const expiresAt = new Date(
      Date.now() + ORDER_EXPIRATION_HOURS * 60 * 60 * 1000
    ).toISOString();

    // Insert order
    const { error: insertError } = await supabase.from('orders').insert({
      order_id: orderId,
      invoice_token: invoiceToken,
      product_slug: product.slug,
      product_name: product.name,
      variant_id: variant.id,
      variant_name: variant.name,
      price,
      unique_code: uniqueCode,
      total_amount: totalAmount,
      customer_name: data.customerName.trim(),
      customer_phone: normalizedPhone,
      customer_email: data.customerEmail.trim().toLowerCase(),
      payment_method: data.paymentMethod,
      status: 'PENDING',
      fulfillment_status: 'UNFULFILLED',
      expires_at: expiresAt,
      idempotency_key: data.idempotencyKey,
    });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Gagal membuat pesanan. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    // Insert social proof event (masked data only)
    await supabase.from('social_proof_events').insert({
      masked_name: maskName(data.customerName),
      product_name: product.name,
      variant_name: variant.name,
    });

    return NextResponse.json({
      orderId,
      invoiceToken,
      totalAmount,
      uniqueCode,
      expiresAt,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
