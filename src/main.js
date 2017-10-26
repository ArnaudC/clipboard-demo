const electron = require('electron')
const path = require('path')

const {app, Tray, BrowserWindow, Menu, clipboard} = electron

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

app.on('ready', _ => {
    let stack = []
    let tray = new Tray(path.join('img', 'tray.png'))
    const menu = Menu.buildFromTemplate([{
        label: '<Empty>',
        enabled: false
    }, {label: 'Quit', click: _ => app.quit()}])
    tray.setContextMenu(menu)
    checkClipboardForChange(clipboard, text => {
        stack = addToStack(text, stack)
        console.log('stack', stack)
        tray.setContextMenu(Menu.buildFromTemplate(formatMenuFromTemplateForStack(stack)))
    })
})

