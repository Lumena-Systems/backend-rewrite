/**
 * Payment Processor Service
 */

import prisma from '../utils/database';
import { externalValidator } from './externalValidator';

interface PaymentDetails {
  orderId: string;
  amount: number;
  paymentMethod: string;
  cardLast4?: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  message: string;
  fraudScore?: number;
}

export class PaymentProcessorService {
  /**
   * Process a payment with fraud check
   * This is the faulty deployment that caused the SEV.
   */
  async processPaymentWithFraudCheck(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: paymentDetails.orderId },
          include: {
            items: {
              include: { product: true }
            },
            user: true
          }
        });

        if (!order) {
          throw new Error('Order not found');
        }

        if (order.status !== 'PENDING') {
          throw new Error('Order is not in pending state');
        }

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          });
        }

        console.log('[PaymentProcessor] Validating with external fraud detection service...');
        const validationResult = await externalValidator.validateWithExternalSource({
          amount: paymentDetails.amount,
          paymentMethod: paymentDetails.paymentMethod,
          userId: order.userId,
          orderId: order.id
        });

        if (!validationResult.valid) {
          throw new Error(`Payment validation failed: ${validationResult.reason}`);
        }

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            amount: paymentDetails.amount,
            status: 'COMPLETED',
            paymentMethod: paymentDetails.paymentMethod,
            metadata: JSON.stringify({
              cardLast4: paymentDetails.cardLast4,
              fraudScore: validationResult.fraudScore,
              timestamp: new Date().toISOString()
            })
          }
        });

        return {
          payment,
          fraudScore: validationResult.fraudScore
        };
      });

      return {
        success: true,
        paymentId: result.payment.id,
        message: 'Payment processed successfully',
        fraudScore: result.fraudScore
      };
    } catch (error) {
      console.error('[PaymentProcessor] Payment processing failed:', error);
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Simple payment processing before the faulty deployment
   */
  async processPaymentSimple(paymentDetails: PaymentDetails): Promise<PaymentResult> {
    try {
      const payment = await prisma.payment.create({
        data: {
          orderId: paymentDetails.orderId,
          amount: paymentDetails.amount,
          status: 'COMPLETED',
          paymentMethod: paymentDetails.paymentMethod,
          metadata: JSON.stringify({
            cardLast4: paymentDetails.cardLast4,
            timestamp: new Date().toISOString()
          })
        }
      });

      return {
        success: true,
        paymentId: payment.id,
        message: 'Payment processed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });
  }
}

export const paymentProcessor = new PaymentProcessorService();

