import mongoose from 'mongoose'

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 * Server can still run without a URI for local UI work; set MONGODB_URI for persistence.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[db] MONGODB_URI is not set — API runs without database')
    return
  }

  mongoose.set('strictQuery', true)

  try {
    await mongoose.connect(uri)
    console.log('[db] MongoDB connected')
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
    throw err
  }
}
