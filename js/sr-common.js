/**
 * @fileOverview 信息化公用js文件
 *
 * @requires jQuery.js
 *
 */

/**
 * @namespace sradmin
 */
window['sradmin'] = window['sradmin'] || {};

/**
 * sradmin.Utils
 *
 * utils组件
 */
(function() {
    /**
     * @namespace sradmin.Utils
     *
     */
    sradmin['Utils'] = sradmin['Utils'] || {};

    var _ns = sradmin.Utils;

    /**
     * cookie
     *
     * @example
	 * 设置: sradmin.Utils.cookie("userId", 'A02387', {'expires': 2}); // expires为时效,天为单位,默认1天
     * 获取: sradmin.Utils.cookie("userId");
     **/
    var cookie = function(name, value, options) {
        if (typeof value != 'undefined') {
            options = options || {};

            if (value === null) {
                value = '';
                options.expires = -1;
            }

            var expires = '',
                path,
                domain,
                secure;

            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;

                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }

                expires = '; expires=' + date.toUTCString();
            }

            path = options.path ? '; path=' + options.path : '';
            domain = options.domain ? '; domain=' + options.domain : '';
            secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', value, expires, path, domain, secure].join('');

        } else {
            var cookieValue = null;

            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);

                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = cookie.substring(name.length + 1);
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };

    $.extend(true, _ns, {
        cookie: cookie
    });

    /**
     * js模版
     * @method tmpl
     * @param {jQuery/String} selector 模版的jQuery对象或者模版标签的选择符
     * @param {Object} data 用于模版匹配的数据
     * @example
     *     sradmin.Utils.tmpl("#tmpl", {a: 1});
     */
    (function() {
        var cache = {},
            bulidTmplFn = function(tmpl) {
                return new Function("obj",
                    "var p=[];" +
                    "with(obj){p.push('" +
                    tmpl.replace(/[\r\t\n]/g, " ")
                        .split("<%").join("\t")
                        .replace(/((^|%>)[^\t]*)'/g, "typeof($1)==='undefined'?'':$1\r")
                        .replace(/\t=(.*?)%>/g, "',(typeof($1)==='undefined'?'':$1),'")
                        .split("\t").join("');")
                        .split("%>").join("p.push('")
                        .split("\r").join("\\'") +
                    "');}return p.join('');"
                );
            },
            template = function(selector, data) {
                var $tmpl,
                    tmpl,
                    fn;

                if (selector instanceof $) {
                    $tmpl = selector;
                    tmpl = $tmpl.html();
                } else if (typeof(selector) == "string") {

                    if(selector.indexOf("<") == 0) {
                        tmpl = selector;
                    } else {
                        $tmpl = $(selector);
                        tmpl = $tmpl.html();
                    }
                }

                fn = !/\W/.test(selector) ? (cache[selector] = cache[selector] || bulidTmplFn(tmpl)) : bulidTmplFn(tmpl);

                return data ? fn(data) : fn;
            };

        $.extend(sradmin.Utils, {
            tmpl: template
        });
    }());

    /**
     * 日期格式化
     *
     * @method dateFormat
     * @param {Date/String/Number} date 所要格式化的日期
     * @param {String} mask 格式化格式："yyyy-mm-dd" | "HH:MM:ss" | "hh:MM:ss tt"等
     * @param {boolean} utc 是否取UTC时间(默认: false)
     * @example
     *     sradmin.Utils.dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
     */
    var dateFormat = function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloS]|"[^"]*"|'[^']*'/g,
            pad = function(val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = "0" + val;
                }
                return val;
            },
            masks = {
                "default": 'yyyy-mm-dd HH:MM:ss',
                "shortDate": 'm/d/yy',
                "shortTime": 'h:MM TT',
                "mediumTime": 'h:MM:ss TT',
                "longTime": 'h:MM:ss TT Z',
                "isoDate": 'yyyy-mm-dd',
                "isoTime": 'HH:MM:ss',
                "isoDateTime": 'yyyy-mm-dd\'T\'HH:MM:ss',
                "isoUtcDateTime": 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
            };

        return function(date, mask, utc) {

            if (!(date instanceof Date)) {
                date = new Date(date);
            }

            if (isNaN(date)) {
                throw new SyntaxError("invalid date");
            }

            mask = masks[mask] || mask || masks["default"];

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    m: m + 1,
                    mm: pad(m + 1),
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    $.extend(true, _ns, {
        dateFormat: dateFormat
    });


    /**
     * money格式化
     *
     * @method moneyFormat
     * @param {String/Number} number 数字
     * @param {Number} places 保留小数位数 (默认: 2)
     * @param {String} symbol 币种符号 (默认: '&yen;')
     * @param {String} thousand 千分位 (默认: ',')
     * @param {String} decimal 小数位 (默认: '.')
     * @example
     *     sradmin.Utils.moneyFormat(222);
     */
    var moneyFormat = function(number, places, symbol, thousand, decimal) {
        number = number || 0;
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        symbol = symbol !== undefined ? symbol : "&yen;";
        thousand = thousand || ",";
        decimal = decimal || ".";

        var negative = number < 0 ? "-" : "",
            i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;

        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
    }

    $.extend(true, _ns, {
        moneyFormat: moneyFormat
    });


    /**
     * 字符串替换
     *
     * @method format
     * @param {String} str 所要替换的字符串
     * @param {Object/String[]} 替换成的值
     * @example
     *     sradmin.Utils.format("name age", {
	 *       "name": "tx",
	 *       "age": "12"
	 *     }); //输出 "tx 12"
     */
    var format = function(str) {

        if (typeof str !== "string") {
            return str;
        }

        var l = arguments.length,
            i = 0,
            reg,
            repalceObj;

        if (l === 2 && $.type(arguments[1]) === 'object') {

            repalceObj = arguments[1];

            var key;
            for (key in repalceObj) {
                if (repalceObj.hasOwnProperty(key)) {
                    reg = new RegExp(key, 'g');
                    str = str.replace(reg, function() {
                        return repalceObj[key];
                    });
                }
            }

        } else {

            repalceObj = arguments;

            for (; i < l - 1; i++) {
                reg = new RegExp('\\{' + i + '\\}', 'g');
                str = str.replace(reg, function() {
                    return repalceObj[i + 1];
                });
            }

        }

        return str;
    };

    $.extend(true, _ns, {
        format: format
    });


    /**
     * url处理方法
     *
     * @method urlParser
     * @param {String} url 所要处理的url地址, 默认值:当前页面url
     * @return
        {
            getParam, 获取url的参数值
        }
     * @example
     var urlparse = sradmin.Utils.urlParser();
     var param = sradmin.Utils.getParam("参数名");
     */
    var urlParser = function(url) {
        var objUrl = {};

        var getFullUrl = function(oUrl) {
            var nUrl;

            if ($.type(oUrl) !== "string" || !oUrl) {
                nUrl = window.location.href;
            } else if (/^(\w+:\/\/)/.test(oUrl)) {
                nUrl = oUrl;
            } else if (oUrl.indexOf('//') == 0) {
                nUrl = window.location.protocol + oUrl;
            } else if (oUrl.indexOf('/') == 0) {
                nUrl = window.location.protocol + '\/\/' + window.location.host + oUrl;
            } else if (oUrl.indexOf('../') == 0) {
                var pathname = window.location.pathname,
                    dirLevel = oUrl.split('../').length - 1;

                var arrDir = pathname.slice(0, pathname.lastIndexOf('/')).split('/'),
                    length = arrDir.length;

                if (dirLevel >= length) {
                    arrDir.length = 0;
                } else {
                    arrDir.length = arrDir.length - dirLevel;
                }

                pathname = arrDir.join('/') + '/';

                nUrl = window.location.protocol + '\/\/' + window.location.host + pathname + oUrl.replace(/\.\.\//g, "");
            } else {
                nUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + oUrl;
            }


            return nUrl;
        };

        var nUrl = getFullUrl(url);
		
		if (!url) {
			var reg = /(\w+:)\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(\?[^#]*)?(#.*)?/i;
			var arr = nUrl.match(reg);
			
			objUrl["href"] = arr[0];
			objUrl["protocol"] = arr[1];
			objUrl["hostname"] = arr[2];
			objUrl["port"] = arr[3] ? arr[3].slice(1) : '80';
			objUrl["host"] = objUrl["hostname"] + (objUrl["port"] != '80' ? (':' + objUrl["port"]) : '');
			objUrl["pagename"] = arr[5] ? arr[5] : '';
			objUrl["pathname"] = (arr[4] ? arr[4] : '') + objUrl["pagename"];
			objUrl["search"] = arr[6] ? arr[6] : '';
			objUrl["hash"] = arr[7] ? arr[7] : '';
			
		} else {
			objUrl["search"] = url.slice(url.indexOf('?'));
		}
		
        var _unserialize = function(s) {
            var obj = {},
                arrParam = s.split('&'),
                arrPair,
                i;

            for (i = 0; i < arrParam.length; i++) {
                arrPair = arrParam[i].split('=');

                arrPair[0] && (obj[arrPair[0]] = arrPair[1]);
            }

            return obj;
        };

        var get = function(key) {
            return objUrl[key];
        };

        var getParam = function(key) {
            var params = objUrl["search"].slice(1);
            var oParams = _unserialize(params);

            if (key === undefined || key === '') {
                return oParams;
            }

            return oParams[key];
        };

        return {
            getParam: getParam,
        };
    };

    $.extend(true, _ns, {
        urlParser: urlParser,
		getUrlParam: urlParser().getParam
    });
	
	/**
	 * 字符串去除空格
	 *
	 * @method trim
	 * @param {String} str 要去除空格的字符串
	 * @param {number} type 选择类型 1-所有空格，2-前后空格，3-前空格，4-后空格
	 * @example
	 *     sradmin.Utils.trim("name age", 1);
	 */
	var trim = function trim(str,type){
		switch (type){
			case 1:return str.replace(/\s+/g,"");
			case 2:return str.replace(/(^\s*)|(\s*$)/g, "");
			case 3:return str.replace(/(^\s*)/g, "");
			case 4:return str.replace(/(\s*$)/g, "");
			default:return str;
		}
	}
	
	$.extend(true, _ns, {
	    trim: trim
	});
	
	/**
	 * 获取当前设备
	 *
	 * @method getDeviceType
	 * @example
	 *     sradmin.Utils.getDeviceType();
	 */
	var getDeviceType = function getDeviceType() {
	  var deviceType = 'PC' //其他
	  var u = navigator.userAgent
	  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 
	  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) 
	  if (isAndroid) {
		deviceType = 'Android'
	  } else if (isiOS) {
		deviceType = 'IOS'
	  }
	  return deviceType
	}
	
	$.extend(true, _ns, {
	    getDeviceType: getDeviceType
	});

}());

/**
 * sradmin.UI
 *
 * UI组件
 */
(function () {
	/**
	 * @namespace sradmin.UI
	 *
	 */
	sradmin['UI'] = sradmin['UI'] || {};
	
	var _ui = sradmin.UI;
	
	/**
	 * 确认弹框组件
	 *
	 * @method show_modal
	 * @param {Boolean} alert_or_confirm 取值:true——弹框(一个按钮);false——确认框(两个按钮)
	 * @param {String} modal_contents 提示文案
	 * @param {String} btn1_text 按钮1文案
	 * @param {String} btn2_text 按钮2文案
	 * @param {Function} btn1_fn 按钮1执行的函数
	 * @param {Function} btn1_fn 按钮2执行的函数
	 * @param {Boolean} has_countdown 是否需要倒计时自动关闭
	 * @param {Function} close_fn 倒计时5秒后执行的方法
	 * @example
	 *     sradmin.UI.show_modal();
	 */
	var show_modal = function show_modal(alert_or_confirm, modal_contents, btn1_text, btn2_text, btn1_fn, btn2_fn, has_countdown, close_fn) {
		var modal_bg = document.createElement("div");
		var modal_container = document.createElement("div");
   
		var modal_title = document.createElement("div");
		var modal_content = document.createElement("div");
		var modal_time = document.createElement('div');
		var modal_time_num = document.createElement('span');
		var modal_time_text = document.createElement('span');
	    var modal_footer = document.createElement("div");
	          //设置id
	    modal_bg.setAttribute("id","modal_bg");
	    modal_container.setAttribute("id","modal_container");
	    modal_title.setAttribute("id","modal_title");
	    modal_content.setAttribute("id","modal_content");
	    modal_time.setAttribute("id","modal_time");
	    modal_time_num.setAttribute("id","modal_time_num");
	    modal_time_text.setAttribute("id","modal_time_text");
	    modal_footer.setAttribute("id","modal_footer");
	          //设置样式
	    modal_bg.style.cssText="display:block;" +
	              "background-color: rgba(0, 0, 0, 0.8);" +
	              "position:fixed;" +
	              "top:0;" +
	              "bottom:0;" +
	              "right:0;" +
	              "left:0;";
	    modal_container.style.cssText="background-color:white;" +
	              "width:400px;" +
	              "height:160px;" +
	              "margin:15% auto;" +
	  			"border-radius: 12px;" +
	  			"border: 1px solid #337ab7;" +
	  			"background: #eee;";
	    modal_title.style.cssText="color:white;" +
	              "width:100%;" +
	              "height:30px;"+
	              "line-height:50px;"; 
	    modal_content.style.cssText="color:black;" +
	              "text-align:center;" +
	              "width:100%;" +
	              "height:55px;"
		modal_footer.style.cssText="padding:14px 15px 15px;" +
	              "color:white;" +
	              "width:100%;" +
	              "height:60px;";
	   
		if (has_countdown) {
		    modal_time.style.cssText="display:block;" +
				"text-indent: 2em;";
		    modal_time_num.style.cssText="color:red;"
			modal_container.appendChild(modal_time);
		}
	    modal_container.appendChild(modal_title);
	    modal_container.appendChild(modal_content);
	    modal_time.appendChild(modal_time_num);
	    modal_time.appendChild(modal_time_text);
	    modal_container.appendChild(modal_footer)
	    modal_bg.appendChild(modal_container);
	    //将整个模态框添加到body中
	    document.body.appendChild(modal_bg);
	   
	    //给模态框添加相应的内容
	    modal_content.innerHTML = modal_contents;
	  	if (has_countdown) {
			// 倒计时
			modal_time_text.innerHTML = '秒后自动关闭'
			modal_time_num.innerHTML = 5
			
			var num = 5;
			var interval = setInterval(function () {
				if (num === 1) {
					clearInterval(interval);
					if (close_fn) {
						close_fn();
					}
					document.body.removeChild(modal_bg);
				} else {
					num--
					modal_time_num.innerHTML = num			
				}
			}, 1000)
		}
	   
		//制作确定按钮和取消按钮
		var button2 = document.createElement("div");
		var button1  = document.createElement("div");
		button2.style.cssText="border-radius:5px;" +
		  "color:white;" +
		  "text-align:center;" +
		  "line-height:20px;" +
		  "font-size:14px;" +
		  "float:right;" +
		  "background-color: #888;" +
		  "padding:6px 12px;" +
		  "margin-right:50px;" +
		  "cursor: pointer;"
		button1.style.cssText="border-radius:5px;" +
		  "color:white;" +
		  "text-align:center;" +
		  "line-height:20px;" +
		  "font-size:14px;" +
		  "float:right;" +
		  "background-color: #337ab7;" +
		  "padding:6px 12px;" +
		  "margin-right:16px;" +
		  "cursor: pointer;"
		button2.innerHTML = btn2_text;
		button1.innerHTML = btn1_text;
		if(alert_or_confirm){
		  modal_footer.appendChild(button2);
		}else {
		  modal_footer.appendChild(button2);
		  modal_footer.appendChild(button1);
		}
	   
		//添加按钮事件
		if(button1.addEventListener){//判断有误此属性
			button1.addEventListener("click", function () {
				document.body.removeChild(modal_bg);
				clearInterval(interval);
				if (btn1_fn) {
					btn1_fn()
				}
			});
		}else{
			button1.attachEvent("onclick", function () {
				document.body.removeChild(modal_bg);
				clearInterval(interval);
				if (btn1_fn) {
					btn1_fn()
				}
			});
		}
		
		if(button2.addEventListener){//判断有误此属性
			button2.addEventListener("click", function () {
				document.body.removeChild(modal_bg);
				clearInterval(interval);
				if (btn2_fn) {
					btn2_fn()
				}
			});
		}else{
			button2.attachEvent("onclick", function () {
				document.body.removeChild(modal_bg);
				clearInterval(interval);
				if (btn2_fn) {
					btn2_fn()
				}
			});
		}
	}
	
	$.extend(true, _ui, {
	    show_modal: show_modal
	});
	
	/**
	 * 提示框
	 *
	 * @method toast
	 * @param {String} msg 提示文案
	 * @param {Number} duration 多少毫秒后自动消失,默认3000毫秒
	 * @example
	 *     sradmin.UI.toast.success('测试');
	 *     sradmin.UI.toast.error('测试');
	 *     sradmin.UI.toast.warning('测试');
	 */
	var toast = {
		toastFn: function (msg, duration, backgroundColor, fontColor, borderColor) {
			duration = isNaN(duration) ? 3000 : duration;
			var m = document.createElement('div');
			m.innerHTML = msg;
			m.style.cssText = "font-family:siyuan;max-width:60%;min-width: 150px;padding:0 14px;height: 40px;color: " + fontColor +";line-height: 40px;text-align: center;border-radius: 4px;position: fixed;top:5%;left: 50%;transform: translate(-50%, -50%);z-index: 999999;background: " + backgroundColor + ";border:1px solid " + borderColor + ";font-size: 16px;";
			document.body.appendChild(m);
			setTimeout(function() {
				var d = 0.5;
				m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
				m.style.opacity = '0';
				setTimeout(function() {
					document.body.removeChild(m)
				}, d * 1000);
			}, duration);
		},
		success: function (msg, duration) {
			toast.toastFn(msg, duration, '#49cc89', '#fff', '#bce8f1')
		},
		error: function (msg, duration) {
			toast.toastFn(msg, duration, '#ea5757', '#fff', '#ebccd1')
		},
		warning: function (msg, duration) {
			toast.toastFn(msg, duration, '#dab805', '#fff', '#faebcc')
		},
	}
	
	$.extend(true, _ui, {
	    toast: toast
	});
	
	/**
	 * loading
	 *
	 * @method loading
	 * @example
	 *     sradmin.UI.loading.show();
	 *     sradmin.UI.loading.hide();
	 */
	var loading = {
		loadingFn: function (isShow) {
			var loadingDiv = $('<div id="loadingDiv"><div id="over" style=" position: fixed;top: 0;left: 0; width: 100%;height: 100%; background-color: #f5f5f5;opacity:0.5;z-index: 1000;"></div><div id="layout" style="position: fixed;top: 40%; left: 40%;width: 20%; height: 20%;  z-index: 1001;text-align:center;"><img src="//vmat.gtimg.com/kt/common/offenv/ajax-loading.gif"/></div></div>')
			if (isShow) {
				$('body').append(loadingDiv)
			} else {
				$('#loadingDiv').remove()
			}
		},
		show: function () {
			loading.loadingFn(true)
		},
		hide: function () {
			loading.loadingFn(false)
		},
	}
	
	$.extend(true, _ui, {
	    loading: loading
	});
	
	/**
	 * 分页插件
	 *
	 * @name paginator
	 * @example
		new sradmin.UI.paginator({
			loadData: function(opt) {			
				//opt.page, opt.pageSize;				
			},
			totalPage: Math.ceil(total / rows),
			page: pages,
			rows: rows,
			pageViews: 3,
			ulCls: 'page',
			pageType: 'normal',
			pageWrapId: '#prog_page_wrap'
		}).init();
	 */
	(function() {
	
		function page(options) {
			//当前页号
			this.page = parseInt(options.page, 10) || 1;
			//每页显示数据条数
			this.rows = parseInt(options.rows, 10) || 5;
			//点击page list加载数据接口
			this.loadData = options.loadData || function() {};
			//翻页wrap id
			this.pageWrapId = options.pageWrapId;
			//总页数
			this.totalPage = options.totalPage;
			//显示可点击页码数
			this.pageViews = options.pageViews || 3;
			this.ulCls = options.ulCls || 'pagination';
			//可点击的page list的class
			this.liCls = options.liCls || '';
			//当前页面page list的class
			this.liClsCurrent = options.liClsCurrent || 'active';
			//不可操作的page list的class
			this.liClsDisabled = options.liClsDisabled || 'disabled',
				this.pageType = options.pageType || "simple",
				this.hasmore = options.hasmore || 0;
			this.showTotal = options.showTotal || false;
		};
	
		//翻页初始化，从此开始执行
		page.prototype.init = function() {
	
			if (this.pageType == "simple") {
				this.setSimplePageListHTML();
			} else {
				this.setNormalPageListHTML();
			}
		};
	
		//重构page list的html，并塞入page wrap
		page.prototype.setNormalPageListHTML = function() {
	
			if (this.totalPage <= 1) {
				$(this.pageWrapId).html('');
				return;
			}
	
	
			var html = ["<ul class='" + this.ulCls + "' style='padding:0;margin:0;list-style:none'>"];
			var pageCount = this.totalPage,
				showPageNums = this.pageViews,
				halfPage = Math.ceil(showPageNums / 2),
				_page = this.page,
				pageList = [],
				startNum = 1,
				endPageNum;
	
			startNum = (pageCount < showPageNums || _page < halfPage) ?
				1 : ((_page >= (pageCount - halfPage + 1)) ?
					(pageCount - showPageNums + 1) : (_page - halfPage + 1));
	
			endPageNum = startNum + showPageNums;
			endPageNum = endPageNum > pageCount ? (pageCount + 1) : endPageNum;
	
			for (var i = startNum; i < endPageNum; i++) {
				_page == i ? (pageList.push("<li class='" + this.liClsCurrent + "' data-page='" + i + "'><a href='javascript:;'>" + i + "</a></li>")) : (pageList.push("<li class='" + this.liCls + "' data-page='" + i + "'><a href='javascript:;'>" + i + "</a></li>"));
			}
	 
			//组装page list
			//首页，上一页
			if (_page !== 1) {
				var prev = "<li class='" + this.liCls + " previous ' data-page='" + (this.page - 1) + "'><a href='javascript:;'><i class='fa icon-angle-left la la-angle-left'></i></a></li>";
				var first_page = "<li class='" + this.liCls + " first ' data-page='1'><a href='javascript:;'>&laquo;</a></li>";
			} else {
				var prev = "<li class='" + this.liClsDisabled + " previous'><a href='javascript:;'><i class='fa icon-angle-left la la-angle-left'></i></a></li>";
				var first_page = "<li class='" + this.liClsDisabled + " first '><a href='javascript:;'>&laquo;</a></li>";
			}
			html.push(first_page);
			html.push(prev);
	
			//数字页码
			if (pageList.length !== 0) {
				html.push(pageList.join(''));
			}
	
			if (_page !== pageCount) {
				var next = "<li class='" + this.liCls + " next' data-page='" + (this.page + 1) + "'><a href='javascript:;'><i class='fa icon-angle-right la la-angle-right'></i></a></li>";
				var last_page = "<li class='" + this.liCls + " last' data-page='" + pageCount + "' style='margin-right: 20px;'><a href='javascript:;'>&raquo;</a></li>";
			} else {
				var next = "<li class='" + this.liClsDisabled + " next'><a href='javascript:;'><i class='fa icon-angle-right la la-angle-right'></i></a></li>";
				var last_page = "<li class='" + this.liClsDisabled + " last' style='margin-right: 20px;'><a href='javascript:;'>&raquo;</a></li>";
			}
			html.push(next);
			html.push(last_page);
			html.push('</ul>');
			//条数信息
			var info = '<div class="pagination-info">当前第' + _page + '页, 共' + pageCount + '页</div>';
			
			html = html.join('') + info;
			$(this.pageWrapId).html(html);
			this.initPageListHTMLEvent();
			
			$('li').css({
				'float': 'left',
				'marginLeft': '10px'
			})
		};
	
		//重构page list的html，并塞入page wrap
		page.prototype.setSimplePageListHTML = function() {
	
			if (!this.hasmore && this.page == 1) {
	
				return;
			}
	
			var html = ["<ul class='" + this.ulCls + "'>"];
			var
				_page = this.page;
	
			//组装page list
			//首页，上一页
			if (_page !== 1) {
				var prev = "<li class='" + this.liCls + "' data-page='" + (this.page - 1) + "'><a href='javascript:;'>上一页</a></li>";
				var first_page = "<li class='" + this.liCls + "' data-page='1'><a href='javascript:;'>首页</a></li>";
			} else {
				var prev = "<li class='" + this.liClsDisabled + "'><a href='javascript:;'>上一页</a></li>";
				var first_page = "<li class='" + this.liClsDisabled + "'><a href='javascript:;'>首页</a></li>";
			}
			html.push(first_page);
			html.push(prev);
	
			//数字页码
			html.push("<li class='" + this.liClsCurrent + "' data-page='" + this.page + "'><a href='javascript:;'>" + this.page + "</a></li>");
	
			if (this.hasmore) {
				var next = "<li class='" + this.liCls + "' data-page='" + (this.page + 1) + "'><a href='javascript:;'>下一页</a></li>";
			} else {
				var next = "<li class='" + this.liClsDisabled + "'><a href='javascript:;'>下一页</a></li>";
			}
			html.push(next);
	
			$(this.pageWrapId).html(html.join(''));
			this.initPageListHTMLEvent();
		};
		//设置page list点击事件，点击后重新加载数据
		page.prototype.initPageListHTMLEvent = function() {
			var _this = this;
			$(this.pageWrapId + " li").unbind('click').bind('click', function() {
				var page = parseInt($(this).attr('data-page'), 10);
				_this.loadData(page);
			});
		};
		sradmin.UI.paginator = page;
	})();
}());
