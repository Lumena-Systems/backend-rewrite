/**
 * Discount Service
 * 
 * Issue: Some items were created with a discount of "15%" instead of "15".
 * 
 * Impact: A production incident occurred where some users received incorrect discounts
 * (either too high or too low) for about 10 minutes before the issue was detected.
 * 
 * Interview Question: How would you prevent this class of bugs in the future?
 */

import prisma from '../utils/database';

interface DiscountResult {
  originalTotal: number;
  discountAmount: number;
  finalTotal: number;
  couponCode: string;
}

export class DiscountService {
  /**
   * Apply a coupon code to an order
   */
  async applyCoupon(orderId: string, couponCode: string): Promise<DiscountResult> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Cannot apply coupon to non-pending order');
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode }
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new Error('Coupon has expired');
    }

    // BUGGY CODE: coupon.discount was sometimes "15%".
    const discountValue = Number(coupon.discount);
    const discountAmount = (order.total * discountValue) / 100;
    const finalTotal = order.total - discountAmount;

    // Update the order with the new total
    await prisma.order.update({
      where: { id: orderId },
      data: { total: finalTotal }
    });

    return {
      originalTotal: order.total,
      discountAmount,
      finalTotal,
      couponCode: coupon.code
    };
  }

  /**
   * Create a new coupon
   */
  async createCoupon(code: string, discount: string, description?: string, expiresAt?: Date) {
    return prisma.coupon.create({
      data: {
        code,
        discount,
        description,
        expiresAt
      }
    });
  }

  /**
   * Get all active coupons
   */
  async getActiveCoupons() {
    return prisma.coupon.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });
  }
}

export const discountService = new DiscountService();

