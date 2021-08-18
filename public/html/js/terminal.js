"use strct";
(() => {
  let ready = false;
  let term = null;
  let termsize = {};
  let timerid = null;
  let resizerflg = false;
  let rowflg = false;
  let termid = location.search.split("?id=")[1];
  const fitAddon = new FitAddon();
  const socket = io();

  document.body.addEventListener('ready', function (e) {
    console.log("--- terminal " + termid + " ---");
    console.log("ready");
    autoFit();
    socket.emit("ready");
  }, false);

  window.addEventListener('message', function (e) {
    let data = e.data;
    if (data.msg === "resize") {
      clearTimeout(timerid);
      timerid = setTimeout(() => {
        let w = e.data.width;
        let h = e.data.height;
        document.getElementById("terminal").style.width = w + "px";
        autoFit();
        // this.document.getElementById("terminal").style.height = h + "px";
      }, 200)
    } else if (data.msg === "rows") {
      rowflg = true;
      termsize.rows = data.rows - 0;
      resizeTerm(termsize.cols, termsize.rows)
      autoFit();
    }
  });

  socket.on("data", (d) => term.write(d));
  socket.on("init", (d) => {
    if (term) return;
    termsize = d;
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
    term.loadAddon(fitAddon);
    term.open(document.getElementById("terminal"));
    term.onData((d) => {
      socket.emit("data", d);
    });
    term.attachCustomKeyEventHandler(e => {
      if (e.key === 'v' && e.ctrlKey) return false;
    });

    term.onResize(size => {
      termsize = size;
      socket.emit("resize", size);
      resizerflg = true;
    });
    term.onRender((d) => {
      if (resizerflg) {
        resizerflg = false;
        resizeMsg();
      }

      if (ready) return;
      ready = true;
      document.body.dispatchEvent(new Event('ready'));
    });
    fitAddon.fit();
  });

  const autoFit = () => {
    resizeTerm(termsize.cols, termsize.rows);
    fitAddon.fit();
  }
  const resizeTerm = (cols, rows) => {
    let size = {
      cols: cols - 0,
      rows: rows - 0
    };
    term.resize(size.cols, size.rows);
  };
  const resizeMsg = () => {
    let term = document.querySelector("#terminal");
    let msg = {
      id: termid,
      msg: "resize",
      width: term.clientWidth,
      height: term.clientHeight
    }
    parent.postMessage(msg, "*");
  }
  const changeFont = (val) => {
    term.setOption("fontSize", val);
    fitAddon.fit();
  };

  socket.on("changesize", (d) => {
    console.log("changesize");
    resizeTerm(d.cols, d.rows);
  });
  socket.on("changefont", (d) => {
    console.log("changefont");
    changeFont(d.fontSize - 0);
  });
})();
