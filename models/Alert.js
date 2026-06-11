import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    riskStatus: {
      type: String,
      enum: ['warning', 'critical', 'expired'],
      required: true,
    },

    daysToExpiry: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
