import mongoose from 'mongoose';

const CATEGORIES = [
  'Food and Beverages',
  'Pharmaceuticals and Medications',
  'Cosmetics and Personal Care',
  'Household and Chemical Products',
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES,
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },
    manufacturingDate: {
      type: Date,
      required: [true, 'Manufacturing date is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    storageLocation: {
      type: String,
      required: [true, 'Storage location is required'],
      trim: true,
    },
    
    batchNumber: {
      type: String,
      required: [true, 'Batch number is required'],
      trim: true,
    },
    // Filled in later by the machine learning prediction module.
    // Until a prediction runs, a product is simply 'unclassified'.
    riskStatus: {
      type: String,
      enum: ['safe', 'warning', 'critical', 'expired', 'unclassified'],
      default: 'unclassified',
    },
    // Which admin registered this product. Links to the User collection.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

productSchema.index(
  { name: 1, manufacturer: 1, batchNumber: 1 },
  { unique: true },
);

const Product = mongoose.model('Product', productSchema);
export default Product;
