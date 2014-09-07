/**
 *##存储组件
 从qmik里的存储插件里复制出来的源码，及调整
 ##依赖框架qmik:https://github.com/leochen36/qmik
 */
(function(Q) {
	var local = window.localStorage || {};
	var session = window.sessionStorage || {};
	var pathname = location.pathname;
	var prefix1 = "qmik/store/"; //第一级存储名前辍,不能变
	var prefix2 = location.protocol + pathname + "/"; //第二级存储名前辍,可变
	//缓存名前辍,这样的设计思想是防止同一域名下,不同应用路径的页面间,储存的key冲突
	var prefixCache = prefix1 + prefix2; //key前辍
	var maxStoreSize = 10000; //最大的储存个数(本地缓存)
	var maxStoreTime = 7 * 24 * 60 * 60; //最长存储7天数据,单位为秒


	function ttlTime(ttl) {
		ttl = Math.abs(ttl);
		ttl = ttl > maxStoreTime ? maxStoreTime : ttl; //最长7天
		return new Date().getTime() + ttl * 1000;
	}

	function getKey(key) {
		return prefixCache + key;
	}

	var Store = {
		set: function(key, value, ttl) { // 储存到localStorage,ttl:unit is second
			key = getKey(key);
			set(key, value, ttl);
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
		get: function(key) { //对key做处理,取数据并返回
			key = getKey(key);
			return get(key);
		},
		getSession: function(key) {
			try {
				key = getKey(key);
				var val = session[key];
				if (val) {
					var item = JSON.parse(session[key]);
					return item.data
				}
			} catch (e) {
				Store.removeSession(key.replace(prefixCache, ""));
				console.log("get session data is error:", key);
			}
			return null
		},
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

	//储存到本地缓存,不对key做处理

	function set(key, value, ttl) { // 储存到localStorage,ttl:unit is second
		try {
			ttl = ttl || 60 * 60; //默认1小时
			var item = {
				data: value,
				ttl: ttlTime(ttl)
			};
			local[key] = JSON.stringify(item);
		} catch (e) {
			console.log(e);
		}
	}
	//从localstorage取数据,不对key做处理

	function get(key) {
		var oldKey = (key || "").replace(prefixCache, "");
		try {
			var value = local[key];
			if (value) {
				var item = JSON.parse(value);
				if (item && !Q.isNull(item.data) && item.ttl) {
					if (item.ttl >= 0 && item.ttl <= new Date().getTime()) {
						Store.remove(oldKey);
						return null
					}
					return item.data
				}
			}
		} catch (e) {
			Store.remove(oldKey);
			console.log("get store data error:", e);
		}
		return null
	}
	$.Store = Store;
	Q.define("lib/qmik/Store", function(require, exports, module) {
		module.exports = Store;
	});

	Q.execCatch(function() {
		//储存的个数超过10000条,清空储存
		if (local.length >= maxStoreSize) {
			console.log("localStorage length is large,,,,clear store");
			Store.clear();
		}
	});
	//清除缓存,每天清理一次,
	Q.delay(function() {
		var clearKey = "___qmik/store/clear/frequency___";
		if (get(clearKey) != true) {
			set(clearKey, true, 24 * 60 * 60); //保存时间 24小时
			try {
				for (var key in local) {
					if (new RegExp("^" + prefix1).test(key)) {
						try {
							get(key);
						} catch (e) {}
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
	}, 4000);
})(Qmik);