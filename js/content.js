// Overlay-based blocking: background decides when to block, we render a full-screen overlay.
console.log("Pomegranate content script loaded");

let pomegranateOverlayActive = false;
let pomegranateStateCheckInterval = null;

function createOverlay() {
  if (pomegranateOverlayActive) return;
  pomegranateOverlayActive = true;

  const style = document.createElement("style");
  style.id = "pomegranate-overlay-style";
  style.textContent = `
    #pomegranate-overlay-root { position: fixed; inset: 0; z-index: 2147483647; }
    #pomegranate-overlay-root iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  `;
  document.documentElement.appendChild(style);

  const root = document.createElement("div");
  root.id = "pomegranate-overlay-root";
  root.setAttribute("role", "dialog");
  const iframe = document.createElement("iframe");
  try {
    iframe.src = chrome.runtime.getURL("/html/pageBlocked.html");
  } catch (e) {
    iframe.src = "about:blank";
  }
  iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  root.appendChild(iframe);

  // Prevent interaction with the underlying page
  const stop = function (e) { e.stopPropagation(); e.preventDefault(); };
  root.addEventListener("click", stop, true);
  root.addEventListener("mousedown", stop, true);
  root.addEventListener("keydown", stop, true);

  document.documentElement.appendChild(root);

  // Periodically check timer state; remove overlay when not focusing
  if (pomegranateStateCheckInterval) clearInterval(pomegranateStateCheckInterval);
  pomegranateStateCheckInterval = setInterval(function () {
    try {
      chrome.runtime.sendMessage({ action: "getTimerState" }, function (resp) {
        if (!resp) return;
        const isFocus = (resp.isRunning && !resp.onBreak) || !!resp.exclusiveMode;
        if (!isFocus) {
          removeOverlay();
        }
      });
    } catch (e) {
      // ignore
    }
  }, 1000);
}

function removeOverlay() {
  const root = document.getElementById("pomegranate-overlay-root");
  const style = document.getElementById("pomegranate-overlay-style");
  if (root && root.parentNode) root.parentNode.removeChild(root);
  if (style && style.parentNode) style.parentNode.removeChild(style);
  pomegranateOverlayActive = false;
  if (pomegranateStateCheckInterval) {
    clearInterval(pomegranateStateCheckInterval);
    pomegranateStateCheckInterval = null;
  }
}

// Listen for background command to show overlay
try {
  chrome.runtime.onMessage.addListener(function (request) {
    if (request && request.action === "pomegranate_showOverlay") {
      createOverlay();
    } else if (request && request.action === "pomegranate_hideOverlay") {
      removeOverlay();
    }
  });
} catch (e) {}
