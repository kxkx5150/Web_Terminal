"use strct";
let cols = 90;
let rows = 30;
let fontSize = 16;
let port = 8890;
let port2 = 8891;
let port3 = 8892;
let home = "c:\\";
let home2 = "c:\\";
let home3 = "~/";
let distro = "";
let user = "root";
let theme = {
  foreground: "#ddd",
  background: "#000",
  // cursor: "",
  // black: "",
  red: "#FF0033",
  // green: "",
  // yellow: "",
  // blue: "",
  // magenta: "",
  // cyan: "",
  // white: "",
  // brightBlack: "",
  // brightRed: "",
  // brightGreen: "",
  // brightYellow: "",
  // brightBlue: "",
  // brightMagenta: "",
  // brightCyan: "",
  // brightWhite: "",
};
const path = require("path");
const ips = ["127.0.0.1"];
const express = require("express");
const exapp = express();
const ipfilter = require("express-ipfilter").IpFilter;
const http = require("http");
const server = http.createServer(exapp);
const io = require("socket.io")(server);
const server2 = http.createServer(exapp);
const io2 = require("socket.io")(server2);
const server3 = http.createServer(exapp);
const io3 = require("socket.io")(server3);
const pty = require("node-pty");
const { app, Menu, Tray, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const store = new Store();
let tray = null;
let mainWindow;

const pubpath = path.join(__dirname, "public");
const icopath = path.join(__dirname, "img/t.ico");
const pugpath = path.join(__dirname, "views/index.pug");

exapp.use(ipfilter(ips, { mode: "allow" }));
exapp.use(express.static(pubpath));
exapp.set("view engine", "pug");
exapp.get("/", (req, res) => {
  res.render(pugpath);
});
app.allowRendererProcessReuse = false;

const getOptions = () => {
  if (!store.has("__opt__")) return;
  const value = store.get("__opt__");
  let opt = JSON.parse(value);
  cols = opt.cols - 0;
  rows = opt.rows - 0;
  fontSize = opt.fontSize - 0;
  port = opt.port - 0;
  port2 = opt.port2 - 0;
  port3 = opt.port3 - 0;
  home = opt.home;
  home2 = opt.home2;
  home3 = opt.home3;
  theme = opt.theme;
  distro = opt.distro;
  user = opt.user;
};
const setOptions = (opt) => {
  cols = opt.cols - 0;
  rows = opt.rows - 0;
  fontSize = opt.fontSize - 0;
  home = opt.home;
  home2 = opt.home2;
  home3 = opt.home3;
  store.set("__opt__", JSON.stringify(opt));
};







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
    tray = new Tray(icopath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show",
        type: "normal",
        click() {
          mainWindow.show();
        },
      },
      {
        label: "Exit",
        type: "normal",
        role: "quit",
      },
    ]);
    tray.on("click", () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()));
    tray.setContextMenu(contextMenu);

    mainWindow = new BrowserWindow({
      width: 380,
      height: 640,
      title: "TEST",
      icon: icopath,
      resizable: false,
      maximizable: false,
      alwaysOnTop: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    ipcMain.on("asynchronous-message", (event, arg) => {
      if (arg.msg === "init") {
        let obj = {
          cols,
          rows,
          fontSize,
          port,
          port2,
          port3,
          home,
          home2,
          home3,
          theme,
          distro,
          user
        };
        event.sender.send("asynchronous-reply", { msg: "opt", obj: obj });
      } else if (arg.msg === "restart") {
        app.relaunch();
        app.exit();
      } else if (arg.msg === "opt") {
        setOptions(arg.opt);
      }
    });
    mainWindow.setMenu(null);
    mainWindow.loadFile(path.join(__dirname, "render/index.html"));
    // mainWindow.webContents.openDevTools();
    mainWindow.on("minimize", function (e) {
      e.preventDefault();
      mainWindow.hide();
    });
    mainWindow.on("closed", function () {
      mainWindow = null;
    });
  });
}
app.on("window-all-closed", function () {
  app.quit();
});
app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
io.on("connect", (socket) => {
  let term = setConnect("cmd.exe", socket);
  setTimeout(() => {
    if (home) {
      term.write("cd " + home + "\r\n");
      term.write("clear\r\n");
    }
  }, 300);
});
io2.on("connect", (socket) => {
  let term = setConnect("powershell.exe", socket);
  setTimeout(() => {
    if (home2) {
      term.write("cd " + home2 + "\r\n");
      term.write("clear\r\n");
    }
  }, 300);
});
io3.on("connect", (socket) => {
  let term = setConnect("wsl.exe", socket, ['-d', distro, '-u', user]);
  setTimeout(() => {
    if (home3) {
      term.write("cd " + home3 + "\n");
      term.write("clear\n");
    }
  }, 300);
});
const setConnect = (shell, socket, opts) => {
  if (!opts) opts = [];
  const term = pty.spawn(shell, opts, {
    name: "xterm-color",
    cols: cols,
    rows: rows,
    cwd: process.env.HOME,
    env: process.env,
  });
  term.onData((d) => socket.emit("data", d));
  socket.on("theme", (d) => { });
  socket.on("data", (d) => term.write(d));
  socket.on("disconnect", () => {
    term.destroy();
  });
  socket.emit("init", {
    cols,
    rows,
    fontSize,
    theme,
  });
  return term;
};
getOptions();

server.listen(port, "localhost", function () {
  console.log(server.address());
});
server2.listen(port2, "localhost", function () {
  console.log(server2.address());
});
server3.listen(port3, "localhost", function () {
  console.log(server3.address());
});
