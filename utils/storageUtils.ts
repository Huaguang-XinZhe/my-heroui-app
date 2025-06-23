/**
 * 清除所有 cookies
 */
export function clearAllCookies(): void {
  // 获取当前域名下的所有 cookies
  const cookies = document.cookie.split(";");

  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

    if (name) {
      // 删除当前域名下的 cookie
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
  });
}

/**
 * 清除所有本地存储
 */
export function clearAllStorage(): void {
  try {
    // 清除 localStorage
    localStorage.clear();

    // 清除 sessionStorage
    sessionStorage.clear();

    // 清除 IndexedDB (如果存在)
    if ("indexedDB" in window) {
      // 获取所有数据库名称并删除
      indexedDB
        .databases?.()
        .then((databases) => {
          databases.forEach((db) => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        })
        .catch((error) => {
          console.warn("清除 IndexedDB 失败:", error);
        });
    }
  } catch (error) {
    console.error("清除存储失败:", error);
  }
}

/**
 * 清除所有缓存数据
 */
export function clearAllCache(): void {
  try {
    // 清除 Service Worker 缓存
    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
        })
        .catch((error) => {
          console.warn("清除 Cache API 失败:", error);
        });
    }
  } catch (error) {
    console.error("清除缓存失败:", error);
  }
}

/**
 * 完全清理所有用户数据（退出登录时使用）
 */
export function clearAllUserData(): void {
  clearAllCookies();
  clearAllStorage();
  clearAllCache();
}
