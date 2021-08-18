"use strct";
window.addEventListener('DOMContentLoaded', function (e) {
  createElement();
  window.addEventListener("message", function (e) {
    let data = e.data;
    if (data.msg === "resize") {
      console.log("resize: id " + data.id);
      let ifrm = document.getElementById("ifrm" + data.id);
      resizeIFrame(ifrm, data);
    }
  }, false);
});
function createElement() {
  let ttl = document.title;
  let ttls = ttl.split("-");
  let val = ttls[1] - 0;
  let rows = ttls[2] - 0;
  let tmcont = null;
  let tiemrid = null;

  for (let idx = 0; idx < val; idx++) {
    if (idx % 2 === 0) {

      let mcont = document.createElement("div");
      document.body.appendChild(mcont);
      let inptcont = document.createElement("div");
      mcont.appendChild(inptcont);
      let lbl = document.createElement("label");
      lbl.textContent = "Rows "
      inptcont.appendChild(lbl);
      let inpt = document.createElement("input");
      inptcont.appendChild(inpt);
      inpt.setAttribute("type", "number");
      inpt.setAttribute("class", "row_input");
      inpt.value = rows;
      inpt.addEventListener("change", function (e) {
        clearTimeout(tiemrid);
        tiemrid = setTimeout(() => {
          let rows = this.value;
          let ifrms = mcont.querySelectorAll("iframe");
          ifrms.forEach(ifrm => {
            let msg = {
              msg: "rows",
              rows: rows
            };
            ifrm.contentWindow.postMessage(msg, '*');
          });
        }, 600)
      })

      tmcont = document.createElement("div");
      tmcont.setAttribute("class", "term_container");
      mcont.appendChild(tmcont);
    }
    let ifrm = createIframe(idx);
    tmcont.appendChild(ifrm);
  }
}
function createIframe(id) {
  let cont = document.createElement("div");
  cont.setAttribute("class", "ifrm_container");
  cont.setAttribute("id", "ifrmcont" + id);

  let cont2 = document.createElement("div");
  cont.appendChild(cont2);
  cont2.setAttribute("id", "ifrmcont2" + id);

  let ifrm = document.createElement("iframe");
  cont2.appendChild(ifrm);
  ifrm.setAttribute("src", "html/terminal.html?id=" + id);
  ifrm.setAttribute("frameBorder", "0");
  ifrm.setAttribute("id", "ifrm" + id);
  dragTerm(cont, cont2, ifrm);
  return cont;
}
function dragTerm(cont, cont2, ifrm) {
  $(cont).resizable({
    handles: 'e',
    start: function (event, ui) {
      let h = cont.clientHeight;
      // let w =  cont.clientWidth;
      cont.style.height = h + "px";
      // cont.style.width = w + "px";
      cont2.style.display = "none";
      cont.style.border = "2px solid greenyellow";
    },
    stop: function (event, ui) {
      var w = $(cont).outerWidth(true) - 20;
      var h = $(cont).outerHeight(true);

      $(ifrm).outerWidth(w);
      // $(ifrm).outerHeight(h);

      cont2.style.display = "block";
      cont.style.height = "";
      cont.style.width = "";
      cont.style.border = "2px solid #444";
      let msg = {
        msg: "resize",
        width: w,
        height: h
      };
      ifrm.contentWindow.postMessage(msg, '*');
    }
  });
}
function resizeIFrame(iFrame, data) {
  iFrame.style.width = data.width + 20 + "px";
  iFrame.style.height = data.height + 18 + "px";
}
