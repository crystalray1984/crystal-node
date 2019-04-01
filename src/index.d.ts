import { EventEmitter } from 'events'

declare type Listener = (...args: any) => void

/**
 * 应用程序
 */
declare class Application extends EventEmitter {
    /**
     * 初始化应用程序
     * @param root 应用程序根路径
     */
    constructor(root: string)

    /**
     * 路径配置对象
     */
    readonly paths: Application.Paths

    /**
     * 应用是否已初始化完成
     */
    readonly isReady: boolean

    /**
     * 应用程序初始化Promise
     */
    ready(): Promise<void>

    on(type: 'ready', listener: Listener): this
    on(type: string | number, listener: Listener): this

    addListener(type: 'ready', listener: Listener): this
    addListener(type: string | number, listener: Listener): this

    once(type: 'ready', listener: Listener): this
    once(type: string | number, listener: Listener): this

    prependListener(type: 'ready', listener: Listener): this
    prependListener(type: string | number, listener: Listener): this

    prependOnceListener(type: 'ready', listener: Listener): this
    prependOnceListener(type: string | number, listener: Listener): this

    removeListener(type: 'ready', listener: Listener): this
    removeListener(type: string | number, listener: Listener): this

    off(type: 'ready', listener: Listener): this
    off(type: string | number, listener: Listener): this
}

declare namespace Application {
    /**
     * 应用程序路径对象
     */
    interface Paths {
        /**
         * 应用程序根路径
         */
        readonly root: string

        /**
         * 代码路径
         */
        readonly src: string

        /**
         * 配置文件路径
         */
        readonly config: string

        /**
         * 数据访问层代码路径
         */
        readonly db: string

        /**
         * 初始化代码路径
         */
        readonly init: string
    }
}

export = Application