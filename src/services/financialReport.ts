import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class FinancialReportGenerator {
  
  /**
   * Generates a monthly financial report, converts currencies, 
   * saves it to disk, and attempts to upload it to a backup server.
   * 
   * PROBLEM: This function is nearly impossible to test because:
   * 1. It depends on the actual filesystem (fs.writeFileSync)
   * 2. It depends on an external API (fetch to exchange rates)
   * 3. It depends on the current date (new Date)
   * 4. It depends on the database (Prisma)
   */
  async generateMonthlyReport(month: number, year: number): Promise<string> {
    // 1. Get all orders for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: true
      }
    });

    // 2. Get current exchange rates to normalize to USD
    // This call will fail in a test environment without network
    const exchangeRateResponse = await fetch('https://api.exchangeratesapi.io/latest?base=USD');
    if (!exchangeRateResponse.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    const rates = await exchangeRateResponse.json();

    let totalSales = 0;
    let totalItems = 0;

    // 3. Calculate stats
    for (const order of orders) {
      // Simulate some currency conversion logic based on hardcoded region mapping
      // (In reality this would be more complex)
      let multiplier = 1;
      if (order.userId.startsWith('EU')) {
        multiplier = 1 / rates.rates.EUR; 
      } else if (order.userId.startsWith('GB')) {
        multiplier = 1 / rates.rates.GBP;
      }

      totalSales += order.total * multiplier;
      totalItems += order.items.length;
    }

    // 4. Generate Report Content
    const reportDate = new Date(); // Hard dependency on current time
    const reportContent = `
      FINANCIAL REPORT
      ----------------
      Generated: ${reportDate.toISOString()}
      Period: ${month}/${year}
      
      Total Orders: ${orders.length}
      Total Items: ${totalItems}
      Total Sales (USD): $${totalSales.toFixed(2)}
    `;

    // 5. Write to filesystem
    // This writes to the actual disk, which is bad for tests
    const filename = `report-${year}-${month}-${Date.now()}.txt`;
    const filePath = path.join(__dirname, '../../reports', filename);
    
    // Ensure directory exists
    const reportDir = path.dirname(filePath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(filePath, reportContent);

    console.log(`Report generated at ${filePath}`);
    return filePath;
  }
}

