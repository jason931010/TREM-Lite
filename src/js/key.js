/* eslint-disable no-undef */
document.onkeydown = (e) => {
  if (e.key == "F11") ipcRenderer.send("toggleFullscreen");
  else if (e.key == "F12") ipcRenderer.send("openDevtool");
  else if (e.key == "Escape") ipcRenderer.send("hide");
  else if (e.ctrlKey && e.key.toLocaleLowerCase() == "r") ipcRenderer.send("reload");
};

const { ipcMain } = require("@electron/remote");
const { BrowserWindow } = require("electron");

ipcMain.on("openChildWindow", (event, arg) => createSettingWindow());

let SettingWindow;

function createSettingWindow() {
  if (typeof SettingWindow !== "undefined")
    return SettingWindow.focus();
  console.log(BrowserWindow);
  SettingWindow = new BrowserWindow({
    title          : "TREM-Lite Setting",
    height         : 600,
    width          : 1000,
    show           : false,
    icon           : "TREM.ico",
    webPreferences : {
      nodeIntegration      : true,
      contextIsolation     : false,
      enableRemoteModule   : true,
      backgroundThrottling : false,
      nativeWindowOpen     : true,
    },
  });
  require("@electron/remote/main").enable(SettingWindow.webContents);
  SettingWindow.loadFile("./view/setting.html");
  SettingWindow.setMenu(null);
  SettingWindow.webContents.on("did-finish-load", () => SettingWindow.show());
  SettingWindow.on("close", () => {
    SettingWindow = null;
    if (MainWindow)
      MainWindow.webContents.reload();

  });
}