import { contextBridge, ipcRenderer } from "electron";
import { Data, FetchQuote, Key, AddCompanyValues, AddTradeValues, FilterValues } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchQuote: (asxcode: string): Promise<FetchQuote> => ipcRenderer.invoke("fetchQuote", asxcode),
  getData: (key: Key): Promise<Data> => ipcRenderer.invoke("getData", key),
  setData: (key: Key, data: Data): Promise<void> => ipcRenderer.invoke("setData", key, data),
  getStoragePath: (): Promise<string> => ipcRenderer.invoke("getStoragePath"),
  openStoragePath: (): Promise<void> => ipcRenderer.invoke("openStoragePath"),
  addCompany: (values: AddCompanyValues) => ipcRenderer.invoke("addCompany", values),
  availableShares: (asxcode: string, user: string) => ipcRenderer.invoke("availableShares", asxcode, user),
  buyShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("buyShare", values, gstPercent),
  sellShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("sellShare", values, gstPercent),
  getTableRows: (filterValues: FilterValues) => ipcRenderer.invoke("getTableRows", filterValues),
});
