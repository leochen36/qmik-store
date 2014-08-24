/**
 *##存储组件
 从qmik里的存储插件里复制出来的源码，及调整
 ##依赖框架qmik:https://github.com/leochen36/qmik
 */
(function(Q) {
	var local = window.localStorage || {};
	var session = window.sessionStorage || {};
	var pathname = location.pathname;
	//缓存名前辍,这样的设计思想是防止同一域名下,不同应用路径的页面间,储存的key冲突
	var prefixCache = location.protocol + pathname + "/"; //key前辍

	function parseJSON(value) {
		try {
			return JSON.parse(value)
		} catch (e) {
			return value
		}
	}

	function ttlTime(ttl) {
		ttl = Math.abs(ttl);
		return new Date().getTime() + ttl * 1000;
	}

	function getKey(key) {
		return prefixCache + key;
	}

	function getCookie(key) {
		if (document.cookie) {
			var arr = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));
			return arr != null ? unescape(arr[2]) : null;
		}
		return null;
	}
	var Store = {
		set: function(key, value, ttl) { // 储存到localStorage,ttl:unit is second
			try {
				key = getKey(key);
				ttl = ttl || 60 * 60; //默认1小时
				var item = {
					data: value,
					ttl: ttlTime(ttl)
				};
				local[key] = JSON.stringify(item);
			} catch (e) {
				console.log(e);
			}
		},
		setSession: function(key, value) { // 储存到sessionStorage
			try {
				key = getKey(key);
				var item = {
					data: value
				};
				session[key] = JSON.stringify(item);
			} catch (e) {
				console.log(e);
			}
		},
		get: function(key) {
			try {
				key = getKey(key);
				var value = local[key];
				if (value) {
					var item = parseJSON(value);
					if (item && !Q.isNull(item.data) && item.ttl) {
						if (item.ttl >= 0 && item.ttl <= new Date().getTime()) {
							Store.remove(key);
							return null
						}
						return item.data
					}
				}
			} catch (e) {
				console.log(e);
			}
			return null
		},
		getSession: function(key) {
			try {
				key = getKey(key);
				var val = session[key];
				if (val) {
					var item = parseJSON(session[key]);
					return item.data
				}
			} catch (e) {}
			return null
		},
		getCookie: getCookie,
		remove: function(key) {
			key = getKey(key);
			delete local[key];
		},
		removeSession: function(key) {
			key = getKey(key);
			delete session[key];
		},
		clear: function() {
			try {
				local.clear()
			} catch (e) {
				local = {};
			}
		},
		clearSession: function() {
			try {
				session.clear()
			} catch (e) {
				session = {};
			}
		}
	};

	Q.sun.define("lib/qmik/Store", function(require, exports, module) {
		module.exports = Store;
	});

	//清除缓存,每天清理一次,
	(function() {
		//储存的个数超过50000条,清空储存
		if(local.length >= 10000){
			console.log("localStorage length is large,,,,clear store");
			Store.clear();
		}
		var clearKey="___chear_flag";
		if (Store.get(clearKey) != true) {
			try {
				for (var key in local) {
					if (new RegExp("^" + prefixCache).test(key)) {
						key = key.replace(prefixCache, "");
						Store.get(key);
					}
				}
			} catch (e) {
				console.log(e);
			}
			Store.set(clearKey, true, 24 * 60 * 60);//保存时间 24小时
		}
	})();
})(Qmik);