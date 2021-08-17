"use strct";
window.addEventListener('DOMContentLoaded', function (e) {
  for (let idx = 0; idx < 4; idx++) {
    createIframe(idx);
  }

  window.addEventListener("message", function (e) {
    let data = e.data;
    if (data.msg === "resize") {
      let ifrms = document.querySelectorAll("iframe");
      ifrms.forEach(ifrm => {
        resizeIFrame(ifrm,data);
      });
    }
  }, false);
});
function createIframe(id){
  let cont = document.createElement("div");
  cont.setAttribute("class","ifrm_container");
  document.body.appendChild(cont);

  let ifrm = document.createElement("iframe");
  cont.appendChild(ifrm);
  ifrm.setAttribute("src","html/terminal.html");
  ifrm.setAttribute("frameBorder","0");

  ifrm.setAttribute("id","ifrm"+id);
}
function resizeIFrame(iFrame,data) {
  iFrame.style.width = data.width + 8 + "px";
  iFrame.style.height = data.height + 8 + "px";
}
