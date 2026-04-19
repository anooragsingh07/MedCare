import mongoose from 'mongoose'

const { Schema } = mongoose

const billingSchema = new Schema(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Patient name must be at least 2 characters'],
      maxlength: [120, 'Patient name is too long'],
    },
    medicinesCost: {
      type: Number,
      required: [true, 'Medicines cost is required'],
      min: [0, 'Medicines cost cannot be negative'],
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: {
        values: ['Pending', 'Paid', 'Partially paid', 'Overdue'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
    },
  },
  { timestamps: true },
)

billingSchema.pre('validate', function billingTotals(next) {
  if (
    this.medicinesCost != null &&
    this.consultationFee != null &&
    this.totalAmount != null
  ) {
    const expected = Number((this.medicinesCost + this.consultationFee).toFixed(2))
    const actual = Number(this.totalAmount.toFixed(2))
    if (expected !== actual) {
      this.invalidate('totalAmount', 'totalAmount must equal medicinesCost + consultationFee')
    }
  }
  next()
})

billingSchema.index({ paymentStatus: 1, createdAt: -1 })

export default mongoose.models.Billing || mongoose.model('Billing', billingSchema)
