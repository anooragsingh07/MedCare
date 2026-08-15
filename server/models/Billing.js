import mongoose from 'mongoose'

const { Schema } = mongoose

const medicineItemSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      minlength: [1, 'Medicine name is required'],
      maxlength: [120, 'Medicine name is too long'],
    },
    qty: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
  },
  { _id: false },
)

const billingSchema = new Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Patient name must be at least 2 characters'],
      maxlength: [120, 'Patient name is too long'],
    },
    collegeId: {
      type: String,
      required: [true, 'College ID is required'],
      trim: true,
      minlength: [1, 'College ID is required'],
      maxlength: [64, 'College ID is too long'],
    },
    category: {
      type: String,
      enum: {
        values: ['student', 'teacher'],
        message: '{VALUE} is not a valid category',
      },
      default: 'student',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      minlength: [1, 'Department is required'],
      maxlength: [120, 'Department name is too long'],
    },
    medicineItems: {
      type: [medicineItemSchema],
      default: [],
    },
    /** Total value borne by the dispensary (care is free for college members). */
    costAmount: {
      type: Number,
      required: [true, 'Total cost is required'],
      min: [0, 'Total cost cannot be negative'],
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Note is too long'],
    },
  },
  { timestamps: true },
)

billingSchema.pre('validate', function computeCost(next) {
  if (Array.isArray(this.medicineItems) && this.medicineItems.length > 0) {
    const total = this.medicineItems.reduce(
      (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.cost) || 0),
      0,
    )
    this.costAmount = Number(total.toFixed(2))
  }
  next()
})

billingSchema.index({ createdAt: -1, collegeId: 1 })

export default mongoose.models.Billing || mongoose.model('Billing', billingSchema)