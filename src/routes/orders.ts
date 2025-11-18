/**
 * Orders Routes
 * 
 * Handles order-related endpoints including the main fulfillment pipeline
 */

import { Router } from 'express';
import { orderFulfillment } from '../services/orderFulfillment';
import { checkoutService } from '../services/checkoutService';

const router = Router();

/**
 * POST /api/orders/:orderId/fulfill
 * 
 * Main observability exercise endpoint
 * Fulfills an order through the complete pipeline
 */
router.post('/:orderId/fulfill', async (req, res) => {
  const { orderId } = req.params;
  
  const result = await orderFulfillment.fulfillOrder(orderId);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * GET /api/orders/:orderId
 * 
 * Get order details
 */
router.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  const order = await checkoutService.getOrder(orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json(order);
});

/**
 * GET /api/orders/user/:userId
 * 
 * Get all orders for a user
 */
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const orders = await checkoutService.getUserOrders(userId);
  res.json(orders);
});

export default router;

