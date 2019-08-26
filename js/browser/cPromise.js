/*
 * @Author: whisperer
 * @Date: 2019-08-26 14:31:15
 * @LastEditors: whisperer
 * @Description: 
 */
/**
     * @description 将使用到回调的函数转变成使用promise的函数
     * @param {function} fun  使用回调的原函数
     * @param {*} context  函数执行需要的环境
     * @param {number} successCallBackIndex  成功回调所在的参数位置
     */
const cPromise = function (fun, context, successCallBackIndex) {
    var _context = context || this;
    var new_fun = function () {
        var args = Array.prototype.slice.apply(arguments).slice(1),
            hasSuccessCallBack = arguments[0];
        if (!hasSuccessCallBack || args.length >= hasSuccessCallBack) {
            return fun.apply(this, args);
        } else if (args.length < hasSuccessCallBack - 1) {
            args.unshift(this);
            return Function.prototype.bind.apply(new_fun, args);
        } else {
            var self = this;
            return new Promise(function (resolve, reject) {
                args.push(function () {
                    resolve(arguments[0]);
                })
                args.push(function () {
                    reject(arguments[0]);
                })
                fun.apply(self, args);
            });
        }
    }.bind(_context, successCallBackIndex);
    return new_fun;
}