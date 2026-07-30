import { runPredictionPipeline } from '../utils/predictionPipeline.js';

// @desc    Run ML prediction on all products and save risk statuses
// @route   POST /api/predictions/run
// @access  Private
export const runPrediction = async (req, res, next) => {
  try {
    const result = await runPredictionPipeline();

    res.status(200).json({
      message: 'Prediction completed successfully',
      ...result,
    });
  } catch (error) {
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message:
          'The prediction service is not running. Start the ML service and try again.',
      });
    }
    next(error);
  }
};


// @desc    Scheduled prediction trigger (cron-job.org)
// @route   POST /api/predictions/run-scheduled
// @access  Cron secret header only
export const runScheduled = async (req, res, next) => {
  try {
    // Check the secret header before doing anything
    const secret = req.headers['x-cron-secret'];

    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: 'Unauthorised' });
    }

    const result = await runPredictionPipeline();

    console.log(
      `[scheduled] Run complete at ${new Date().toISOString()}. ` +
        `Classified: ${result.totalProductsClassified}, ` +
        `Alerts: ${result.alertsCreated}, ` +
        `Email: ${result.emailSent}`,
    );

    // Return 200 so cron-job.org knows the job succeeded
    res.status(200).json({
      message: 'Scheduled prediction completed',
      ...result,
    });
  } catch (error) {
    console.error(`[scheduled] Failed: ${error.message}`);
    next(error);
  }
};