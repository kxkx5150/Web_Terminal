"use strct";
let theme = {
  foreground: "#ccc",
  background: "#000",
  // cursor: "",
  // black: "",
  red: "#FF0033"
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
const term = new Terminal({
  cols: 80,
  rows: 30,
  cursorBlink: true,
  RendererType: "canvas",
  theme: theme,
});
const fitAddon = new FitAddon();
const socket = io();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal"));
fitAddon.fit();
term.onData((d) => {
  socket.emit("data", d);
});
socket.on("data", (d) => term.write(d));
socket.on("init", (d) => {
  changeFont(d.fontSize);
  resizeTerm(d.cols, d.rows);
});
const resizeTerm = (cols, rows) => {
  term.resize(cols - 0, rows - 0);
  fitAddon.fit();
};
const changeFont = (val) => {
  term.setOption("fontSize", val);
  term.setOption("fontWeight", "normal");
};
