"use strct";
let tiemrid = null;
let rows = 40;
let termno = 0;

window.addEventListener('DOMContentLoaded', function (e) {
  createElement();
  window.addEventListener("message", function (e) {
    let data = e.data;
    if (data.msg === "resize") {
      let ifrm = document.getElementById("ifrm" + data.id);
      resizeIFrame(ifrm, data);
    }
  }, false);

  document.getElementById("addbtn").addEventListener("click", clickAddButton);
});
function createElement() {
  let ttl = document.title;
  let ttls = ttl.split("-");
  let val = ttls[1] - 0;
  rows = ttls[2] - 0;
  createTerm(0, val, rows);
}
function createTerm(start, end, rows, tmcont) {
  for (let idx = start; idx < end; idx++) {
    if (idx % 2 === 0 && !tmcont) {
      mcont = document.createElement("div");
      document.body.appendChild(mcont);
      mcont.setAttribute("class", "term_maincontainer");

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
        changeRow(this, this.parentNode.parentNode);
      })
      tmcont = document.createElement("div");
      tmcont.setAttribute("class", "term_container");
      mcont.appendChild(tmcont);
    }
    let ifrm = createIframe();
    tmcont.appendChild(ifrm);
  }
}

function createIframe() {
  let cont = document.createElement("div");
  cont.setAttribute("class", "ifrm_container");
  cont.setAttribute("id", "ifrmcont" + termno);

  let cont2 = document.createElement("div");
  cont.appendChild(cont2);
  cont2.setAttribute("id", "ifrmcont2" + termno);

  let ifrm = document.createElement("iframe");
  cont2.appendChild(ifrm);
  ifrm.setAttribute("src", "html/terminal.html?id=" + termno);
  ifrm.setAttribute("frameBorder", "0");
  ifrm.setAttribute("class", "termifrm");
  ifrm.setAttribute("id", "ifrm" + termno);
  dragTerm(cont, cont2, ifrm);
  termno++
  return cont;
}
function changeRow(elm, mcont) {
  clearTimeout(tiemrid);
  tiemrid = setTimeout(() => {
    let rows = elm.value;
    let ifrms = mcont.querySelectorAll("iframe");
    ifrms.forEach(ifrm => {
      let msg = {
        msg: "rows",
        rows: rows
      };
      ifrm.contentWindow.postMessage(msg, '*');
    });
  }, 600)
}
function dragTerm(cont, cont2, ifrm) {
  $(cont).resizable({
    handles: 'e',
    start: function (event, ui) {
      let h = cont.clientHeight;
      let w = cont.clientWidth;
      cont.style.height = h + "px";
      cont.style.width = w + "px";
      setTimeout(() => {
        cont2.style.display = "none";
        cont.style.border = "2px solid greenyellow";
      }, 0)
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
function clickAddButton(e) {
  if (termno % 2 === 0) {
    createTerm(termno, termno + 1, rows);
  } else {
    let mcont = document.querySelectorAll(".term_container");
    createTerm(termno, termno + 1, rows, mcont[mcont.length - 1]);
  }
}