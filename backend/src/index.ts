import express from 'express'
import cors from 'cors'
import { loadEnv } from './env.js'
import { authRouter } from './routes/auth.js'
import { classroomsRouter } from './routes/classrooms.js'
import { problemsRouter } from './routes/problems.js'
import { assignmentsRouter } from './routes/assignments.js'

const { port, frontendUrl } = loadEnv()

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      if (isLocalhost || origin === frontendUrl) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/classrooms', classroomsRouter)
app.use('/api/problems', problemsRouter)
app.use('/api/assignments', assignmentsRouter)

// Fallback to JSON for 404
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` })
})

// Error handler to prevent HTML responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' })
})

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
