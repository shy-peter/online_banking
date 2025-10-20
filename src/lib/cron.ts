import { processDailyEarnings } from './earnings';

// Simple cron-like scheduler for daily earnings processing
export class CronService {
  private static instance: CronService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  // Start the daily earnings processing cron job
  public startDailyEarningsCron(): void {
    if (this.isRunning) {
      console.log('Daily earnings cron is already running');
      return;
    }

    console.log('Starting daily earnings cron job...');
    this.isRunning = true;

    // Run immediately on start
    this.processEarnings();

    // Then run every 24 hours (86400000 ms)
    this.intervalId = setInterval(() => {
      this.processEarnings();
    }, 24 * 60 * 60 * 1000);
  }

  // Stop the cron job
  public stopDailyEarningsCron(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Daily earnings cron job stopped');
  }

  // Process earnings manually
  private async processEarnings(): Promise<void> {
    try {
      console.log('Processing daily earnings...');
      const result = await processDailyEarnings();
      
      if (result.success) {
        console.log(`✅ Daily earnings processed successfully: ${result.processed} records`);
      } else {
        console.error(`❌ Error processing daily earnings: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Unexpected error in daily earnings processing:', error);
    }
  }

  // Get cron status
  public getStatus(): { isRunning: boolean; nextRun?: Date } {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
    };
  }

  // Force run earnings processing (for testing)
  public async forceRunEarnings(): Promise<{ success: boolean; processed: number; error?: string }> {
    return await processDailyEarnings();
  }
}

// Initialize cron service when the module is imported
export const cronService = CronService.getInstance();

// Auto-start the cron job in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  cronService.startDailyEarningsCron();
}
