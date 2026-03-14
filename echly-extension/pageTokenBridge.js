/**
 * Page-context token bridge for Echly extension.
 * Injected only on dashboard origins. Listens for secure handshake then token requests.
 * - Handshake: ECHLY_BRIDGE_HANDSHAKE with proposedChannel → reply ECHLY_BRIDGE_READY.
 * - Token: ECHLY_REQUEST_TOKEN (channel, nonce, source) → ECHLY_TOKEN_RESPONSE to event.origin only.
 * Never uses "*" as target origin. Validates source, channel, type, nonce, and dashboard origin.
 */
(function () {
  var ECHLY_HANDSHAKE_CHANNEL = "ECHLY_BRIDGE_HANDSHAKE_CHANNEL";
  var ECHLY_BRIDGE_HANDSHAKE_TYPE = "ECHLY_BRIDGE_HANDSHAKE";
  var ECHLY_BRIDGE_READY_TYPE = "ECHLY_BRIDGE_READY";
  var ECHLY_REQUEST_TOKEN_TYPE = "ECHLY_REQUEST_TOKEN";
  var ECHLY_TOKEN_RESPONSE_TYPE = "ECHLY_TOKEN_RESPONSE";
  var ECHLY_EXTENSION_SOURCE = "ECHLY_EXTENSION";

  var ALLOWED_ORIGINS = ["https://echly-web.vercel.app", "http://localhost:3000"];
  var negotiatedChannel = null;

  function isAllowedOrigin(origin) {
    return typeof origin === "string" && ALLOWED_ORIGINS.indexOf(origin) !== -1;
  }

  window.addEventListener("message", async function (event) {
    var data = event.data;
    var origin = event.origin;

    if (!data || typeof data !== "object") return;
    /* Strict origin check first — do not process messages from other origins. */
    if (!isAllowedOrigin(origin)) return;

    /* Handshake: establish channel. */
    if (data.channel === ECHLY_HANDSHAKE_CHANNEL && data.type === ECHLY_BRIDGE_HANDSHAKE_TYPE) {
      if (data.source !== ECHLY_EXTENSION_SOURCE) return;
      var proposed = data.proposedChannel;
      if (typeof proposed !== "string" || proposed.indexOf("ECHLY_SECURE_CHANNEL_") !== 0) return;
      negotiatedChannel = proposed;
      window.postMessage(
        { channel: proposed, type: ECHLY_BRIDGE_READY_TYPE },
        origin
      );
      return;
    }

    /* Token request: must match negotiated channel, type, source, nonce. */
    if (!negotiatedChannel || data.channel !== negotiatedChannel) return;
    if (data.type !== ECHLY_REQUEST_TOKEN_TYPE) return;
    if (data.source !== ECHLY_EXTENSION_SOURCE) return;
    if (data.nonce == null) return;

    /* Response shape: only channel, type, nonce, token (no user, email, uid, metadata, expiration). */
    function sendTokenResponse(token) {
      window.postMessage(
        { channel: negotiatedChannel, type: ECHLY_TOKEN_RESPONSE_TYPE, nonce: data.nonce, token: token },
        origin
      );
    }

    var AUTH_WAIT_MS = 5000;

    function getAuthInstance() {
      return window.firebase && window.firebase.auth && typeof window.firebase.auth === "function"
        ? window.firebase.auth()
        : null;
    }

    function waitForAuthInstance() {
      return new Promise(function (resolve) {
        var authInstance = getAuthInstance();
        if (authInstance) {
          resolve(authInstance);
          return;
        }
        var deadline = Date.now() + AUTH_WAIT_MS;
        var interval = setInterval(function () {
          if (Date.now() >= deadline) {
            clearInterval(interval);
            resolve(null);
            return;
          }
          authInstance = getAuthInstance();
          if (authInstance) {
            clearInterval(interval);
            resolve(authInstance);
          }
        }, 100);
      });
    }

    function getTokenFromAuth(authInstance) {
      return new Promise(function (resolve) {
        var user = authInstance.currentUser;
        if (user) {
          user.getIdToken().then(resolve).catch(function () {
            resolve(null);
          });
          return;
        }
        var timeout = setTimeout(function () {
          unsubscribe();
          resolve(null);
        }, AUTH_WAIT_MS);
        var unsubscribe = authInstance.onAuthStateChanged(function (u) {
          if (u) {
            clearTimeout(timeout);
            unsubscribe();
            u.getIdToken().then(resolve).catch(function () {
              resolve(null);
            });
          }
        });
      });
    }

    (async function () {
      try {
        var authInstance = await waitForAuthInstance();
        if (!authInstance) {
          sendTokenResponse(null);
          return;
        }
        var token = await getTokenFromAuth(authInstance);
        sendTokenResponse(token);
      } catch (err) {
        sendTokenResponse(null);
      }
    })();
  });
})();
