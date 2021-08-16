"use strct";
const { ipcRenderer } = require("electron");
let theme = null;
ipcRenderer.on("asynchronous-reply", (event, arg) => {
  if (arg.msg === "opt") {
    setOptions(arg.obj);
    addEvents();
  }
});
ipcRenderer.send("asynchronous-message", { msg: "init" });
const setOptions = (opt) => {
  document.getElementById("cols_int").value = opt.cols;
  document.getElementById("rows_int").value = opt.rows;
  document.getElementById("fontsize_int").value = opt.fontSize;

  document.getElementById("port_int").value = opt.port;
  document.getElementById("port2_int").value = opt.port2;
  document.getElementById("port3_int").value = opt.port3;

  document.getElementById("home_int").value = opt.home;
  document.getElementById("home2_int").value = opt.home2;
  document.getElementById("home3_int").value = opt.home3;

  document.getElementById("dist_int").value = opt.distro;
  document.getElementById("user_int").value = opt.user;
  theme = opt.theme;
};
const addEvents = () => {
  document.getElementById("cols_int").addEventListener("change", getOptions);
  document.getElementById("rows_int").addEventListener("change", getOptions);
  document.getElementById("fontsize_int").addEventListener("change", getOptions);

  document.getElementById("port_int").addEventListener("change", getOptions);
  document.getElementById("port2_int").addEventListener("change", getOptions);
  document.getElementById("port3_int").addEventListener("change", getOptions);
  
  let elems = document.querySelectorAll(".text_input");
  elems.forEach(elem => {
    elem.addEventListener("change", getOptions);
  });
};
const getOptions = (e) => {
  let opt = {
    cols: document.getElementById("cols_int").value,
    rows: document.getElementById("rows_int").value,
    fontSize: document.getElementById("fontsize_int").value,
    port: document.getElementById("port_int").value,
    port2: document.getElementById("port2_int").value,
    port3: document.getElementById("port3_int").value,
    home: document.getElementById("home_int").value,
    home2: document.getElementById("home2_int").value,
    home3: document.getElementById("home3_int").value,
    distro: document.getElementById("dist_int").value,
    user: document.getElementById("user_int").value,
    theme: theme,
  };
  ipcRenderer.send("asynchronous-message", { msg: "opt", opt: opt });
};
document.getElementById("restart_btn").addEventListener("click", () => {
  ipcRenderer.send("asynchronous-message", { msg: "restart" });
});
