import { contextBridge, ipcRenderer } from "electron";
import { Data, Key, AddCompanyValues, AddTradeValues, FilterValues } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  getData: (key: Key) => ipcRenderer.invoke("getData", key),
  setData: (key: Key, data: Data) => ipcRenderer.invoke("setData", key, data),
  getStoragePath: () => ipcRenderer.invoke("getStoragePath"),
  openStoragePath: () => ipcRenderer.invoke("openStoragePath"),
  validateASXCode: (asxcode: string, existing: boolean) => ipcRenderer.invoke("validateASXCode", asxcode, existing),
  addCompany: (values: AddCompanyValues) => ipcRenderer.invoke("addCompany", values),
  availableShares: (asxcode: string, user: string) => ipcRenderer.invoke("availableShares", asxcode, user),
  buyShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("buyShare", values, gstPercent),
  sellShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("sellShare", values, gstPercent),
  getPortfolioTableData: (filterValues: FilterValues) => ipcRenderer.invoke("getPortfolioTableData", filterValues),
  getPortfolioGraphData: (filterValues: FilterValues) => ipcRenderer.invoke("getPortfolioGraphData", filterValues),
});
