import storage from "electron-json-storage";
import dayjs from "dayjs";
import path from "path";
import fs from "fs";

// Setup the log file
const filePath = path.join(storage.getDataPath(), "latest.log");
fs.writeFileSync(filePath, "");
const stream = fs.createWriteStream(filePath, { flags: "a" });

/*
 * Appends the given message to the log file
 */
export const writeLog = (message: string) => {
  const time = dayjs().format("HH:mm:ss");
  stream.write(`[${time}]: ${message} \n`);
}

// Write when the log was made
writeLog(`Log started on ${dayjs().format("dddd, MMMM D, YYYY h:mm A")}`);
