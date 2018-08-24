import http from "http"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import bodyParser from "body-parser"
import bugsnag from "bugsnag"
import config from "config"

import api from "./routes"
import metrics from "./metrics"
import { logger } from "../lib/util"

const app = express()
app.server = http.createServer(app)

// Measure time of each request and send data to SignalFXCollector
app.use(metrics)

app.use(bugsnag.requestHandler)

// logger
app.use(morgan("dev"))

// 3rd party middleware
app.use(
  cors({
    exposedHeaders: config.get("api.corsHeaders")
  })
)

app.use(
  bodyParser.json({
    limit: config.get("api.bodyLimit")
  })
)

// api router
app.use("/api/v0", api)

app.use(bugsnag.errorHandler)

// Error middleware
// eslint-disable-next-line no-unused-vars
app.use((err, { url, body }, res, next) => {
  // We are logging a warn here, but the error will be sent to Bugsnag because of the
  // `bugsnag.errorHandler` above. If `logger.error` is used, the error gets duplicated on Bugsnag.
  logger.warn(err, { url, body })
  res.status(500).json({ success: false, error: err.message, body })
})

export default app
