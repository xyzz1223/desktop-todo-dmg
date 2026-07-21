const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  list:          ()        => ipcRenderer.invoke('todo:list'),
  add:           (todo)    => ipcRenderer.invoke('todo:add', todo),
  remove:        (id)      => ipcRenderer.invoke('todo:remove', id),
  toggle:        (id)      => ipcRenderer.invoke('todo:toggle', id),
  resizeWindow:  (w, h)    => ipcRenderer.invoke('window:resize', w, h),
  closeWindow:   ()        => ipcRenderer.invoke('window:close'),
});
