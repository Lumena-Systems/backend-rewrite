/**
 * Observability Service
 * 
 * This is a simple interface for logging, metrics, and alerting.
 * In the interview, candidates should use this interface (or create their own)
 * to add comprehensive observability to the order fulfillment pipeline.
 * 
 */

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

interface LogMetadata {
  [key: string]: any;
}

interface MetricTags {
  [key: string]: string | number;
}

export class ObservabilityService {
  /**
   * Log a message with structured metadata
   */
  log(level: LogLevel, stage: string, message: string, metadata?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      stage,
      message,
      ...metadata
    };
    
    console.log(JSON.stringify(logEntry));
  }

  logInfo(stage: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, stage, message, metadata);
  }

  logWarn(stage: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, stage, message, metadata);
  }

  logError(stage: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, stage, message, metadata);
  }

  logDebug(stage: string, message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, stage, message, metadata);
  }

  /**
   * Record a metric value
   * In production, this would send to DataDog, Prometheus, etc.
   */
  recordMetric(name: string, value: number, tags?: MetricTags): void {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      type: 'metric',
      timestamp,
      name,
      value,
      tags
    }));
  }

  /**
   * Trigger an alert based on a condition
   * In production, this would integrate with PagerDuty, OpsGenie, etc.
   */
  triggerAlert(condition: string, severity: AlertSeverity, message: string, metadata?: LogMetadata): void {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      type: 'alert',
      timestamp,
      condition,
      severity,
      message,
      ...metadata
    }));
  }

  /**
   * Start timing an operation
   * Returns a function to call when the operation completes
   */
  startTimer(operationName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(`${operationName}.duration_ms`, duration, {
        operation: operationName
      });
    };
  }
}

// Export a singleton instance
export const observability = new ObservabilityService();

