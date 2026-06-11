import cron from 'node-cron';
import { runPredictionPipeline } from './predictionPipeline.js';

// Starts the daily prediction schedule. Called once from server.js
// after the database connects.
export const startScheduler = () => {
  // ┌──────── minute (0)
  // │ ┌────── hour (7)
  // │ │ ┌──── day of month (every)
  // │ │ │ ┌── month (every)
  // │ │ │ │ ┌ day of week (every)
  // 0 7 * * *   =  every day at 7:00 AM
  cron.schedule(
    '0 7 * * *',
    async () => {
      console.log(`[scheduler] Daily prediction run starting: ${new Date().toISOString()}`);

      try {
        const result = await runPredictionPipeline();
        console.log(
          `[scheduler] Run complete. Classified: ${result.totalProductsClassified}, ` +
            `new alerts: ${result.alertsCreated}, email sent: ${result.emailSent}`,
        );
      } catch (error) {
        // A failed scheduled run must NEVER crash the server.
        // Log it; tomorrow's run will try again.
        console.error(`[scheduler] Run failed: ${error.message}`);
      }
    },
    {
      timezone: 'Africa/Lagos',
    },
  );

  console.log('[scheduler] Daily prediction job scheduled for 7:00 AM (Africa/Lagos)');
};
