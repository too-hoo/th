// sw.js - 本地资源管理器 (v4 更新版)
const CACHE_NAME = 'feynman-island-cache-v4';

// 监听 fetch 请求，拦截 OSS 资源
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // 拦截名单：音频、图片、PDF、Word文档、文本文件
    if (
        url.includes('.mp3') || 
        url.includes('.pdf') || 
        url.includes('.docx') || 
        url.includes('.txt') || 
        url.includes('.png') || 
        url.includes('.jpg')
    ) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // 1. 如果本地缓存有，直接返回，实现 0 流量秒开
                if (response) {
                    return response;
                }

                // 2. 如果本地没有，从网络抓取并存入缓存库
                return fetch(event.request).then((networkResponse) => {
                    // 只有请求成功 (status 200) 才存入缓存
                    if (networkResponse.status === 200) {
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                });
            }).catch(() => {
                // 网络连接失败且无缓存时的兜底处理
                return new Response("资源暂不可用，请检查网络连接。");
            })
        );
    }
});

// 监听激活事件：自动清理旧版本缓存
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});