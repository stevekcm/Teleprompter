const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  navigateSlide: (direction) => ipcRenderer.send('navigate-slide', direction),
  updateScript: (scriptData) => ipcRenderer.send('update-script', scriptData),
  onSlideChange: (callback) => ipcRenderer.on('slide-changed', callback)
});