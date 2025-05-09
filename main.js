const { app, BrowserWindow, ipcMain, dialog } = require("electron/main");
const path = require("path");
const fsPromises = require("node:fs/promises");
const fs = require("node:fs");

const { Client, Authenticator } = require("minecraft-launcher-core");

const clientPackage = path.join(__dirname, "/downloads/test-fabric-1.0.0.zip");
const instanceName = "cloostsmp";

const launcher = new Client();

async function launchMinecraft(settings) {
    const offlineUser = {
        access_token: "0", // любой строковый токен
        client_token: "0", // тоже произвольный
        uuid: "offline-uuid", // можно сгенерировать или оставить статичным
        name: settings.nickname, // отображаемое имя игрока
        user_properties: {}, // обычно пустой объект
        meta: {
            type: "msa",
            demo: false,
        },
    };

    const opts = {
        authorization: offlineUser,
        root: `./${instanceName}`,
        clientPackage: clientPackage,
        removePackage: false,
        version: {
            number: "1.20.1", // Fabric-compatible vanilla
            type: "release",
        },
        memory: {
            max: `${settings.memory}G`,
            min: `${settings.memory}G`,
        },
        javaPath: settings.javaPath,
        overrides: {
            windowsHide: true,
        },
    };

    const launcherProcess = await launcher.launch(opts);
    return launcherProcess;
}

let win;
function createWindow() {
    win = new BrowserWindow({
        title: "Cloost SMP Launcher",
        width: 800,
        height: 600,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });

    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl) {
        win.loadURL(devUrl);
    } else {
        win.loadFile(path.join(__dirname, "dist/index.html"));
    }
}

const settingsPath = path.join(__dirname, "settings.json");
const defaultSettings = {
    nickname: "",
    javaPath: "",
    memory: 4,
};

// При старте — убедиться, что settings.json существует
function ensureSettingsFile() {
    try {
        if (!fs.existsSync(settingsPath)) {
            // Пишем файл с отступами для читаемости
            fs.writeFileSync(
                settingsPath,
                JSON.stringify(defaultSettings, null, 2),
                "utf8"
            );
            console.log("Created default settings.json");
        }
    } catch (err) {
        console.error("Error initializing settings file:", err);
    }
}

app.whenReady().then(() => {
    ensureSettingsFile();

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

    ipcMain.handle("get-settings", async () => {
        const raw = await fsPromises.readFile(settingsPath, "utf8");
        return JSON.parse(raw);
    });

    // Принять новый объект настроек и записать его
    ipcMain.handle("set-settings", async (_e, newSettings) => {
        // Можно валидировать или мерджить поля при желании
        await fsPromises.writeFile(
            settingsPath,
            JSON.stringify(newSettings, null, 2),
            "utf8"
        );
        return true;
    });

    ipcMain.handle("select-java-path", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: "Выберите папку или исполняемый файл Java",
            properties: ["openFile", "openDirectory"],
            filters: [
                { name: "Java", extensions: ["exe", "bin", "sh"] },
                { name: "All Files", extensions: ["*"] },
            ],
        });
        if (canceled || filePaths.length === 0) {
            return null;
        }
        return filePaths[0];
    });
});

ipcMain.handle("run-game", async (event) => {
    console.log("[main] run-game handler called");
    try {
        const raw = await fsPromises.readFile(settingsPath, "utf8");
        const currentSettings = JSON.parse(raw);

        setupLauncherIpcMessaging(win);
        await launchMinecraft(currentSettings);

        return { success: true };
    } catch (err) {
        // если хотите ответить сразу на invoke, можно вернуть объект
        return { success: false, error: err.message };
    }
});

function setupLauncherIpcMessaging(win) {
    win.webContents.send("run-game-status", {
        phase: "preparing",
        msg: "Подготовка к запуску",
    });

    // launcher.on("debug", (data) => {
    //     console.log("[MCLC debug] ", data);
    //     win.webContents.send("run-game-status", {
    //         phase: "debug",
    //         msg: JSON.stringify(data),
    //     });
    // });
    launcher.on("download", (info) => {
        win.webContents.send("run-game-status", {
            phase: "download",
            msg: `Загрузка файлов игры: ${JSON.stringify(info)}`,
        });
    });
    launcher.on("progress", (prog) => {
        win.webContents.send("run-game-status", {
            phase: "progress",
            msg: "Запуск игры",
        });
    });
    launcher.on("data", (chunk) => {
        win.webContents.send("run-game-status", {
            phase: "data",
            msg: "Игра запущена",
        });
        win.webContents.send("run-game-log", {
            msg: chunk.toString(),
        });
    });
    launcher.on("close", (code) => {
        win.webContents.send("run-game-status", {
            phase: "close",
            msg: `Игра завершена с кодом ${code}`,
        });
    });
}

const logsDir = path.join(__dirname, instanceName, "logs");

ipcMain.handle("list-log-files", async () => {
    const entries = await fsPromises.readdir(logsDir);
    // отфильтруем только .log и .log.gz, исключая latest.log если нужно
    return entries.filter((f) => f.endsWith(".log") || f.endsWith(".log.gz"));
});

ipcMain.handle("read-log-file", async (_e, fileName) => {
    const filePath = path.join(logsDir, fileName);
    let content = await fsPromises.readFile(filePath, "utf8");
    // если файл в .gz — нужно распаковать (требует zlib), иначе вернуть сразу
    if (fileName.endsWith(".gz")) {
        const zlib = require("zlib");
        content = zlib
            .gunzipSync(await fsPromises.readFile(filePath))
            .toString("utf8");
    }
    return content;
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
