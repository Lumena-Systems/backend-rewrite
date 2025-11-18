/**
 * External Validator Service
 * 
 * This simulates an external fraud detection / payment validation API.
 */

interface ValidationResult {
  valid: boolean;
  fraudScore: number;
  reason?: string;
}

interface PaymentDetails {
  amount: number;
  paymentMethod: string;
  userId: string;
  orderId: string;
}

export class ExternalValidatorService {
  private baseDelay: number;
  
  constructor(baseDelayMs: number = 2000) {
    this.baseDelay = baseDelayMs;
  }

  /**
   * Validates payment details with an external fraud detection service
   */
  async validateWithExternalSource(paymentDetails: PaymentDetails): Promise<ValidationResult> {
    console.log('[ExternalValidator] Calling external fraud detection API...', {
      orderId: paymentDetails.orderId,
      amount: paymentDetails.amount
    });

    // Simulate network delay (2-5 seconds)
    const delay = this.baseDelay + Math.random() * 3000;
    await this.sleep(delay);

    // Simulate occasional slow responses (10% chance of 15-30 second delay)
    if (Math.random() < 0.1) {
      console.log('[ExternalValidator] Slow response detected, waiting...');
      await this.sleep(15000 + Math.random() * 15000);
    }

    // Simple fraud detection logic
    const fraudScore = this.calculateFraudScore(paymentDetails);
    const valid = fraudScore < 0.7;

    console.log('[ExternalValidator] Validation complete', {
      orderId: paymentDetails.orderId,
      fraudScore,
      valid
    });

    return {
      valid,
      fraudScore,
      reason: valid ? undefined : 'High fraud score detected'
    };
  }

  private calculateFraudScore(details: PaymentDetails): number {
    // Simple heuristic: higher amounts = slightly higher fraud score
    let score = 0.1;
    
    if (details.amount > 1000) {
      score += 0.2;
    }
    if (details.amount > 5000) {
      score += 0.3;
    }
    
    // Add some randomness
    score += Math.random() * 0.3;
    
    return Math.min(score, 1.0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * For testing: set a custom base delay
   */
  setBaseDelay(delayMs: number): void {
    this.baseDelay = delayMs;
  }
}

export const externalValidator = new ExternalValidatorService();

