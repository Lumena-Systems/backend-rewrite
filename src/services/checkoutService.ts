/**
 * Checkout Service
 * 
 * This service handles the checkout process where users finalize their orders.
 * 
 * Scenario: Users are reporting they're being charged twice for the same order.
 * Occurs infrequently, but enough to be a problem.
 * Based on logging, there seems to be two calls to the checkout endpoint with the same data.
 * 
 * Context: The checkout service is called by the frontend (not present in repo) when a user completes a purchase.
 * 
 * Candidate task:
 * - Propose a solution to the double-write issue.
 */

import prisma from '../utils/database';
import { OrderStatus } from '@prisma/client';

interface CheckoutItem {
  productId: string;
  quantity: number;
}

interface CheckoutRequest {
  userId: string;
  items: CheckoutItem[];
  paymentMethod: string;
  cardLast4?: string;
}

interface CheckoutResult {
  success: boolean;
  orderId?: string;
  message: string;
  total?: number;
}

export class CheckoutService {
  /**
   * Process a checkout request
   * 
   */
  async checkout(request: CheckoutRequest): Promise<CheckoutResult> {
    try {
      // Validate items
      const items = await this.validateItems(request.items);
      
      // Calculate total
      const total = this.calculateTotal(items);
      
      // Create order
      const order = await prisma.order.create({
        data: {
          userId: request.userId,
          status: OrderStatus.PENDING,
          total,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.price
            }))
          }
        },
        include: {
          items: true
        }
      });

      // Process payment
      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          status: 'COMPLETED',
          paymentMethod: request.paymentMethod,
          metadata: JSON.stringify({
            cardLast4: request.cardLast4,
            timestamp: new Date().toISOString()
          })
        }
      });

      console.log(`[Checkout] Order created: ${order.id}, Payment: ${payment.id}`);

      return {
        success: true,
        orderId: order.id,
        message: 'Order placed successfully',
        total
      };
    } catch (error) {
      console.error('[Checkout] Checkout failed:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Checkout failed'
      };
    }
  }

  private async validateItems(items: CheckoutItem[]) {
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. ` +
          `Requested: ${item.quantity}, Available: ${product.stockQuantity}`
        );
      }

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    return validatedItems;
  }

  private calculateTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        payments: true,
        user: true
      }
    });
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const checkoutService = new CheckoutService();

