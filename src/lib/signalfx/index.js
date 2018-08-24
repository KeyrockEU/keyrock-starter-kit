import os from "os"
import signalfx from "signalfx"
import config from "config"
import { SignalFxCollector } from "@keyrock/signalfx-collector"
import { name } from "../../../package.json"
import { logger } from "../util"

const fakeSignalFxClient = {
  send: payload => {
    logger.verbose("Fake SignalFX", payload)
  }
}

function getClient() {
  if (config.get("signalfx.enabled")) {
    return new signalfx.Ingest(config.get("signalfx.token"))
  }

  return fakeSignalFxClient
}

export default SignalFxCollector({
  client: getClient(),
  resolution: 60000,
  basicDimensions: {
    app: name,
    environment: process.env.NODE_ENV || "development",
    hostname: os.hostname()
  }
})
