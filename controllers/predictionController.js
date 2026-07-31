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
    const secret = req.headers['x-cron-secret'];

    if (!secret || secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: 'Unauthorised' });
    }

    // Respond immediately so cron-job.org does not timeout.
    // 202 Accepted means "request received, work is starting."
    // The pipeline runs in the background after this line.
    res.status(202).json({ message: 'Prediction job accepted and running' });

    // Fire and forget: no await before responding.
    // Node.js keeps running this after the response is sent.
    runPredictionPipeline()
      .then((result) => {
        console.log(
          `[scheduled] Complete at ${new Date().toISOString()}. ` +
            `Classified: ${result.totalProductsClassified}, ` +
            `Alerts: ${result.alertsCreated}, ` +
            `Email: ${result.emailSent}`,
        );
      })
      .catch((error) => {
        console.error(`[scheduled] Failed: ${error.message}`);
      });
  } catch (error) {
    console.error(`[scheduled] Setup failed: ${error.message}`);
    next(error);
  }
};