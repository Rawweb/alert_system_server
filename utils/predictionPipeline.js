import Product from '../models/Product.js';
import Alert from '../models/Alert.js';
import sendEmail from './sendEmail.js';
import { alertSummaryTemplate } from './emailTemplate.js';

// The complete prediction pipeline: classify all products, raise
// alerts, send the summary email. Used by BOTH the API endpoint
// and the daily scheduler. Returns a result object; throws on
// failure and lets the caller decide how to report it.
export const runPredictionPipeline = async () => {
  const products = await Product.find().select('_id expiryDate');

  if (products.length === 0) {
    return {
      totalProductsClassified: 0,
      alertsCreated: 0,
      emailSent: false,
      summary: { expired: 0, critical: 0, warning: 0, safe: 0 },
    };
  }

  const payload = { products: [] };

  for (const product of products) {
    payload.products.push({
      id: product._id.toString(),
      expiryDate: product.expiryDate.toISOString(),
    });
  }

  const mlResponse = await fetch(`${process.env.ML_SERVICE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!mlResponse.ok) {
    throw new Error('The prediction service returned an error');
  }

  const data = await mlResponse.json();
  const summary = { expired: 0, critical: 0, warning: 0, safe: 0 };
  let alertsCreated = 0;
  const emailItems = [];

  for (const result of data.results) {
    await Product.updateOne({ _id: result.id }, { riskStatus: result.riskStatus });

    summary[result.riskStatus] = summary[result.riskStatus] + 1;

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
        emailItems.push({ message: message, riskStatus: result.riskStatus });
      }
    }
  }

  let emailSent = false;

  if (alertsCreated > 0) {
    emailSent = await sendEmail({
      subject: `Expiry Alert: ${alertsCreated} product(s) need attention`,
      html: alertSummaryTemplate(emailItems),
    });
  }

  return {
    totalProductsClassified: data.results.length,
    alertsCreated,
    emailSent,
    summary,
  };
};
