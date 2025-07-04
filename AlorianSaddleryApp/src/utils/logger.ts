// Production-safe logger that helps debug issues in production builds
class Logger {
  private isDev = __DEV__;
  
  log(...args: any[]) {
    // Always log critical app initialization messages
    console.log('[APP]', ...args);
  }
  
  warn(...args: any[]) {
    console.warn('[APP]', ...args);
  }
  
  error(...args: any[]) {
    // Always show errors in production for debugging
    console.error('[APP ERROR]', ...args);
  }
  
  debug(...args: any[]) {
    if (this.isDev) {
      console.log('[DEBUG]', ...args);
    }
  }
}

export const logger = new Logger(); 