import mongoose from 'mongoose'

/** Fail fast instead of buffering commands for 10s when disconnected */
mongoose.set('bufferCommands', false)
mongoose.set('strictQuery', true)

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

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8_000,
      socketTimeoutMS: 45_000,
    })
    console.log('[db] MongoDB connected')
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
    throw err
  }
}
