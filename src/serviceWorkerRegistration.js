// Service Worker Registration Helper for PWA
// This file handles the registration and lifecycle of Service Workers
// Reference: https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

/**
 * Register Service Worker
 * @param {Object} config - Configuration object
 * @param {Function} config.onSuccess - Callback when SW registered successfully
 * @param {Function} config.onUpdate - Callback when new SW version available
 */
export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://cra.link/PWA"
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                "New content is available and will be used when all " +
                  "tabs for this page are closed. See https://cra.link/PWA."
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log("Content is cached for offline use.");

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

/**
 * Unregister Service Worker
 * Call this if you want to disable PWA functionality
 */
export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

/**
 * Request Notification Permission
 * Call this to ask user for notification permission
 * @returns {Promise<string>} - Permission status: 'granted', 'denied', or 'default'
 */
export async function requestNotificationPermission() {
  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("[PWA] Notifications are not supported in this browser");
    return "unsupported";
  }

  // Check current permission status
  if (Notification.permission === "granted") {
    console.log("[PWA] Notification permission already granted");
    return "granted";
  }

  if (Notification.permission === "denied") {
    console.warn(
      "[PWA] Notification permission was denied. User needs to enable it in browser settings."
    );
    return "denied";
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    console.log("[PWA] Notification permission:", permission);

    if (permission === "granted") {
      // Show a test notification to confirm it works
      showTestNotification();
    }

    return permission;
  } catch (error) {
    console.error("[PWA] Error requesting notification permission:", error);
    return "error";
  }
}

/**
 * Show a test notification to verify notifications are working
 */
function showTestNotification() {
  if (Notification.permission === "granted") {
    const notification = new Notification("🏥 Thông báo đã được bật!", {
      body: "Bạn sẽ nhận được thông báo từ hệ thống BC Bệnh viện",
      icon: "/logoBVTPT.png",
      badge: "/logo64.png",
      tag: "test-notification",
      requireInteraction: false,
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
}

/**
 * Check if notifications are enabled
 * @returns {boolean}
 */
export function isNotificationEnabled() {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Get current notification permission status
 * @returns {string} - 'granted', 'denied', 'default', or 'unsupported'
 */
export function getNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}
