/**
 *##存储组件
 从qmik里的存储插件里复制出来的源码，及调整
 ##依赖框架qmik:https://github.com/leochen36/qmik
 */
(function(Q) {
	var local = window.localStorage || {};
	var session = window.sessionStorage || {};
	var pathname = location.pathname;
	var prefixCache = pathname + "/"; //key前辍

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

	function to2Bit(num) {
		num = Math.abs(parseInt((num + "").replace(/[^0-9]/g, "").substring(0, 2)) || 0);
		return num < 10 ? "0" + num : num + ""
	}

	//清除缓存
	(function() {
		var date = new Date();
		var hhmm = parseInt(to2Bit(date.getHours()) + "" + to2Bit(date.getMinutes()));
		if (hhmm < 900 && hhmm > 400) { //每天4-9点清除本地缓存
			if (Store.get("sys") != true) {
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
				Store.set("sys", true, 24 * 60 * 60);
			}
		}
	})();
})(Qmik);