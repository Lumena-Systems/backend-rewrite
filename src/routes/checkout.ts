/**
 * Checkout Routes
 * 
 * Handles checkout process
 */

import { Router } from 'express';
import { checkoutService } from '../services/checkoutService';
import { discountService } from '../services/discountService';

const router = Router();

/**
 * POST /api/checkout
 * 
 * Process a checkout request
 * 
 */
router.post('/', async (req, res) => {
  const { userId, items, paymentMethod, cardLast4 } = req.body;
  
  if (!userId || !items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
    return res.status(400).json({
      error: 'Missing required fields: userId, items (array), paymentMethod'
    });
  }
  
  const result = await checkoutService.checkout({
    userId,
    items,
    paymentMethod,
    cardLast4
  });
  
  if (result.success) {
    res.status(201).json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * POST /api/checkout/:orderId/apply-coupon
 * 
 * POST-MORTEM EXERCISE ENDPOINT
 * Apply a discount coupon to an order
 * 
 * This endpoint has a bug in the discount calculation.
 */
router.post('/:orderId/apply-coupon', async (req, res) => {
  const { orderId } = req.params;
  const { couponCode } = req.body;
  
  if (!couponCode) {
    return res.status(400).json({ error: 'Missing required field: couponCode' });
  }
  
  try {
    const result = await discountService.applyCoupon(orderId, couponCode);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to apply coupon'
    });
  }
});

/**
 * GET /api/checkout/coupons
 * 
 * Get all active coupons
 */
router.get('/coupons', async (req, res) => {
  const coupons = await discountService.getActiveCoupons();
  res.json(coupons);
});

/**
 * POST /api/checkout/coupons
 * 
 * Create a new coupon (for testing)
 */
router.post('/coupons', async (req, res) => {
  const { code, discount, description, expiresAt } = req.body;
  
  if (!code || discount === undefined) {
    return res.status(400).json({ error: 'Missing required fields: code, discount' });
  }
  
  try {
    const coupon = await discountService.createCoupon(
      code,
      discount,
      description,
      expiresAt ? new Date(expiresAt) : undefined
    );
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to create coupon'
    });
  }
});

export default router;

