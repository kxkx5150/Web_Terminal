const builder = require("electron-builder");

builder.build({
  config: {
    appId: "com.github.kxkx5150.web_terminal",
    directories: {
      output: "dist",
    },
    files: [
      "render/",
      "public/",
      "views/",
      "img/",
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
