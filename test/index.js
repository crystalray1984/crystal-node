'use strict'

const assert = require('assert')
const Application = require('../src')

const app = new Application(__dirname)

app.on('ready', () => {
    app.db.redis.echo('redis').then(resp => {
        console.log(resp)
    })
})