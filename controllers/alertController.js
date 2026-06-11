import Alert from '../models/Alert.js';

// @desc  Get all alerts, newest first (optionally only unread)
// @route GET /api/alerts or /api/alerts?unread=true
// @access  Private
export const getAlerts = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.unread === 'true') {
      filter.isRead = false;
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .populate('product', 'name category batchNumber expiryDate riskStatus');

    res.status(200).json({
      total: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Count unread alerts (for the dashboard badge)
// @route   GET /api/alerts/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Alert.countDocuments({ isRead: false });
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark one alert as read
// @route   PATCH /api/alerts/:id/read
// @access  Private
export const markAlertAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({ message: 'Alert marked as read', alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark ALL alerts as read
// @route   PATCH /api/alerts/read-all
// @access  Private
export const markAllAlertsAsRead = async (req, res, next) => {
  try {
    const result = await Alert.updateMany({ isRead: false }, { isRead: true });

    res.status(200).json({
      message: 'All alerts marked as read',
      alertsUpdated: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
