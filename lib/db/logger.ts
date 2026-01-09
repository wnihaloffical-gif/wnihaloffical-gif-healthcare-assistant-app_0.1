interface LogEntry {
  timestamp: string
  level: "info" | "error" | "warn" | "debug"
  module: string
  action: string
  message: string
  data?: Record<string, any>
  error?: string
  duration?: number
}

class Logger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry)
  }

  private createEntry(
    level: LogEntry["level"],
    module: string,
    action: string,
    message: string,
    data?: Record<string, any>,
    error?: string,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      action,
      message,
      ...(data && { data }),
      ...(error && { error }),
    }
  }

  info(message: string, data?: Record<string, any>, module = "APP") {
    const entry = this.createEntry("info", module, "INFO", message, data)
    console.log(this.formatLog(entry))
    // TODO: Send to centralized logging service (e.g., ELK, Datadog)
  }

  error(message: string, data?: Record<string, any>, module = "APP", error?: string) {
    const entry = this.createEntry("error", module, "ERROR", message, data, error)
    console.error(this.formatLog(entry))
    // TODO: Send to error tracking service
  }

  warn(message: string, data?: Record<string, any>, module = "APP") {
    const entry = this.createEntry("warn", module, "WARN", message, data)
    console.warn(this.formatLog(entry))
  }

  debug(message: string, data?: Record<string, any>, module = "APP") {
    if (process.env.DEBUG === "true") {
      const entry = this.createEntry("debug", module, "DEBUG", message, data)
      console.log(this.formatLog(entry))
    }
  }
}

export const logger = new Logger()
