/**
 * Products Routes
 * 
 * Handles product management including bulk CSV upload
 */

import { Router } from 'express';
import multer from 'multer';
import { bulkUpload } from '../services/bulkUpload';
import prisma from '../utils/database';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * GET /api/products
 * 
 * List all products
 */
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(products);
});

/**
 * GET /api/products/:productId
 * 
 * Get product details
 */
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  res.json(product);
});

/**
 * POST /api/products
 * 
 * Create a new product
 */
router.post('/', async (req, res) => {
  const { name, description, price, stockQuantity } = req.body;
  
  if (!name || price === undefined || stockQuantity === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: name, price, stockQuantity'
    });
  }
  
  const product = await prisma.product.create({
    data: {
      name,
      description: description || '',
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10)
    }
  });
  
  res.status(201).json(product);
});

/**
 * POST /api/products/bulk-upload
 * 
 * CSV UPLOAD EXERCISE ENDPOINT
 * Upload products via CSV file
 * 
 */
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const result = await bulkUpload.uploadProductsCSV(req.file.buffer);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(207).json(result); // 207 Multi-Status for partial success
  }
});

/**
 * GET /api/products/sample-csv/:rows
 * 
 * Generate a sample CSV for testing
 */
router.get('/sample-csv/:rows', (req, res) => {
  const rows = parseInt(req.params.rows, 10) || 10;
  const csv = bulkUpload.generateSampleCSV(rows);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=sample-${rows}-products.csv`);
  res.send(csv);
});

export default router;

