chrome.runtime.onMessage.addListener(function(
  request,
  sender,
  sendResponse
) {});

// window.onload = function() {
chrome.runtime.sendMessage({ action: "getAddressesForContent" }, function(
  response
) {
  chrome.storage.sync.get(["timerStarted"], function(result) {
    if (result.timerStarted !== undefined) {
      if (result.timerStarted) {
        let addresses = JSON.parse(response.msg);
        console.log(location.href);
        for (address of addresses) {
          if (location.href === address) {
            window.location = chrome.runtime.getURL("/html/pageBlocked.html");
          }
        }
      }
    } else {
      chrome.storage.sync.set({ timerStarted: false });
    }
  });
});
// };
