const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  saveScripts: (scripts) => ipcRenderer.invoke('save-scripts', scripts),
  loadScripts: () => ipcRenderer.invoke('load-scripts')
});