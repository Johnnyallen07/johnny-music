
const CACHE_NAME = 'audio-cache-v1';

// 当Service Worker被安装时，这个事件会被触发
self.addEventListener('install', (event) => {
  // event.waitUntil会确保Service Worker在install事件中的代码全部执行成功之前不会被安装
  // 我们在这里可以预缓存一些核心资源，但对于音频文件，我们选择在首次请求时动态缓存
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Cache opened');
      return cache.addAll([]); // 初始缓存为空，因为音频是动态添加的
    })
  );
});

// 当Service Worker被激活时，这个事件会被触发
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // 删除旧版本的缓存
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 立即控制页面
  return self.clients.claim();
});

// 当浏览器发起网络请求时，这个事件会被触发
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 我们只对音频文件进行缓存处理
  // 你可以根据你的URL结构调整这个判断逻辑
  if (request.url.includes('/audio/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // 1. 如果在缓存中找到了匹配的响应，直接返回缓存的响应
          if (cachedResponse) {
            console.log('Service Worker: serving from cache', request.url);
            return cachedResponse;
          }

          // 2. 如果缓存中没有，则从网络获取
          console.log('Service Worker: fetching from network', request.url);
          return fetch(request).then((networkResponse) => {
            // 3. 获取成功后，将响应的克隆版本存入缓存
            // 我们需要克隆响应，因为响应体只能被读取一次
            cache.put(request, networkResponse.clone());

            // 4. 返回原始的网络响应给浏览器
            return networkResponse;
          });
        });
      })
    );
  }
  // 对于非音频文件，我们让浏览器正常处理
});
