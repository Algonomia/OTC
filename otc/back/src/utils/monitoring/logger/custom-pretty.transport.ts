const build = require('pino-abstract-transport');

const DIM   = '\x1b[2m';
const RESET = '\x1b[0m';

enum PinoSeverityLevel {
  trace = 10,
  debug = 20,
  info  = 30,
  warn  = 40,
  error = 50,
  fatal = 60,
}

const LEVEL_COLORS: { [key in PinoSeverityLevel]: string } = {
  [PinoSeverityLevel.trace]: '\x1b[90m',
  [PinoSeverityLevel.debug]: '\x1b[36m',
  [PinoSeverityLevel.info]:  '\x1b[32m',
  [PinoSeverityLevel.warn]:  '\x1b[33m',
  [PinoSeverityLevel.error]: '\x1b[31m',
  [PinoSeverityLevel.fatal]: '\x1b[35m',
};

const LEVEL_LABELS: { [key in PinoSeverityLevel]: string } = {
  [PinoSeverityLevel.trace]: 'TRACE',
  [PinoSeverityLevel.debug]: 'DEBUG',
  [PinoSeverityLevel.info]:  'INFO',
  [PinoSeverityLevel.warn]:  'WARN',
  [PinoSeverityLevel.error]: 'ERROR',
  [PinoSeverityLevel.fatal]: 'FATAL',
};

const STREAM: { [key in PinoSeverityLevel]: NodeJS.WriteStream } = {
  [PinoSeverityLevel.trace]: process.stdout,
  [PinoSeverityLevel.debug]: process.stdout,
  [PinoSeverityLevel.info]:  process.stdout,
  [PinoSeverityLevel.warn]:  process.stdout,
  [PinoSeverityLevel.error]: process.stderr,
  [PinoSeverityLevel.fatal]: process.stderr,
};

const PINO_INTERNAL_KEYS = new Set(['level', 'time', 'pid', 'hostname', 'msg', 'name']);

function formatExtras(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(([key]) => !PINO_INTERNAL_KEYS.has(key))
    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(' ');
}

function formatLine(obj: Record<string, any>, colorize: boolean): string {
  const ts     = obj.time ? new Date(obj.time).toISOString() : new Date().toISOString();
  const level  = obj.level as PinoSeverityLevel;
  const color  = colorize ? (LEVEL_COLORS[level] ?? '') : '';
  const dim    = colorize ? DIM : '';
  const reset  = colorize ? RESET : '';
  const label  = LEVEL_LABELS[level] ?? 'UNKNOWN';
  const extras = formatExtras(obj);

  let line = `${dim}[${ts}]${reset} ${color}[${label}]${reset} ${obj.msg ?? ''}`;
  if (extras) line += ` ${dim}| ${extras}${reset}`;

  return line;
}

async function prettyTransport(opts: Record<string, any>) {
  const colorize = opts.colorize !== false;

  return build(async function (source) {
    for await (const obj of source) {
      const line   = formatLine(obj, colorize);
      const stream = STREAM[obj.level as PinoSeverityLevel];
      stream.write(line + '\n');
    }
  });
}

module.exports = prettyTransport;
