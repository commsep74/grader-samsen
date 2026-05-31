import express from 'express'
import cors from 'cors'
import { loadEnv } from './env.js'
import { authRouter } from './routes/auth.js'
import { classroomsRouter } from './routes/classrooms.js'

const { port, frontendUrl } = loadEnv()

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin)
      if (isLocalhost || origin === frontendUrl) {
        callback(null, true)
        return
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/classrooms', classroomsRouter)

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`)
})
