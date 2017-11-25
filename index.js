const { app, Menu, Tray, Notification, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');

// 保持一个对于 window 对象的全局引用，如果你不这样做，
// 当 JavaScript 对象被垃圾回收， window 会被自动地关闭
let win;
let iconPath = path.join(__dirname, 'autoSign.png');

function createWindow() {
  // 创建浏览器窗口。
  win = new BrowserWindow({
    width: 600,
    height: 550,
    resizable: false,
    backgroundColor: '#fff',
    icon: iconPath
  })

  Menu.setApplicationMenu(null);

  // 然后加载应用的 index.html。
  let defaultData = JSON.parse(fs.readFileSync('./data/cache').toString());
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'public/html/index.html'),
    protocol: 'file:',
    slashes: true,
    search: querystring.stringify(defaultData)
  }))

  // 打开开发者工具。
  win.webContents.openDevTools();

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('start-auto-sign', (event, data) => {
  win.hide();
  tray = new Tray(iconPath);
  let contextMenu = Menu.buildFromTemplate([{
    label: '打开主面板(停止签到)',
    click: () => {
      tray.destroy();
      win.show();
    }
  }, {
    label: '退出',
    role: 'quit'
  }]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('预计签到时间:' + data.time);
  tray.displayBalloon({
    title: '预计签到时间',
    content: data.time
  });
  
  let writeData = {}
  writeData.username = data.isRememberUsername ? data.username : '';
  writeData.password = data.isRememberPassword ? data.password : '';
  fs.writeFile('./data/cache', JSON.stringify(writeData), (err) => {
    if (err) console.log(err);
  });
  console.log(data);
})