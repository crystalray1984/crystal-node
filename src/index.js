'use strict'

const { EventEmitter } = require('events')
const path = require('path')
const extend2 = require('extend2')

/**
 * 尝试加载一个模块
 * @param {string} name 模块名或路径
 * @param {*} fallback 加载失败时返回的数据
 */
function tryRequire(name, fallback) {
    try {
        return require(name)
    }
    catch (err) {
        if (err instanceof Error && err.code === 'MODULE_NOT_FOUND') {
            return fallback
        }
        throw err
    }
}

/**
 * 尝试从多个路径中加载模块
 * @param  {...string} names 
 */
function requireElse(...names) {
    for (let i = 0; i < names.length; i++) {
        let mod = tryRequire(names[i])
        if (typeof mod !== 'undefined') {
            return mod
        }
    }
}

/**
 * 应用程序对象
 */
class Application extends EventEmitter {
    /**
     * 应用程序根目录
     * @param {string} root 
     */
    constructor(root) {
        super()
        root = path.resolve(root)
        this._isReady = false
        this._paths = {
            root,
            src: path.resolve(root, './src'),
            config: path.resolve(root, './src/config'),
            init: path.resolve(root, './src/init'),
            db: path.resolve(root, './src/db')
        }

        //执行应用程序初始化
        this._initPromise = new Promise((resolve, reject) => {
            this.init().then(() => {
                this._isReady = true
                this.emit('ready')
                resolve()
            }).catch(err => {
                this.emit('error', err)
                reject(err)
            })
        })
    }

    get paths() {
        return this._paths
    }

    get isReady() {
        return this._isReady
    }

    ready() {
        return this._initPromise
    }

    eventNames() {
        return ['ready']
    }

    /**
     * 应用程序初始化
     */
    async init() {
        //加载配置文件
        this.config = tryRequire(this.paths.config, {})
        //加载环境特定配置文件
        this.config = extend2(true, this.config, tryRequire(path.resolve(this.paths.config, `./${process.env.NODE_ENV}`), {}))

        //加载前置初始化代码
        let preInit = tryRequire(path.resolve(this.paths.init, './pre-init'))
        if (typeof preInit === 'function') {
            await preInit(this)
        }

        //初始化数据库
        this.db = {}

        if (this.config.db) {
            for (let type in this.config.db) {
                let options = this.config.db[type]
                if (typeof options === 'function') {
                    this.db[type] = await options(this)
                }
                else {
                    this.db[type] = await this.connectToDb(type, this.config.db[type])
                }
            }
        }

        //加载后置初始化代码
        let afterInit = tryRequire(path.resolve(this.paths.init))
        if (typeof afterInit === 'function') {
            await afterInit(this)
        }
    }

    /**
     * 初始化数据库连接
     * @param {string} type 
     * @param  {...any} args 
     */
    async connectToDb(type, options) {
        let factory
        factory = requireElse(path.resolve(this.paths.db, `./${type}`), `crystal-node-${type}`)
        if (typeof factory !== 'function') {
            throw new Error(`database type '${type}' is not support`)
        }

        return await factory(options)
    }

    on(type, listener) {
        super.on(type, listener)
        if (type === 'ready' && this.isReady) {
            listener.call(this)
        }
        return this
    }

    addListener(type, listener) {
        return this.on(type, listener)
    }

    once(type, listener) {
        super.once(type, listener)
        if (type === 'ready' && this.isReady) {
            listener.call(this)
        }
        return this
    }

    prependListener(type, listener) {
        super.prependListener(type, listener)
        if (type === 'ready' && this.isReady) {
            listener.call(this)
        }
        return this
    }

    prependOnceListener(type, listener) {
        super.prependOnceListener(type, listener)
        if (type === 'ready' && this.isReady) {
            listener.call(this)
        }
        return this
    }
}

module.exports = Application