"use strct";
const os = require("os");
const express = require("express");
const exapp = express();
const server = require("http").createServer(exapp);
const io = require("socket.io")(server);
const pugStatic = require("pug-static");
const pty = require("node-pty");
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
exapp.use(express.static("public"));
exapp.use("/xterm.js", express.static("node_modules/xterm"));
exapp.use("/", pugStatic("views"));
app.allowRendererProcessReuse = false;

let mainWindow;
let shell = os.platform() === "win32" ? "cmd.exe" : "bash";
let port = 3000;

io.on("connect", (socket) => {
  const term = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: process.env
  });
  term.onData((d) => socket.emit("data", d));
  socket.on("data", (d) => term.write(d));
  socket.on("disconnect", () => {
    term.destroy()
  });
});
app.on("ready", function() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
});
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
server.listen(port);
