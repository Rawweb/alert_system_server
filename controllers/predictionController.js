import Product from '../models/Product.js';
import Alert from '../models/Alert.js';

// @desc    Run ML prediction on all products and save risk statuses
// @route   POST /api/predictions/run
// @access  Private
export const runPrediction = async (req, res, next) => {
  try {
    const products = await Product.find().select('_id expiryDate');

    if (products.length === 0) {
      return res.status(400).json({
        message: 'There are no products to run predictions on',
      });
    }

    const payload = { products: [] };

    for (const product of products) {
      payload.products.push({
        id: product._id.toString(), // ObjectId becomes plain text
        expiryDate: product.expiryDate.toISOString(), // Date becomes ISO text
      });
    }

    const mlResponse = await fetch(`${process.env.ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!mlResponse.ok) {
      return res.status(502).json({
        message: 'The prediction service returned an error',
      });
    }

    const data = await mlResponse.json();
    const summary = { expired: 0, critical: 0, warning: 0, safe: 0 };
    let alertsCreated = 0;

    for (const result of data.results) {
      await Product.updateOne(
        { _id: result.id }, // which product
        { riskStatus: result.riskStatus }, // what to change
      );

      summary[result.riskStatus] = summary[result.riskStatus] + 1;

      // Alert generation: only the dangerous categories
      if (
        result.riskStatus === 'critical' ||
        result.riskStatus === 'expired' ||
        result.riskStatus === 'warning'
      ) {
        const existingAlert = await Alert.findOne({
          product: result.id,
          riskStatus: result.riskStatus,
          isRead: false,
        });

        if (!existingAlert) {
          // Fetch the product's name to build a readable message
          const product = await Product.findById(result.id).select('name batchNumber');

          let message = '';
          if (result.riskStatus === 'expired') {
            message = `${product.name} (batch ${product.batchNumber}) expired ${Math.abs(result.daysToExpiry)} day(s) ago. Remove it from inventory.`;
          } else if (result.riskStatus === 'critical') {
            message = `${product.name} (batch ${product.batchNumber}) expires in ${result.daysToExpiry} day(s). Take action now.`;
          } else {
            message = `${product.name} (batch ${product.batchNumber}) expires in ${result.daysToExpiry} day(s). Plan ahead.`;
          }

          await Alert.create({
            product: result.id,
            riskStatus: result.riskStatus,
            daysToExpiry: result.daysToExpiry,
            message,
          });

          alertsCreated = alertsCreated + 1;
        }
      }
    }

    res.status(200).json({
      message: 'Prediction completed successfully',
      totalProductsClassified: data.results.length,
      alertsCreated,
      summary,
    });
  } catch (error) {
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'The prediction service is not running. Start the ML service and try again.',
      });
    }
    next(error);
  }
};
