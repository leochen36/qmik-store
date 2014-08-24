数据存储组件, 利用html5技术来做数据储存,,对于本地储存,提供了存储时间功能

set(key, value[, ttl]); 储存到本地缓存, ttl:存储时间,选填,默认60分钟
get(key); 从本地缓存取数据
remove(key); 删除本地缓存的key
clear(); 清空本地缓存

setSession(key, value); 存储到会话缓存
getSession(key); 从会话缓存取数据
removeSession(key); 删除会话缓存的key
clearSession();  清空缓存缓存