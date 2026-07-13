/**
 * Lightweight server logger. Use instead of console.log in production paths.
 */
export const logger = {
  /**
   * Log an informational message.
   * @param message - human readable message
   * @param meta - optional structured context
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      // eslint-disable-next-line no-console
      console.info(`[prism] ${message}`, meta)
    } else {
      // eslint-disable-next-line no-console
      console.info(`[prism] ${message}`)
    }
  },

  /**
   * Log a warning.
   * @param message - human readable message
   * @param meta - optional structured context
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (meta) {
      // eslint-disable-next-line no-console
      console.warn(`[prism] ${message}`, meta)
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[prism] ${message}`)
    }
  },

  /**
   * Log an error.
   * @param message - human readable message
   * @param error - optional error object
   */
  error(message: string, error?: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[prism] ${message}`, error ?? '')
  },
}
