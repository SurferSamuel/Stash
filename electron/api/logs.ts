import storage from "electron-json-storage";
import dayjs from "dayjs";
import path from "path";
import fs from "fs";

// Ensure log folder exists
const dirPath = path.join(storage.getDataPath(), "logs");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Rename existing 'latest.log' (if exists)
const latestPath = path.join(dirPath, "latest.log");
if (fs.existsSync(latestPath)) {
  // Get the date of when 'latest.log' was made
  const dateCreated = fs.statSync(latestPath).birthtime;
  const dateString = dayjs(dateCreated).format("DD-MM-YYYY");

  // Helper function that returns the path name given the number
  // Eg. 05-07-2024_01
  const newPath = (num: number) => {
    return path.join(dirPath, `${dateString}_${String(num).padStart(2, '0')}.log`);
  }
  
  // Find the next avaliable number
  let i = 1;
  while (fs.existsSync(newPath(i))) {
    i++;
  }

  // Rename the latest log
  fs.renameSync(latestPath, newPath(i));
}

// Setup the log file
const logPath = path.join(dirPath, "latest.log");
fs.writeFileSync(logPath, "");
const stream = fs.createWriteStream(logPath, { flags: "a" });

/*
 * Appends the given message to the log file
 */
export const writeLog = (message: string) => {
  const time = dayjs().format("HH:mm:ss");
  stream.write(`[${time}]: ${message} \n`);
}

// Write when the log was made
writeLog(`Log started on ${dayjs().format("dddd, MMMM D, YYYY h:mm A")}`);
