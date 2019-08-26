/*
 * @Author: whisperer
 * @Date: 2019-08-26 14:28:07
 * @LastEditors: whisperer
 * @Description: 
 */

/**
 * @description 监控对象的属性值变化
 * @param {object} obj 监控的对象
 * @param {string} attrs  监控的属性名称
 * @param {function} callback 属性值变化时触发的回调
 */
const monitor = (function () {
    //对对象属性值进行proxy设置
    const setProxy = function (obj, p, callback, attrArray) {
        obj[p] = new Proxy(obj[p], {
            set: function (obj, prop, value) {
                var attrAry = [],
                    attrs;
                Object.assign(attrAry, attrArray);
                attrAry.push(prop);
                attrs = attrAry.join(".");
                if (typeof obj[prop] == "object") {
                    if (typeof value != "object") {
                        callback && callback(value, obj[prop], attrs);
                    } else {
                        if (JSON.stringify(obj[prop]) != JSON.stringify(value)) {
                            callback && callback(value, obj[prop], attrs);
                        }
                    }
                } else if (obj[prop] !== value || isNaN(obj[prop]) && !isNaN(value) || !isNaN(obj[prop]) && isNaN(value)) {
                    callback && callback(value, obj[prop], attrs);
                }
                return Reflect.set(obj, prop, value);
            },
            get: function (obj, prop) {
                return Reflect.get(obj, prop);
            }
        })
    },
        //设置setter和getter
        set_setter_getter = function (obj, attr, attrs, callback, copy) {
            obj.__defineSetter__(attr, function (newV) {
                var old = copy[attr];
                if (JSON.stringify(newV) !== JSON.stringify(old)) {
                    callback && callback(newV, old, attrs);
                }
                return Reflect.set(copy, attr, newV);
            });
            obj.__defineGetter__(attrs, function () {
                return Reflect.get(copy, attr);
            });
        },
        //检查对象的属性值并对子孙属性层进行监控
        setPro = function (obj, p, callback, attrArray) {
            var keys, i, len, iarray = [];
            keys = Object.keys(obj[p]);
            len = keys.length;
            //对路径p的子路径下属性进行监听
            for (i = 0; i < len; i++) {
                Object.assign(iarray, attrArray);
                if (typeof obj[p][keys[i]] == "object") {
                    iarray.push(keys[i]);
                    //限制最大检测层数
                    if (iarray.length > 10) {
                        break;
                    }
                    setPro(obj[p], keys[i], callback, iarray);
                }
            }
            setProxy(obj, p, callback, attrArray);
        },
        //watch-function
        $watch$ = function (obj, attrs, callback) {
            var target, copy, attr,
                attrList = attrs.split(".");
            attr = attrList.pop();
            if (!attrList.length) {
                target = obj;
            } else {
                target = trickFun1("obj." + attrList.join("."));
            }
            copy = JSON.parse(JSON.stringify(target));
            if (typeof target[attr] == "object") {
                setPro(target, attr, callback, attrs.split("."));
            } else {
                set_setter_getter(target, attr, attrs, callback, copy);
            }
            return copy;
        };
    return $watch$;
})();