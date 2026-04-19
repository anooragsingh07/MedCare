import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import './models/index.js'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: false,
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState
  const dbLabel = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown'

  res.json({
    ok: true,
    service: 'MedCare API',
    database: dbLabel,
    timestamp: new Date().toISOString(),
  })
})

async function start() {
  try {
    await connectDB()
  } catch {
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log(`MedCare API listening on http://localhost:${PORT}`)
  })
}

start()
