'use strict'

const assert = require('assert')
const Application = require('../src')

const app = new Application(__dirname)

assert.strictEqual(app.config.db.mysql.url, 1)

app.on('ready', () => {
    console.log('app is ready')
})

app.once('ready', () => {
    console.log('app is ready')
})

app.prependListener('ready', () => {
    console.log('app is ready')
})

app.prependOnceListener('ready', () => {
    console.log('app is ready')
})