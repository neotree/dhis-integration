const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const errorLogPath = path.join(logsDir, 'error.log');
const infoLogPath = path.join(logsDir, 'info.log');

// Format timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Format log message
function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (data) {
    if (typeof data === 'object') {
      logMessage += '\n' + JSON.stringify(data, null, 2);
    } else {
      logMessage += '\n' + String(data);
    }
  }

  return logMessage;
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
