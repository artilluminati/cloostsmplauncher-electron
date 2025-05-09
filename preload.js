const { contextBridge, ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

contextBridge.exposeInMainWorld("electronAPI", {
    closeWindow: () => ipcRenderer.send("window-close"),
    minimizeWindow: () => ipcRenderer.send("window-minimize"),
});
