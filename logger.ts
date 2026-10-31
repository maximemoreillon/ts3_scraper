import pino from "pino";

// Output level names instead of numbers so that Alloy / Loki can detect the level
export const logger = pino({
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
