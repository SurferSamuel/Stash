import { contextBridge, ipcRenderer } from "electron";
import { Key, AddCompanyValues, AddTradeValues, PortfolioFilterValues } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  getData: (key: Key) => ipcRenderer.invoke("getData", key),
  setData: (key: Key, data: object) => ipcRenderer.invoke("setData", key, data),
  getStoragePath: () => ipcRenderer.invoke("getStoragePath"),
  openStoragePath: () => ipcRenderer.invoke("openStoragePath"),
  quickValidateASXCode: (asxcode: string) => ipcRenderer.invoke("quickValidateASXCode", asxcode),
  validateASXCode: (asxcode: string, existing: boolean) => ipcRenderer.invoke("validateASXCode", asxcode, existing),
  addCompany: (values: AddCompanyValues) => ipcRenderer.invoke("addCompany", values),
  availableShares: (asxcode: string, accountId: string) => ipcRenderer.invoke("availableShares", asxcode, accountId),
  buyShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("buyShare", values, gstPercent),
  sellShare: (values: AddTradeValues, gstPercent: string) => ipcRenderer.invoke("sellShare", values, gstPercent),
  getPortfolioData: (filterValues: PortfolioFilterValues) => ipcRenderer.invoke("getPortfolioData", filterValues),
  generateAccountId: () => ipcRenderer.invoke("generateAccountId"),
  createAccount: (name: string, accountId: string) => ipcRenderer.invoke("createAccount", name, accountId),
  renameAccount: (newName: string, accountId: string) => ipcRenderer.invoke("renameAccount", newName, accountId),
  deleteAccount: (accountId: string) => ipcRenderer.invoke("deleteAccount", accountId),
});
