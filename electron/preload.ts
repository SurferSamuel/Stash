import { contextBridge, ipcRenderer } from "electron";
import { Data, FetchQuote, Key } from "./types";
import { BuySharesFormValues } from "../src/scenes/buyShares";
import { AddCompanyFormValues } from "../src/scenes/addCompany";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchQuote: (asxcode: string): Promise<FetchQuote> => ipcRenderer.invoke("fetchQuote", asxcode),
  getData: (key: Key): Promise<Data> => ipcRenderer.invoke("getData", key),
  setData: (key: Key, data: Data): Promise<void> => ipcRenderer.invoke("setData", key, data),
  getStoragePath: (): Promise<string> => ipcRenderer.invoke("getStoragePath"),
  openStoragePath: (): Promise<void> => ipcRenderer.invoke("openStoragePath"),
  addCompany: (values: AddCompanyFormValues) => ipcRenderer.invoke("addCompany", values),
  buyShare: (values: BuySharesFormValues, gstPercent: string) => ipcRenderer.invoke("buyShare", values, gstPercent),
});
