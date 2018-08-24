import config from "config"
import { logger } from "./lib/util"
import app from "./api"

const port = config.get("api.port")
app.server.listen(port, () => {
  logger.info(`🚀 API server started on port ${port}`)
})
