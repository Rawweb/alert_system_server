import Product from '../models/Product.js';
import Alert from '../models/Alert.js';

const CATEGORIES = [
  'Food and Beverages',
  'Pharmaceuticals and Medications',
  'Cosmetics and Personal Care',
  'Household and Chemical Products',
];

// @desc    Overall system summary (the dashboard stat cards)
// @route   GET /api/reports/summary
// @access  Private
export const getSummary = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();

    const expired = await Product.countDocuments({ riskStatus: 'expired' });
    const critical = await Product.countDocuments({ riskStatus: 'critical' });
    const warning = await Product.countDocuments({ riskStatus: 'warning' });
    const safe = await Product.countDocuments({ riskStatus: 'safe' });
    const unclassified = await Product.countDocuments({ riskStatus: 'unclassified' });

    const unreadAlerts = await Alert.countDocuments({ isRead: false });

    res.status(200).json({
      totalProducts,
      byRiskStatus: { expired, critical, warning, safe, unclassified },
      unreadAlerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Product counts per category, split by risk (the bar chart)
// @route   GET /api/reports/by-category
// @access  Private
export const getByCategory = async (req, res, next) => {
  try {
    const breakdown = [];

    for (const category of CATEGORIES) {
      const total = await Product.countDocuments({ category });
      const expired = await Product.countDocuments({ category, riskStatus: 'expired' });
      const critical = await Product.countDocuments({ category, riskStatus: 'critical' });
      const warning = await Product.countDocuments({ category, riskStatus: 'warning' });
      const safe = await Product.countDocuments({ category, riskStatus: 'safe' });

      breakdown.push({ category, total, expired, critical, warning, safe });
    }

    res.status(200).json({ breakdown });
  } catch (error) {
    next(error);
  }
};

// @desc    Products expiring within N days (the action list)
// @route   GET /api/reports/expiring-soon?days=30
// @access  Private
export const getExpiringSoon = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days); // today + N days

    const products = await Product.find({
      expiryDate: { $gte: now, $lte: cutoff },
    }).sort({ expiryDate: 1 });

    res.status(200).json({
      windowInDays: days,
      total: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download the full inventory as a CSV file
// @route   GET /api/reports/download
// @access  Private
export const downloadReport = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ expiryDate: 1 });
    
    let csv =
      'Name,Category,Manufacturer,Batch Number,Manufacturing Date,Expiry Date,Quantity,Storage Location,Risk Status\n';

    for (const p of products) {
      // Wrap text fields in quotes so commas inside values
      // (e.g. "Food and Beverages") don't break the columns
      csv =
        csv +
        `"${p.name}","${p.category}","${p.manufacturer}","${p.batchNumber}",` +
        `"${p.manufacturingDate.toISOString().split('T')[0]}",` +
        `"${p.expiryDate.toISOString().split('T')[0]}",` +
        `${p.quantity},"${p.storageLocation}","${p.riskStatus}"\n`;
    }

    // These two headers are what make the browser DOWNLOAD a file
    // instead of displaying text
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=expiry-report-${new Date().toISOString().split('T')[0]}.csv`,
    );

    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};
