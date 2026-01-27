import { app, BrowserWindow, globalShortcut, ipcMain, systemPreferences } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        kiosk: false,
        alwaysOnTop: false,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the Vite dev server URL
    mainWindow.loadURL('http://localhost:5173');

    // Prevent navigating away
    mainWindow.webContents.on('will-navigate', (event) => {
        event.preventDefault();
    });

    mainWindow.webContents.on('new-window', (event) => {
        event.preventDefault();
    });

    // Register global shortcuts to prevent escaping
    // Note: Some OS-level shortcuts (like Cmd+Tab on Mac) are harder to block without elevated permissions
    globalShortcut.register('Alt+Tab', () => {
        console.log('Alt+Tab is disabled during the assessment.');
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
        console.log('DevTools shortcut is disabled.');
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    // Ask for permissions on macOS
    if (process.platform === 'darwin') {
        const camAccess = await systemPreferences.askForMediaAccess('camera');
        const micAccess = await systemPreferences.askForMediaAccess('microphone');
        console.log(`Camera access: ${camAccess}, Mic access: ${micAccess}`);
    }

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});

// IPC for kiosk control
ipcMain.on('enter-kiosk', () => {
    if (mainWindow) {
        mainWindow.setKiosk(true);
        mainWindow.setAlwaysOnTop(true);
    }
});

ipcMain.on('exit-kiosk', () => {
    if (mainWindow) {
        mainWindow.setKiosk(false);
        mainWindow.setAlwaysOnTop(false);
    }
});

ipcMain.on('exit-app', () => {
    app.quit();
});
