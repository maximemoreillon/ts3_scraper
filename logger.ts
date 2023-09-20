import { createLogger, transports, format } from "winston"
import LokiTransport from "winston-loki"
import dotenv from "dotenv"

dotenv.config()

export const { LOKI_URL } = process.env

const consoleTransport = new transports.Console({
  format: format.combine(format.simple(), format.colorize()),
})

// By default, only log to console
const loggerOptions = { transports: [consoleTransport] }

// If the Loki URL is provided, then also log to Loki
if (LOKI_URL) {
  console.log(`[Logger] LOKI_URL provided: ${LOKI_URL}`)

  const lokiTransport = new LokiTransport({
    host: LOKI_URL,
    labels: { app: "TS3 scraper" },
    json: true,
    format: format.json(),
    replaceTimestamp: true,
    onConnectionError: (err: any) => console.error(err),
  })

  // @ts-ignore
  loggerOptions.transports.push(lokiTransport)
}

export const logger = createLogger(loggerOptions)
