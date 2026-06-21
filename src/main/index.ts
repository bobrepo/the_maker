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

    if (process.platform === 'win32') {
      spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `python "${tempPath}"`], { shell: true })
    } else {
      // Linux/KDE support: try konsole, or fallback to xterm
      spawn('konsole', ['-e', 'python3', tempPath], { detached: true, stdio: 'ignore' })
    }
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

  // Dynamic Methods IPC Handlers
  ipcMain.handle('methods:list', async () => {
    const methodsDir = join(process.cwd(), 'meths')
    if (!fs.existsSync(methodsDir)) {
      fs.mkdirSync(methodsDir, { recursive: true })
    }

    const files = fs.readdirSync(methodsDir)
    const methodsList: any[] = []

    for (const file of files) {
      // Treat all files as potential methods
      const filePath = join(methodsDir, file)
      const code = fs.readFileSync(filePath, 'utf-8')
      const parsed = parsePythonMethod(code, file)
      methodsList.push({
        fileName: file,
        code,
        ...parsed
      })
    }

    return methodsList
  })

  ipcMain.handle('methods:create-or-update', async (_, { methodName, code }) => {
    const methodsDir = join(process.cwd(), 'meths')
    if (!fs.existsSync(methodsDir)) {
      fs.mkdirSync(methodsDir, { recursive: true })
    }

    const fileName = methodName.endsWith('.py') ? methodName : `${methodName}.py`
    const filePath = join(methodsDir, fileName)

    let finalCode = code
    if (!finalCode) {
      if (fs.existsSync(filePath)) {
        finalCode = fs.readFileSync(filePath, 'utf-8')
      } else {
        const name = fileName.replace('.py', '')
        finalCode = `def ${name}(x, y):\n    # Write your custom code here\n    result = x + y\n    return result\n`
      }
    }

    fs.writeFileSync(filePath, finalCode, 'utf-8')
    const parsed = parsePythonMethod(finalCode, fileName)

    return {
      fileName,
      code: finalCode,
      ...parsed
    }
  })

  ipcMain.handle('methods:open-cursor', async (_, { fileName }) => {
    const methodsDir = join(process.cwd(), 'meths')
    const filePath = join(methodsDir, fileName)
    
    // Check if file exists, if not, create default
    if (!fs.existsSync(filePath)) {
      const name = fileName.replace('.py', '')
      const template = `def ${name}(x, y):\n    # Write your custom code here\n    result = x + y\n    return result\n`
      fs.writeFileSync(filePath, template, 'utf-8')
    }

    spawn('code', [filePath], { shell: true })
    return { success: true }
  })

  ipcMain.handle('build-python', async (_, code) => {
    try {
      const desktopPath = app.getPath('desktop')
      const filePath = join(desktopPath, 'main.py')
      fs.writeFileSync(filePath, code, 'utf-8')
      return { success: true, filePath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
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

function parsePythonMethod(code: string, fileName: string) {
  // Enhanced regex to handle multiline and complex signatures
  const defRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*:/s
  const defMatch = code.match(defRegex)

  let methodName = fileName.replace('.py', '')
  let args: string[] = []
  if (defMatch) {
    methodName = defMatch[1].trim()
    const argsStr = defMatch[2]
    args = argsStr
      .split(',')
      .map(arg => arg.trim().split('=')[0].trim().split(':')[0].trim())
      .filter(arg => arg !== '' && arg !== 'self' && arg !== 'cls')
  }

  // Look for return statement with a value
  const returnRegex = /^\s*return\s+(.+)$/m
  const returnMatch = code.match(returnRegex)

  let returnValue: string | null = null
  if (returnMatch) {
    const val = returnMatch[1].trim()
    if (val !== 'None' && val !== '') {
      returnValue = 'result' // Default name if we can't parse the exact variable
      // Try to get variable name if it's a simple return var
      const varMatch = val.match(/^([a-zA-Z_][a-zA-Z0-9_]*)$/)
      if (varMatch) returnValue = varMatch[1]
    }
  }

  return { methodName, args, returnValue }
}
