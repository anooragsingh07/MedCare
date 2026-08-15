import mongoose from 'mongoose'

const { Schema } = mongoose

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Medicine name must be at least 2 characters'],
      maxlength: [120, 'Medicine name is too long'],
    },
    category: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Category is too long'],
    },
    unit: {
      type: String,
      trim: true,
      default: 'strip',
      maxlength: [30, 'Unit is too long'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

medicineSchema.index({ name: 1 })
medicineSchema.index({ stock: 1, reorderLevel: 1 })

export default mongoose.models.Medicine || mongoose.model('Medicine', medicineSchema)