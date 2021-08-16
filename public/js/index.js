"use strct";
(() => {
  let term = null;
  const fitAddon = new FitAddon();
  const socket = io();
  socket.on("data", (d) => term.write(d));
  socket.on("init", (d) => {
    if (term) return;
    term = new Terminal({
      cols: d.cols - 0,
      rows: d.rows - 0,
      cursorBlink: true,
      RendererType: "canvas",
      fontSize: d.fontSize - 0,
      fontWeight: "normal",
      theme: d.theme,
    });
    term.loadAddon(fitAddon);
    term.open(document.getElementById("terminal"));
    fitAddon.fit();
    term.onData((d) => {
      socket.emit("data", d);
    });
  });

  socket.on("changefont", (d) => {
    changeFont(d.fontSize-0);
  });
  socket.on("changesize", (d) => {
    console.log("changesize");
    resizeTerm(d.cols, d.rows);
  });

  const resizeTerm = (cols, rows) => {
    term.resize(cols - 0, rows - 0);
    fitAddon.fit();
  };
  const changeFont = (val) => {
    term.setOption("fontSize", val);
    fitAddon.fit();
    console.log("change");
  };
})();
