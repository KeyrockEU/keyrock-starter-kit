import { mapValues, isPlainObject, times, constant } from "lodash"
import Logger from "./logger"

// Initialize logger. The logger level is defined in the config file, but can be overriden with the
// `LOG_LEVEL` environment variable; e.g., starting the app with `LOG_LEVEL=verbose yarn dev`.
export const logger = Logger

export function maskSecrets(obj) {
  function mask(str) {
    const pad = Math.floor(str.length * 0.9)
    return str.slice(0, str.length - pad) + times(pad, constant("X")).join("")
  }

  const regexs = [/\w*password\w*/, /\w*secret\w*/, /\w*private\w*/]

  return mapValues(obj, (v, k) => {
    if (isPlainObject(v)) {
      return maskSecrets(v)
    }

    if (typeof k === "string" && regexs.some(re => k.match(re))) {
      return mask(v)
    }

    return v
  })
}
