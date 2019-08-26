/*
 * @Author: whisperer
 * @Date: 2019-07-19 17:14:27
 * @LastEditors: whisperer
 * @Description: 个人练习:  对promise  进行仿构
 *  关键点:  1. promise.then()的参数函数会在下一个micro-task执行,所以使用类似的MutationObserver来控制代码执行顺序
 *          2. promise.then()参数函数的返回值为非Promise对象时,则直接生成一个新的promise 链接到下一个then方法
 *          3. promise.then()参数函数的返回值为Promise对象时,则将该对象链接到下一个then方法(也就是下一个then方法的数据时来自这个返回值Promise的resolve)
 */
(function (w, d, EventCenter) {
    //常量定义
    const promiseStateEnum = { pending: "pending", resolved: "resolved", rejected: "rejected" },
        resolverMsg = "Promise resolver undefined is not a function",
        noNewMsg = "请使用new关键字",
        stringForPromise = '[function Promise]',
        promiseToStringSys = Symbol('Symbol.toStringTag'),
        mutationConfig = { attributes: true, childList: false, subtree: false };
    //Promise  会用到的一些工具方法
    function changeState(that, state) { that['[[PromiseStatus]]'] = promiseStateEnum[state]; }
    function setPromiseValue(that, value) { that['[[PromiseValue]]'] = value; }
    function nextTickRun(fun) {
        let div = d.createElement('div'),
            mutationObserver = new MutationObserver(() => {
                mutationObserver.disconnect();
                fun();
            });
        mutationObserver.observe(div, mutationConfig);
        div.classList.toggle('aaa');
    }


    function MyPromise(pFun) {
        let _eventCenter = new EventCenter();

        return (function (eventCenter, _Promise) {
            function runThenFun(fun, that) {
                return new mPromise((resolve, reject) => {
                    eventCenter.on('resolved', (data) => {
                        let thenReturn = fun(data);
                        if (thenReturn instanceof mPromise) {
                            thenReturn.then((thenData) => { resolve(thenData); })
                        } else {
                            nextTickRun(() => { resolve(thenReturn); })
                        }
                    })
                })
            }

            function initPromise(that) {
                changeState(that, 'pending');
                setPromiseValue(that);
            }

            function mPromise(fun) {
                if (!(this instanceof mPromise)) { throw (new TypeError(noNewMsg)); }
                if (!(fun instanceof Function)) { throw (new TypeError(resolverMsg)); }
                initPromise(this);

                let resolve = (data) => {
                    changeState(this, 'resolved');
                    setPromiseValue(this, data);
                    nextTickRun(() => {
                        eventCenter.emit('resolved', data);
                    })
                }, reject = () => {
                    changeState(this, 'rejected');
                };
                fun(resolve, reject);
            }

            mPromise.prototype = {
                //  resolve执行
                then: function (fun) { return runThenFun(fun, this); },
                // // 最终执行
                // finally: function (fun) { throw Error('尚未定义');},
                // //错误时执行
                // error: function (fun) { throw Error('尚未定义');},
                // //管道方法
                // pipe: function (fun) { throw Error('尚未定义'); },
                //设置转为字符串时 显示的字符串
                toString: function () { return stringForPromise; }

            };

            Object.defineProperty(mPromise.prototype, promiseToStringSys, {
                value: 'Promise',
                enumerable: false,
                configurable: false,
                writable: false
            })
            _Promise.prototype = mPromise.prototype;

            Object.freeze(mPromise.prototype);
            return (pFun) => { return new mPromise(pFun) };
        })(_eventCenter, MyPromise)(pFun);
    }

    w.MP = MyPromise;

})(window, document, (function () {
    /**
   * @description: 事件中心类
   * */
    function EventCenter() {
        Object.defineProperties(this, {
            '_store': { configurable: true, enumerable: false, value: {}, writable: false },
            '_state': {
                configurable: true, enumerable: false, value: {}, writable: false
            }
        })
        this.getState = (type) => (this._state[type] || [false]);
        this.setState = (type, value) => { this._state[type] = [true, value]; }
    }

    function safeType(store, type) {
        var register = new Set();
        if (store.hasOwnProperty(type)) {
            register = store[type];
        } else {
            store[type] = register;
        }
        return register;
    }
    //原型扩展
    EventCenter.prototype = {
        /**
         * @description: 注册监听某个事件
         * @param {string} type  事件类型
         * @param {function} callback  回调
         */
        'on': function (type, callback) {
            var store = this._store,
                register = safeType(store, type);
            if (typeof callback !== 'function') { return; }
            register.add(callback);
            let typeState = this.getState(type);
            if (typeState[0]) {
                callback(typeState[1]);
            }
        },
        /**
         * @description: 广播某个事件
         * @param {string} type  事件类型
         * @param {object} data  事件触发数据
         */
        'emit': function (type, data) {
            var store = this._store,
                register = safeType(store, type);
            this.setState(type, data);
            register.forEach(function (item) {
                item && item(data);
            })
        },
        /**
         * @description: 注销监听某个事件
         * @param {string} type  事件类型
         * @param {function} callback  回调  如果具体了某个回调则只注销对应的,如果为true则注销全部
         */
        'off': function (type, callback) {
            var store = this._store,
                register = safeType(store, type);
            if (callback === true) {
                register.clear();
            } else {
                register.delete(callback);
            }
        }
    };
    Object.freeze(EventCenter.prototype);
    return EventCenter;
})())