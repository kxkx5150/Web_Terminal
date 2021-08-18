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
let tray = null;
let mainWindow;
let theme = {
  "name": "Campbell",
  "cursorColor": "#FFFFFF",
  "selectionBackground": "#FFFFFF",

  "background": "#050505",
  "foreground": "#CCCCCC",

  "black": "#0C0C0C",
  "blue": "#0037DA",
  "cyan": "#3A96DD",
  "green": "#13A10E",
  "purple": "#881798",
  "red": "#C50F1F",
  "white": "#CCCCCC",
  "yellow": "#C19C00",
  "brightBlack": "#767676",
  "brightBlue": "#3B78FF",
  "brightCyan": "#61D6D6",
  "brightGreen": "#16C60C",
  "brightPurple": "#B4009E",
  "brightRed": "#E74856",
  "brightWhite": "#F2F2F2",
  "brightYellow": "#F9F1A5"
};
let createterm = 4;

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
const sockets = {};
const socketids = [];
const pubpath = path.join(__dirname, "public");
const icopath = path.join(__dirname, "img/t.ico");
const pugpath = path.join(__dirname, "views/index.pug");

exapp.use(ipfilter(ips, { mode: "allow" }));
exapp.use(express.static(pubpath));
exapp.set("view engine", "pug");

exapp.get("/", (req, res) => {
  let rport = req.get('host').split(":")[1];
  if (port === rport - 0) {
    res.render(pugpath, { shell: "cmd-" + createterm + "-" + rows });
  } else if (port2 === rport - 0) {
    res.render(pugpath, { shell: "ps-" + createterm + "-" + rows });
  } else if (port3 === rport - 0) {
    res.render(pugpath, { shell: "wsl-" + createterm + "-" + rows });
  }
});
app.allowRendererProcessReuse = false;

const getOptions = () => {
  if (!store.has("__opt__")) return;
  const value = store.get("__opt__");
  let opt = JSON.parse(value);
  setOptions(opt, true);
};
const setOptions = (opt, nosave) => {
  createterm = opt.term - 0;
  cols = opt.cols - 0;
  rows = opt.rows - 0;
  fontSize = opt.fontSize - 0;
  port = opt.port - 0;
  port2 = opt.port2 - 0;
  port3 = opt.port3 - 0;
  home = opt.home;
  home2 = opt.home2;
  home3 = opt.home3;
  // theme = opt.theme;
  distro = opt.distro;
  user = opt.user;
  if (!nosave) store.set("__opt__", JSON.stringify(opt));
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
      width: 400,
      height: 670,
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
          term: createterm,
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
      } else if (arg.msg === "changefont") {
        sendAll(arg.msg);
      } else if (arg.msg === "changesize") {
        sendAll(arg.msg);
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

const sendAll = (msg) => {
  for (let idx = 0; idx < socketids.length; idx++) {
    let id = socketids[idx];
    let socket = sockets[id];
    socket.emit(msg, {
      cols,
      rows,
      fontSize
    });
  }
}

io.on("connect", (socket) => {
  setConnect("cmd.exe", socket);
});
io2.on("connect", (socket) => {
  setConnect("powershell.exe", socket);
});
io3.on("connect", (socket) => {
  setConnect("wsl.exe", socket, ['-d', distro, '-u', user]);
  sockets[socket.id] = socket;
  socketids.push(socket.id);
});

const setConnect = (shell, socket, opts) => {
  if (!opts) opts = [];
  const term = pty.spawn(shell, opts, {
    name: "xterm-color",
    cols: cols,
    rows: rows,
    cwd: home2,
    env: process.env,
  });
  term.onData((d) => socket.emit("data", d));
  socket.on("theme", (d) => { });
  socket.on("data", (d) => term.write(d));
  socket.on("disconnect", () => {
    delete sockets[socket.id];
    let idx = socketids.indexOf(socket.id)
    if (idx > -1) {
      socketids.splice(idx, 1);
    }
    term.destroy();
  });
  socket.on("resize", (size) => {
    term.resize(
      Math.max(size ? size.cols : term.cols, 1),
      Math.max(size ? size.rows : term.rows, 1)
    );
  });
  socket.on("ready", () => {
    if (shell === "cmd.exe") {
      if (!home) return;
      term.write("cd " + home + "\r\n");
    } else if (shell === "powershell.exe") {
      if (!home2) return;
      term.write("cd " + home2 + "\r\n");
    } else if (shell === "wsl.exe") {
      if (!home3) return;
      term.write("cd " + home3 + "\n");
    }
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
});
server2.listen(port2, "localhost", function () {
});
server3.listen(port3, "localhost", function () {
});
