const { app, BrowserWindow } = require('electron');

console.log('Test app starting...');

app.on('ready', () => {
  console.log('App is ready!');

  const win = new BrowserWindow({
    width: 300,
    height: 200,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL('data:text/html,<h1>Test Window</h1>');

  win.on('closed', () => {
    console.log('Window closed');
  });
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  app.quit();
});