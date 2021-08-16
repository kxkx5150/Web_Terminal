"use strct";
(() => {
  let ready = false;
  let term = null;
  let intsize = {};

  const fitAddon = new FitAddon();
  const socket = io();
  socket.on("data", (d) => term.write(d));
  socket.on("init", (d) => {
    if (term) return;
    term = new Terminal({
      cols: d.cols - 0,
      rows: d.rows - 0,
      experimentalCharAtlas: 'dynamic',
      cursorBlink: true,
      RendererType: "canvas",
      fontSize: d.fontSize - 0,
      fontWeight: "normal",
      fontFamily: 'Consolas, Ubuntu Mono, courier-new, courier, monospace',
      theme: d.theme,
    });
    intsize = d;
    term.loadAddon(fitAddon);
    term.open(document.getElementById("terminal"));
    fitAddon.fit();
    term.onData((d) => {
      socket.emit("data", d);
    });
    term.onResize(size => {
      console.log("resize");
      socket.emit("resize", size);
    });
    term.onRender((d) => {
      if (ready) return;
      ready = true;
      socket.emit("ready");
      console.log("loaded")
    });
    term.attachCustomKeyEventHandler(e => {
      if (e.key === 'v' && e.ctrlKey) {
        return false;
      }
    });
  });
  socket.on("changefont", (d) => {
    console.log("changefont");
    changeFont(d.fontSize - 0);
    autoFit();
  });
  socket.on("changesize", (d) => {
    console.log("changesize");
    resizeTerm(d.cols, d.rows);
  });
  socket.on("autofit", (d) => {
    console.log("autofit");
    autoFit();
  });



  const autoFit = () => {
    resizeTerm(intsize.cols, intsize.rows);
    fitAddon.fit();
  }
  const resizeTerm = (cols, rows) => {
    let size = {
      cols: cols - 0,
      rows: rows - 0
    };
    term.resize(size.cols, size.rows);
  };
  const changeFont = (val) => {
    term.setOption("fontSize", val);
  };
})();
