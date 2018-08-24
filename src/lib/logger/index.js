import winston, { format } from "winston"
import bugsnag from "bugsnag"
import config from "config"
import LogDNATransport from "@keyrock/winston-logdna-transport"
import BugsnagTransport from "@keyrock/winston-bugsnag-transport"
import { name, version } from "../../../package.json"
import { maskSecrets } from "../util"

// Initialize Bugnsag
bugsnag.register(config.get("bugsnag.key"), {
  appVersion: version,
  // Protect sensitive information
  filters: ["password", "secret"],
  // Get from configuration the list of environments in which Bugsnag is activated
  notifyReleaseStages: config.get("bugsnag.stages"),
  // Override Bugsnag's default behavior: if nothing is provided in `NODE_ENV`, it assumes is prod.
  // We will assume that is development to keep it disabled.
  releaseStage: process.env.NODE_ENV || "development"
})

const { colorize, simple, combine } = format

// Define the Winston transports. Transports are like hooks that intercepts the calls to `winston`
// and performs some side effect, such as send the logs to somewhere else. Here we are managing
// three different transports: console (sends logs to stdout), Bugsnag (send errors to Bugsnag)
// and LogDNA (sends all logs to LogDNA). The latter is conditionally enabled with a flag in the
// configuration.
const transports = [
  new BugsnagTransport({ bugsnag }),
  new winston.transports.Console({
    format: combine(colorize(), simple())
  })
]

if (config.get("logger.logdna.enabled")) {
  transports.push(
    new LogDNATransport({
      key: config.get("logger.logdna.apiKey"),
      app: name,
      env: process.env.NODE_ENV || "development",
      index_meta: true
    })
  )
}

// Expose the `winston` instance
const logger = winston.createLogger({
  level: config.get("logger.level"),
  transports
})

logger.info(`Configuration loaded`, {
  NODE_ENV: process.env.NODE_ENV || "<not specified>",
  files: config.util.getConfigSources().map(x => x.name),
  configuration: maskSecrets(config)
})

export default logger
