// sw.js - 本地资源管理器
const CACHE_NAME = 'feynman-island-cache-v2';

// 监听 fetch 请求，拦截 OSS 资源
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // 只拦截你的 OSS 资源（根据你的域名修改，或者拦截所有 mp3/png 等）
    if (url.includes('.mp3') || url.includes('.png') || url.includes('.jpg')) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // 1. 如果本地缓存有，直接返回，不走网络（不产生流量费）
                if (response) {
                    return response;
                }

                // 2. 如果本地没有，去网络下载并存入缓存
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
        );
    }
});