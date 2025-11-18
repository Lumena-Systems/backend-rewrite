/**
 * Order Fulfillment Service
 * 
 * MAIN OBSERVABILITY EXERCISE
 * 
 * This service handles the critical path of fulfilling an order after payment.
 * It has multiple stages that need proper observability.
 * 
 * Current state: NO observability - no logs, metrics, or alerts
 * 
 * Candidate task:
 * - Add comprehensive logging at each stage
 * - Add essential metrics
 * - Add alerting for failure scenarios
 * - Consider what happens when each stage fails
 * 
 * Use the ObservabilityService (observability.ts) or create your own implementation.
 * Pseudo-code is acceptable.
 */

import prisma from '../utils/database';

interface FulfillmentResult {
  success: boolean;
  orderId: string;
  message: string;
  trackingNumber?: string;
}

export class OrderFulfillmentService {
  /**
   * Main fulfillment pipeline
   * TODO (for candidate): Add observability
   */
  async fulfillOrder(orderId: string): Promise<FulfillmentResult> {
    try {
      // Stage 1: Validate Order
      const order = await this.validateOrder(orderId);
      
      // Stage 2: Check Inventory Availability
      await this.checkInventoryAvailability(order);
      
      // Stage 3: Reserve Inventory
      await this.reserveInventory(order);
      
      // Stage 4: Process Payment (validate payment was successful)
      await this.validatePayment(order);
      
      // Stage 5: Update Order Status
      await this.updateOrderStatus(orderId, 'PROCESSING');
      
      // Stage 6: Create Shipment
      const shipment = await this.createShipment(order);
      
      // Stage 7: Send Confirmation Email
      await this.sendConfirmationEmail(order, shipment.trackingNumber);
      
      // Stage 8: Update Analytics
      await this.updateAnalytics(order);
      
      return {
        success: true,
        orderId,
        message: 'Order fulfilled successfully',
        trackingNumber: shipment.trackingNumber
      };
    } catch (error) {
      return {
        success: false,
        orderId,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async validateOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: true,
        payments: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Order is not in pending state. Current status: ${order.status}`);
    }

    if (order.items.length === 0) {
      throw new Error('Order has no items');
    }

    return order;
  }

  private async checkInventoryAvailability(order: any) {
    for (const item of order.items) {
      if (item.product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient inventory for product ${item.product.name}. ` +
          `Requested: ${item.quantity}, Available: ${item.product.stockQuantity}`
        );
      }
    }
  }

  private async reserveInventory(order: any) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minute reservation

    for (const item of order.items) {
      // Create reservation record
      await prisma.inventoryReservation.create({
        data: {
          productId: item.productId,
          orderId: order.id,
          quantity: item.quantity,
          expiresAt
        }
      });

      // Decrement stock
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      });
    }
  }

  private async validatePayment(order: any) {
    const payments = order.payments;
    const successfulPayment = payments.find((p: any) => p.status === 'COMPLETED');

    if (!successfulPayment) {
      throw new Error('No successful payment found for order');
    }

    if (successfulPayment.amount !== order.total) {
      throw new Error(
        `Payment amount mismatch. Expected: ${order.total}, Got: ${successfulPayment.amount}`
      );
    }
  }

  private async updateOrderStatus(orderId: string, status: string) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }

  private async createShipment(order: any) {
    // Simulate calling external shipping provider API
    const trackingNumber = this.generateTrackingNumber();
    
    // Simulate API delay
    await this.sleep(500);

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        trackingNumber,
        carrier: 'FedEx',
        status: 'PROCESSING'
      }
    });

    return shipment;
  }

  private async sendConfirmationEmail(order: any, trackingNumber?: string) {
    // Simulate calling email service API
    await this.sleep(300);
    
    // In real implementation, this would call an email service
    console.log(`Email sent to ${order.user.email} for order ${order.id}`);
  }

  private async updateAnalytics(order: any) {
    // Simulate recording analytics events
    await this.sleep(100);
    
    // In real implementation, this would send events to analytics platform
    console.log(`Analytics updated for order ${order.id}`);
  }

  private generateTrackingNumber(): string {
    return `TRK${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const orderFulfillment = new OrderFulfillmentService();

