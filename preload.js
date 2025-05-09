const { contextBridge, ipcRenderer } = require("electron");

const logCallbacks = [];

ipcRenderer.on("run-game-log", (_e, entry) => {
    logCallbacks.forEach((cb) => cb(entry));
});

contextBridge.exposeInMainWorld("electronAPI", {
    closeWindow: () => ipcRenderer.send("window-close"),
    minimizeWindow: () => ipcRenderer.send("window-minimize"),

    // Настройки
    getSettings: () => ipcRenderer.invoke("get-settings"),

    setSettings: (newSettings) =>
        ipcRenderer.invoke("set-settings", newSettings),
    selectJavaPath: () => ipcRenderer.invoke("select-java-path"),

    // Запуск
    runGame: () => ipcRenderer.invoke("run-game"),
    onRunGameStatus: (cb) => {
        console.log("[preload] registering run-game-status listener");
        ipcRenderer.on("run-game-status", (_e, status) => {
            console.log("[preload] got status:", status);
            cb(status);
        });
    },

    // Логи
    onGameLog: (cb) => {
        logCallbacks.push(cb);
    },
    listLogFiles: (cb) => ipcRenderer.invoke("list-log-files", cb),
    readLogFile: (fileName) => ipcRenderer.invoke("read-log-file", fileName),
});
