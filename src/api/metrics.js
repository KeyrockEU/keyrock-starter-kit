import sfx from "../lib/signalfx"

function successful(statusCode) {
  return String(statusCode).startsWith("2")
}

// Express middleware that sends to SignalFXCollector some data regarding a single request:
// - A counter indicating a request has been made
// - A counter indicating if the request has been or not successful (status code 2xx)
// - A gauge with the run time of the request
export default function metrics(req, res, next) {
  const start = Date.now()

  res.once("finish", () => {
    const dimensions = { endpoint: req.endpointID, exchange: req.body.exchange }

    // Increment request counter (useful to calculate requests per unit of time)
    sfx.counter("express_request", 1, dimensions)

    // Send if the request has been or not successful (useful to calculate error rate)
    sfx.counter(`express_request_${successful(res.statusCode) ? "success" : "failed"}`, 1, dimensions)

    // Send how much time the request took
    sfx.gauge("express_request_runtime", Date.now() - start, dimensions)
  })

  next()
}

export function endpointID(id) {
  return function endpointIDMiddleware(req, res, next) {
    req.endpointID = id
    next()
  }
}
