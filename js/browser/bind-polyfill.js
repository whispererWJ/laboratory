/*
 * @Author: whisperer
 * @Date: 2019-07-19 09:50:08
 * @LastEditors: whisperer
 * @Description: 个人练习   :对function的bind方法进行兼容
 */
(function (funPrototype) {
    'use strict';

    /* eslint no-invalid-this: 1 */
    const slice = Array.prototype.slice;

    function expect(fun, that, args = []) {
        return function () {
            let _args = slice.call(arguments, 0);   //第二波参数
            return fun.apply(that, args.concat(_args));
        }
    }

    funPrototype.bind_p2 = function bind_polyfill(that) {
        var target = this, args = slice.call(arguments, 1);//取上下文以外的  第一波参数
        return expect(target, that, args);
    }

})(Function.prototype)