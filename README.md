数据存储组件, 利用html5技术来做数据储存,,对于本地储存,提供了存储时间功能

set(key, value[, ttl]); 储存到本地缓存, ttl:存储时间,选填,默认60分钟
get(key); 从本地缓存取数据
remove(key); 删除本地缓存的key
clear(); 清空本地缓存

setSession(key, value); 存储到会话缓存
getSession(key); 从会话缓存取数据
removeSession(key); 删除会话缓存的key
clearSession();  清空缓存缓存



````
qmik框架推荐模块化开发(不污染qmik框架),因此提供的组件,全部会是模块导出的形式
使用:
$.sun.config({
	alias:{
		"lib/qmik/Store":"http://xxx.com/store.js" //定义别名,定义store.js的文件路径,别名最好定义成跟store模块导出的名称一样
	}
});

使用方式1:
$.use("lib/qmik/Store",function(Store){
	Store.get("key");	
});
使用方式2:在定义模块中使用

$.define("demo/useStore", function(require, exports, module){
	var Store = require("lib/qmik/Store");

	Store.get("key");

});


````