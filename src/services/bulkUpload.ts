/**
 * Bulk Upload Service
 * 
 * CSV UPLOAD API DESIGN EXERCISE
 * 
 * Candidate task: Design a better API
 */

import prisma from '../utils/database';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

interface ProductRow {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
}

interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors: Array<{ row: number; error: string }>;
}

export class BulkUploadService {
  /**
   * Naive implementation
   */
  async uploadProductsCSV(fileBuffer: Buffer): Promise<BulkUploadResult> {
    const products: ProductRow[] = [];
    const errors: Array<{ row: number; error: string }> = [];
    let successCount = 0;
    let failureCount = 0;

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from(fileBuffer.toString());
      
      stream
        .pipe(csvParser())
        .on('data', (row: ProductRow) => {
          products.push(row);
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    console.log(`[BulkUpload] Processing ${products.length} products...`);

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      
      try {
        // Validate row
        this.validateProductRow(row, i + 1);

        // Insert into database
        await prisma.product.create({
          data: {
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            stockQuantity: parseInt(row.stockQuantity, 10)
          }
        });

        successCount++;
      } catch (error) {
        failureCount++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`[BulkUpload] Complete. Success: ${successCount}, Failures: ${failureCount}`);

    return {
      success: failureCount === 0,
      totalRows: products.length,
      successCount,
      failureCount,
      errors
    };
  }

  private validateProductRow(row: ProductRow, rowNumber: number): void {
    if (!row.name || row.name.trim() === '') {
      throw new Error(`Row ${rowNumber}: Product name is required`);
    }

    if (!row.price || isNaN(parseFloat(row.price))) {
      throw new Error(`Row ${rowNumber}: Invalid price`);
    }

    if (!row.stockQuantity || isNaN(parseInt(row.stockQuantity, 10))) {
      throw new Error(`Row ${rowNumber}: Invalid stock quantity`);
    }

    const price = parseFloat(row.price);
    if (price < 0) {
      throw new Error(`Row ${rowNumber}: Price cannot be negative`);
    }

    const stockQuantity = parseInt(row.stockQuantity, 10);
    if (stockQuantity < 0) {
      throw new Error(`Row ${rowNumber}: Stock quantity cannot be negative`);
    }
  }

  /**
   * Helper to generate a sample CSV for testing
   */
  generateSampleCSV(rows: number): string {
    let csv = 'name,description,price,stockQuantity\n';
    
    for (let i = 1; i <= rows; i++) {
      csv += `Product ${i},Description for product ${i},${(Math.random() * 100).toFixed(2)},${Math.floor(Math.random() * 100)}\n`;
    }
    
    return csv;
  }
}

export const bulkUpload = new BulkUploadService();

