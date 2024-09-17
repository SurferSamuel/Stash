import storage from "electron-json-storage";
import dayjs from "dayjs";
import path from "path";
import fs from "fs";

// Ensure log folder exists
const dirPath = path.join(storage.getDataPath(), "logs");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const today = dayjs().format('DD-MM-YYYY');
const pattern = new RegExp(`^${today}_(\\d{2}).log$`);

// Find the highest number already used in the logs
let maxNumber = 0;
fs.readdirSync(dirPath).forEach((filename) => {
  const match = filename.match(pattern);
  if (match != null) {
    const num = parseInt(match[1]) || 0;
    if (num > maxNumber) {
      maxNumber = num;
    }
  }
});

// Setup the log file
const logFilename = `${today}_${String(maxNumber + 1).padStart(2, '0')}.log`;
const logPath = path.join(dirPath, logFilename);
fs.writeFileSync(logPath, "");
const stream = fs.createWriteStream(logPath, { flags: "a" });

/**
 * Appends the given message to the log file
 */
export const writeLog = (message: string) => {
  const time = dayjs().format("HH:mm:ss");
  stream.write(`[${time}]: ${message} \n`);
}

// Write when the log was made
writeLog(`Log started on ${dayjs().format("dddd, MMMM D, YYYY h:mm A")}`);
