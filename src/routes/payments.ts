/**
 * Payments Routes
 * 
 */

import { Router } from 'express';
import { paymentProcessor } from '../services/paymentProcessor';

const router = Router();

/**
 * POST /api/payments/process
 * 
 * Process a payment with fraud check
 * 
 * Issue: A new backend deployment changed up our payment processing pipeline.
 * However, it seemed to cause a SEV where all database connections were maxed out.
 * All requests, including non-payment related ones, to the DB hang indefinitely.
 */
router.post('/process', async (req, res) => {
  const { orderId, amount, paymentMethod, cardLast4 } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({
      error: 'Missing required fields: orderId, amount, paymentMethod'
    });
  }
  
  const result = await paymentProcessor.processPaymentWithFraudCheck({
    orderId,
    amount: parseFloat(amount),
    paymentMethod,
    cardLast4
  });
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * POST /api/payments/process-simple
 * 
 * Simple payment processing without fraud check (for comparison)
 */
router.post('/process-simple', async (req, res) => {
  const { orderId, amount, paymentMethod, cardLast4 } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({
      error: 'Missing required fields: orderId, amount, paymentMethod'
    });
  }
  
  const result = await paymentProcessor.processPaymentSimple({
    orderId,
    amount: parseFloat(amount),
    paymentMethod,
    cardLast4
  });
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

/**
 * GET /api/payments/:paymentId
 * 
 * Get payment status
 */
router.get('/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  
  const payment = await paymentProcessor.getPaymentStatus(paymentId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  res.json(payment);
});

export default router;

