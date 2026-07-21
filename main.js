const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const notifier = require('node-notifier');
const TodoStore = require('./store');

let win, store, schedulerTimer;
const isMac = process.platform === 'darwin';
const isDev = !app.isPackaged;

// ---- 创建桌面悬浮窗口 ----
function createWindow() {
  win = new BrowserWindow({
    width: 420,
    height: 540,
    x: 24,
    y: 60,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    visibleOnAllWorkspaces: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // macOS 用 floating 层级，Windows 用普通置顶
  if (isMac) {
    win.setAlwaysOnTop(true, 'floating');
    // macOS 上需要设置窗口层级在桌面图标之上
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } else {
    win.setAlwaysOnTop(true);
  }

  win.loadFile('index.html');

  // 仅在开发模式打开 DevTools
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

// ---- macOS 开机自启（Windows 靠 Startup 文件夹的 VBS） ----
if (isMac) {
  app.setLoginItemSettings({ openAtLogin: true });
}

// ---- IPC：待办增删查改 ----
ipcMain.handle('todo:list', () => {
  try { return store.getAll(); }
  catch (e) { console.error('todo:list error:', e); return []; }
});

ipcMain.handle('todo:add', (e, todo) => {
  try {
    const item = {
      id: Date.now().toString(),
      text: todo.text,
      done: false,
      remindAt: todo.remindAt || null,
      notified: false
    };
    return store.add(item);
  } catch (e) {
    console.error('todo:add error:', e);
    throw e;
  }
});

ipcMain.handle('todo:remove', (e, id) => {
  try { store.remove(id); }
  catch (e) { console.error('todo:remove error:', e); }
});

ipcMain.handle('todo:toggle', (e, id) => {
  try {
    const t = store.getAll().find(x => x.id === id);
    if (t) store.update(id, { done: !t.done });
  } catch (e) { console.error('todo:toggle error:', e); }
});

// ---- IPC：窗口折叠/展开/关闭 ----
ipcMain.handle('window:resize', (e, w, h) => {
  try {
    win.setSize(w, h);
  } catch (e) { console.error('window:resize error:', e); }
});

ipcMain.handle('window:close', () => {
  try {
    app.quit();
  } catch (e) { console.error('window:close error:', e); }
});

// ---- 提醒调度器：每 30 秒检查一次 ----
function startScheduler() {
  schedulerTimer = setInterval(() => {
    const now = Date.now();
    store.getAll().forEach(t => {
      if (!t.remindAt || t.notified || t.done) return;
      if (new Date(t.remindAt).getTime() <= now) {
        notifier.notify({
          title: '待办提醒',
          message: t.text,
          sound: true
        });
        store.update(t.id, { notified: true });
      }
    });
  }, 30 * 1000);
}

// ---- 启动 ----
app.whenReady().then(() => {
  store = new TodoStore();
  createWindow();
  startScheduler();
});

// macOS: 点击 Dock 图标时如果无窗口则重新创建
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
