import { Router } from "express"
import { version } from "../../package.json"
import { endpointID } from "./metrics"

const api = Router()

api.get("/", endpointID("root"), (req, response) => {
  response.json({ version })
})

export default api
