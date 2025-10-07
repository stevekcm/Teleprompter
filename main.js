const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

console.log('🚀 Starting Teleprompter App...');

let mainWindow;
let windowProtection;

// Temporarily disable native module for testing
// try {
//   windowProtection = require('./native/build/Release/window_protection.node');
//   console.log('✅ Native module loaded successfully');
// } catch (error) {
//   console.error('❌ Failed to load native module:', error.message);
//   console.log('⚠️  Running without screen capture protection');
// }
console.log('⚠️  Native module temporarily disabled for testing');

function createWindow() {
  console.log('📱 Creating main window...');

  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: true, // Changed temporarily for testing
    transparent: false, // Changed temporarily for testing
    alwaysOnTop: true,
    // type: 'panel', // Commented temporarily
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  console.log('📄 Loading index.html...');
  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    console.log('✅ Window ready to show');
    mainWindow.show();
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // if (windowProtection) {
  //   try {
  //     const buffer = mainWindow.getNativeWindowHandle();
  //     windowProtection.setWindowProtection(buffer);
  //     console.log('✅ Window protection applied');
  //   } catch (error) {
  //     console.error('❌ Failed to apply window protection:', error);
  //   }
  // }

  // mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('navigate-slide', (event, direction) => {
  console.log(`Navigate slide: ${direction}`);
});

ipcMain.on('update-script', (event, scriptData) => {
  console.log('Script updated:', scriptData);
});