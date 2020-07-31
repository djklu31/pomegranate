chrome.storage.sync.get(["addresses", "onBreak", "exclusiveMode"], function (
  response
) {
  if (!response.onBreak || response.exclusiveMode) {
    chrome.storage.sync.get(
      ["timerStarted", "redirectEnabled", "redirectURL"],
      function (result) {
        if (result.timerStarted !== undefined || response.exclusiveMode) {
          if (result.timerStarted || response.exclusiveMode) {
            let addresses = JSON.parse(response.addresses);
            console.log(location.href);
            for (address of addresses) {
              if (location.href.indexOf(address.toLowerCase()) !== -1) {
                if (result.redirectEnabled) {
                  // let notifOptions = {
                  //   type: "basic",
                  //   iconUrl: "/img/pom-128.png",
                  //   title: "Pomegranate",
                  //   message:
                  //     location.href +
                  //     " was redirected to " +
                  //     result.redirectURL,
                  //   buttons: [{ title: "Close" }],
                  // };

                  // chrome.notifications.create(notifOptions, function (id) {});

                  chrome.runtime.sendMessage(
                    {
                      action: "showRedirectNotif",
                      original: location.href,
                      redirectURL: result.redirectURL,
                    },
                    function (response) {
                      if (response.msg === "notif-success") {
                        if (
                          result.redirectURL.substring(0, 8) === "https://" ||
                          result.redirectURL.substring(0, 7) === "http://"
                        ) {
                          window.location.replace(result.redirectURL);
                        } else {
                          window.location.replace("//" + result.redirectURL);
                        }
                      }
                    }
                  );
                } else {
                  window.location = chrome.runtime.getURL(
                    "/html/pageBlocked.html"
                  );
                }
              }
            }
          }
        } else {
          chrome.storage.sync.set({ timerStarted: false });
        }
      }
    );
  }
});
