/*
 * @Author: whisperer
 * @Date: 2019-08-26 14:29:07
 * @LastEditors: whisperer
 * @Description: 
 */
const trickFun1 = 1000 > 1 ? eval : null;
/**
    * @description 像angularjs 的 ng-repeat一样解析字符
    * @param {object} objorarray {}|[]  遍历的数据源
    * @param {string} pstr  解析需要用的字符
    * @param {function} callback 遍历执行的回调
    */
const parse = (function () {
    const arrayReg = /^\s*(?:([\w\W]+)\s+(?:as))?\s*(?:([\w\W]+)\s+(?:for)\s+)?([\w\W]+)\s+in\s+([\w\W]+)\s*$/,
        mapReg = /^\s*(?:([\w\W]+)\s+(?:as))?\s*([\w\W]+)\s+(?:for)\s+(\([\w\W]+,[\w\W]+\))\s+in\s+([\w\W]+)\s*$/;
    var cutStr = function (str, f) {
        var a1 = [],
            a2 = [],
            i = 1;
        try {
            a1 = f ? str.match(arrayReg) : str.match(mapReg);
            for (; i < a1.length; i++) {
                if (a1[i] != undefined) {
                    a2.push(a1[i]);
                }
            }
        } catch (e) {
            throw new Error("语法解析错误,请检查语法");
        }
        return a2;
    };
    return function (objorarray, pstr, callback) {
        var t = typeof objorarray,
            flag, gra_ary, i, l, len, keys, estr, model, view, temp;
        //限制解析对象类型为数组或者对象
        if (t != "object") {
            throw new Error("解析对象类型错误");
        }
        if (pstr == "") {
            throw new Error("表达式字符串必须");
        }
        flag = objorarray instanceof Array;
        gra_ary = cutStr(pstr, flag);
        l = gra_ary.length;
        len = objorarray.length;
        ///区分数组还是非数组
        try {
            if (flag) {
                for (i = 0; i < len; i++) {
                    estr = "var " + gra_ary[l - 2] + "=" + JSON.stringify(objorarray[i]);
                    switch (l) {
                        case 2:
                            model = view = objorarray[i];
                            break;
                        case 3:
                            trickFun1(estr);
                            model = view = trickFun1(gra_ary[0]);
                            break;
                        case 4:
                            trickFun1(estr);
                            model = trickFun1(gra_ary[0]);
                            view = trickFun1(gra_ary[1]);
                            break;
                        default:
                            throw new Error("语法错误");
                    }
                    callback(model, view, i);
                }
            } else {
                keys = Object.keys(objorarray);
                keys.sort();
                for (i = 0; i < keys.length; i++) {
                    temp = gra_ary[l - 2].replace(/[\(\)]/g, "").split(",");
                    estr = "var " + temp[0] + " = '" + keys[i] + "'";
                    trickFun1(estr);
                    estr = "var " + temp[1] + "=" + JSON.stringify(objorarray[keys[i]]);
                    trickFun1(estr);
                    switch (l) {
                        case 3:
                            model = view = trickFun1(gra_ary[0]);
                            break;
                        case 4:
                            model = trickFun1(gra_ary[0]);
                            view = trickFun1(gra_ary[1]);
                            break;
                        default:
                            throw new Error("语法错误");
                    }
                    callback(model, view, i);
                }
            }
        } catch (e) {
            throw e;
        }
    };
})();