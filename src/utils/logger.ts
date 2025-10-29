export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data || "");
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || "");
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || "");
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data || "");
    }
  }
}
