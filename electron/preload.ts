import { contextBridge, ipcRenderer } from "electron";
import { Data, FetchQuote, Key } from "./types";
import { AddTradeFormValues } from "../src/scenes/addTrade";
import { AddCompanyFormValues } from "../src/scenes/addCompany";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchQuote: (asxcode: string): Promise<FetchQuote> => ipcRenderer.invoke("fetchQuote", asxcode),
  getData: (key: Key): Promise<Data> => ipcRenderer.invoke("getData", key),
  setData: (key: Key, data: Data): Promise<void> => ipcRenderer.invoke("setData", key, data),
  getStoragePath: (): Promise<string> => ipcRenderer.invoke("getStoragePath"),
  openStoragePath: (): Promise<void> => ipcRenderer.invoke("openStoragePath"),
  addCompany: (values: AddCompanyFormValues) => ipcRenderer.invoke("addCompany", values),
  buyShare: (values: AddTradeFormValues, gstPercent: string) => ipcRenderer.invoke("buyShare", values, gstPercent),
});
