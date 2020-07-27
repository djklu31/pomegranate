chrome.storage.sync.get(["addresses", "onBreak", "exclusiveMode"], function (
  response
) {
  if (!response.onBreak || response.exclusiveMode) {
    chrome.storage.sync.get(["timerStarted"], function (result) {
      if (result.timerStarted !== undefined || response.exclusiveMode) {
        if (result.timerStarted || response.exclusiveMode) {
          let addresses = JSON.parse(response.addresses);
          console.log(location.href);
          for (address of addresses) {
            if (location.href.indexOf(address) !== -1) {
              window.location = chrome.runtime.getURL("/html/pageBlocked.html");
            }
          }
        }
      } else {
        chrome.storage.sync.set({ timerStarted: false });
      }
    });
  }
});
