const builder = require("electron-builder");

builder.build({
  config: {
    appId: "com.electron.webterminal",
    directories: {
      output: "dist",
    },
    files: [
      "node_modules/",
      "public/",
      "views/",
      "imt/t.ico",
      "render/index.html",
      "render/renderer.js",
      "main.js",
      "package.json",
      "package-lock.json",
    ],
    win: {
      icon: "img/t.ico",
      target: "portable",
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
    },
  }
});
