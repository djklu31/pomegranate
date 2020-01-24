console.log("background running");

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  chrome.storage.sync.get(["addresses"], function(result) {
    let addresses = [];
    addresses = JSON.parse(result.addresses);
    addresses.push(request.msg);
    try {
      chrome.storage.sync.set(
        { addresses: JSON.stringify(addresses) },
        function() {
          sendResponse({ msg: "success adding url" });
        }
      );
    } catch (error) {
      sendResponse({ msg: "error adding url" });
    }
  });
  return true;
});
