import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import fs from 'fs'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC Handlers
  ipcMain.handle('run-python', async (_, code) => {
    const tempPath = join(app.getPath('temp'), 'mstt_temp.py')
    fs.writeFileSync(tempPath, code)
    spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `python "${tempPath}"`], { shell: true })
    return { success: true }
  })

  ipcMain.handle('save-python', async (_, code) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Export Python Script',
      defaultPath: 'main.py',
      filters: [{ name: 'Python Scripts', extensions: ['py'] }]
    })
    if (filePath) {
      fs.writeFileSync(filePath, code)
      return { success: true, filePath }
    }
    return { success: false }
  })

  ipcMain.handle('save-graph', async (_, graphJson) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save Graph',
      defaultPath: 'graph.json',
      filters: [{ name: 'MSTT Graph', extensions: ['json'] }]
    })
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(graphJson, null, 2))
      return { success: true, filePath }
    }
    return { success: false }
  })

  ipcMain.handle('load-graph', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Load Graph',
      filters: [{ name: 'MSTT Graph', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (filePaths && filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], 'utf-8')
      return { success: true, graph: JSON.parse(content) }
    }
    return { success: false }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
