import { createLogger, transports, format } from "winston";
import axios from "axios";

// Logs go to stdout as JSON, collected and shipped to Loki by Grafana Alloy
export const logger = createLogger({
  format: format.json(),
  transports: [new transports.Console()],
});

// Error objects serialize to {} in JSON, so turn them into a readable string
export const format_error = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const request = `${error.config?.method?.toUpperCase()} ${error.config?.url}`;
    const response = error.response
      ? `: ${JSON.stringify(error.response.data)}`
      : "";
    return `${error.message} (${request})${response}`;
  }
  if (error instanceof Error) return error.stack ?? error.message;
  return String(error);
};
