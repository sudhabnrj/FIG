type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private isProd: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isProd = process.env.NODE_ENV === 'production';
    const rawLogLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    this.minLevel = ['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(rawLogLevel)
      ? (rawLogLevel as LogLevel)
      : 'INFO';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private write(level: LogLevel, message: string, meta?: any) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();

    if (this.isProd) {
      // Structured JSON log for production
      console.log(
        JSON.stringify({
          timestamp,
          level,
          message,
          ...(meta ? { metadata: this.sanitizeMeta(meta) } : {}),
        })
      );
    } else {
      // Human-readable output for development console
      const color =
        level === 'ERROR'
          ? '\x1b[31m💥'
          : level === 'WARN'
          ? '\x1b[33m⚠️'
          : level === 'DEBUG'
          ? '\x1b[36m🔍'
          : '\x1b[32mℹ️';
      const reset = '\x1b[0m';
      console.log(
        `[${timestamp}] ${color} [${level}]${reset} ${message}`,
        meta ? '\n' + JSON.stringify(meta, null, 2) : ''
      );
    }
  }

  private sanitizeMeta(meta: any): any {
    if (!meta) return meta;
    
    try {
      const cloned = JSON.parse(JSON.stringify(meta));
      const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'passwordConfirmation', 'uri', 'url'];
      
      const censor = (obj: any) => {
        if (typeof obj !== 'object' || obj === null) return;
        for (const key in obj) {
          if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            censor(obj[key]);
          }
        }
      };
      
      censor(cloned);
      return cloned;
    } catch {
      return '[Unserializable Metadata]';
    }
  }

  info(message: string, meta?: any) {
    this.write('INFO', message, meta);
  }

  warn(message: string, meta?: any) {
    this.write('WARN', message, meta);
  }

  error(message: string, meta?: any) {
    this.write('ERROR', message, meta);
  }

  debug(message: string, meta?: any) {
    this.write('DEBUG', message, meta);
  }
}

export const logger = new Logger();
export default logger;
