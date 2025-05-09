const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("path");

const EMLLib = require("eml-lib");

let win;
function createWindow() {
    win = new BrowserWindow({
        title: "Cloost SMP Launcher",
        height: 600,
        width: 800,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "./preload.js"),
        },
        // titleBarOverlay: {
        //     color: "#ffffff",
        //     symbolColor: "#2a3654",
        //     height: 53,
        // },
    });

    win.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    ipcMain.on("window-minimize", () => {
        win.minimize();
    });

    ipcMain.on("window-close", () => {
        win.close();
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    require("./actions");
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
