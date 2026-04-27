const fs = require('fs');
const path = require('path');
const util = require('util');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const errorLogPath = path.join(logsDir, 'error.log');
const infoLogPath = path.join(logsDir, 'info.log');
const logTimeZone = process.env.LOG_TIMEZONE || process.env.TZ || 'Africa/Harare';

// Format timestamp
function getTimestamp() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: logTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset'
  });

  const parts = formatter.formatToParts(now).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  const offset = (parts.timeZoneName || '').replace('GMT', '');
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}[${logTimeZone}]`;
}

// Format log message
function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data !== null && data !== undefined) {
    logMessage += '\n' + formatData(data);
  }

  return logMessage;
}

function formatData(data) {
  if (typeof data === 'string') {
    return data;
  }

  if (typeof data === 'number' || typeof data === 'boolean' || typeof data === 'bigint') {
    return String(data);
  }

  if (typeof data === 'function') {
    return data.toString();
  }

  const seen = new WeakSet();

  try {
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }

      if (typeof value === 'function') {
        return `[Function${value.name ? `: ${value.name}` : ''}]`;
      }

      if (typeof value === 'symbol') {
        return value.toString();
      }

      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }

      return value;
    }, 2);
  } catch (err) {
    return util.inspect(data, {
      depth: 5,
      breakLength: 120,
      compact: false,
      sorted: true,
      maxArrayLength: 50,
    });
  }
}

// Write to log file
function writeToFile(filePath, message) {
  try {
    fs.appendFileSync(filePath, message + '\n\n', 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file ${filePath}:`, err);
  }
}

// Log error
function logError(message, data = null) {
  const formattedMessage = formatMessage('ERROR', message, data);
  console.error(formattedMessage);
  writeToFile(errorLogPath, formattedMessage);
}

// Log info
function logInfo(message, data = null) {
  const formattedMessage = formatMessage('INFO', message, data);
  console.log(formattedMessage);
  writeToFile(infoLogPath, formattedMessage);
}

// Log success
function logSuccess(message, data = null) {
  const formattedMessage = formatMessage('SUCCESS', message, data);
  console.log(formattedMessage);
  writeToFile(infoLogPath, formattedMessage);
}

// Log warning
function logWarning(message, data = null) {
  const formattedMessage = formatMessage('WARNING', message, data);
  console.warn(formattedMessage);
  writeToFile(infoLogPath, formattedMessage);
}

// Clear old logs (optional - keeps log files manageable)
function clearOldLogs(maxLines = 10000) {
  [errorLogPath, infoLogPath].forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());

        if (lines.length > maxLines) {
          // Keep only the last maxLines entries
          const recentLines = lines.slice(-maxLines);
          fs.writeFileSync(filePath, recentLines.join('\n') + '\n', 'utf8');
        }
      }
    } catch (err) {
      console.error(`Failed to clear old logs from ${filePath}:`, err);
    }
  });
}

module.exports = {
  logError,
  logInfo,
  logSuccess,
  logWarning,
  clearOldLogs
};
