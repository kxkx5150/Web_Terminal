"use strct";
const express = require("express");
const exapp = express();
const http = require("http");
const server = http.createServer(exapp);
const io = require("socket.io")(server);
const server2 = http.createServer(exapp);
const io2 = require("socket.io")(server2);
const server3 = http.createServer(exapp);
const io3 = require("socket.io")(server3);
const pugStatic = require("pug-static");
const pty = require("node-pty");
const { app, Menu, Tray, BrowserWindow } = require("electron");
let tray = null;
let mainWindow;
exapp.use(express.static("public"));
exapp.use("/xterm.js", express.static("node_modules/xterm"));
exapp.use("/", pugStatic("views"));
app.allowRendererProcessReuse = false;

let cols = 90;
let rows = 30;
let fontSize = 16;
let port = 8890;
let port2 = 8891;
let port3 = 8892;
let home = "c:\\";
let home2 = "c:\\";
let home3 = "~/";

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  app.whenReady().then(() => {
    tray = new Tray("t.ico");
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show",
        type: "normal",
        click() {
          mainWindow.show();
        },
      },
      { label: "Exit", type: "normal", role: "quit" },
    ]);
    tray.on("click", () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()));
    tray.setContextMenu(contextMenu);

    mainWindow = new BrowserWindow({
      width: 500,
      height: 500,
      title: "TEST",
      icon: "t.ico",
      resizable: false,
      maximizable: false,
      alwaysOnTop: false,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    mainWindow.setMenu(null);
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    // mainWindow.webContents.openDevTools();

    mainWindow.on("minimize", function (event) {
      event.preventDefault();
      mainWindow.hide();
    });
    mainWindow.on("closed", function () {
      mainWindow = null;
    });
  });
}
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

io.on("connect", (socket) => {
  const term = pty.spawn("cmd.exe", [], {
    name: "xterm-color",
    cols: cols,
    rows: rows,
    cwd: process.env.HOME,
    env: process.env,
  });
  term.onData((d) => socket.emit("data", d));
  socket.on("data", (d) => term.write(d));
  socket.on("disconnect", () => {
    term.destroy();
  });
  socket.emit("init", {
    cols,
    rows,
    fontSize,
  });
  setTimeout(() => {
    if (home) {
      term.write("cd " + home + "\r\n");
      term.write("clear\r\n");
    }
  }, 300);
});
server.listen(port);
io2.on("connect", (socket) => {
  const term = pty.spawn("powershell.exe", [], {
    name: "xterm-color",
    cols: cols,
    rows: rows,
    cwd: process.env.HOME,
    env: process.env,
  });
  term.onData((d) => socket.emit("data", d));
  socket.on("data", (d) => term.write(d));
  socket.on("disconnect", () => {
    term.destroy();
  });
  socket.emit("init", {
    cols,
    rows,
    fontSize,
  });
  setTimeout(() => {
    if (home2) {
      term.write("cd " + home2 + "\r\n");
      term.write("clear\r\n");
    }
  }, 300);
});
server2.listen(port2);
io3.on("connect", (socket) => {
  const term = pty.spawn("bash.exe", [], {
    name: "xterm-color",
    cols: cols,
    rows: rows,
    cwd: process.env.HOME,
    env: process.env,
  });

  term.onData((d) => socket.emit("data", d));
  socket.on("data", (d) => {
    term.write(d);
  });
  socket.on("disconnect", () => {
    term.destroy();
  });
  socket.emit("init", {
    cols,
    rows,
    fontSize,
  });
  setTimeout(() => {
    if (home3) {
      term.write("cd " + home3 + "\n");
      term.write("clear\n");
    }
  }, 300);
});
server3.listen(port3);
