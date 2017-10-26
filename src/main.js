const electron = require('electron')
const path = require('path')

const {app, Tray, BrowserWindow, Menu, clipboard, globalShortcut} = electron

const STACK_SIZE = 5, ITEM_MAX_LENGTH = 20

function addToStack(item, stack) {
    return [item].concat(stack.length >= STACK_SIZE ? stack.slice(0, stack.length - 1) : stack)
}

function formatItem(item) {
    return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + '...' : item
}

function formatMenuFromTemplateForStack(stack) {
    return stack.map((item, i) => {
        return {
            label: `Copy: ${formatItem(item)}`,
            click: _ => clipboard.writeText(item)
        }
    })
}

function checkClipboardForChange(clipboard, onChange) {// pull if the element has changed
    let cache = clipboard.readText()
    let latest
    setInterval(_ => {
        latest = clipboard.readText()
        if (latest !== cache) {
            cache = latest
            onChange(cache)
        }
    }, 1000)
}

function registerShortcuts(globalShortcut, clipboard, stack) {
    globalShortcut.unregisterAll()
    for (let i = 0; i < STACK_SIZE; i++) {
        globalShortcut.register(`CommandOrControl+Alt+${i + 1}`, _ => {
            console.log(`CommandOrControl+Alt+${i + 1}`)
            clipboard.writeText(stack[i])
        });
    }
}

app.on('ready', _ => {
    let stack = []
    let tray = new Tray(path.join('img', 'tray.png'))
    let baseMenu = [{label: 'Clean', click: _ => {stack = []; tray.setContextMenu(Menu.buildFromTemplate(baseMenu)) }}, {label: 'Quit', click: _ => app.quit()}]
    let t = [{
        label: '<Empty>',
        enabled: false
    }].concat(baseMenu)
    const menu = Menu.buildFromTemplate(t)
    tray.setContextMenu(menu)
    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack)
        console.log('stack', stack)
        let t = formatMenuFromTemplateForStack(stack)
        tray.setContextMenu(Menu.buildFromTemplate(t.concat(baseMenu)))
        registerShortcuts(globalShortcut, clipboard, stack)
    })
})

