console.log("background running");
let addresses = [];
let timer;
let currentTime;
let devMode = true;

// window.onload = function() {
chrome.storage.sync.get(["addresses"], function(result) {
  console.log(result);
  addresses = JSON.parse(result.addresses);
});
// };

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "getTimeLeft") {
    sendResponse({ timeLeft: currentTime });
  }
  return true;
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "addURL") {
    // chrome.storage.sync.get(["addresses"], function(result) {
    //   let addresses = [];
    //   addresses = JSON.parse(result.addresses);
    addresses.push(request.msg);
    // setStorage(sendResponse, "adding");
    try {
      chrome.storage.sync.set(
        { addresses: JSON.stringify(addresses) },
        function() {
          sendResponse({ msg: `success adding url` });
        }
      );
    } catch (error) {
      sendResponse({ msg: `error adding url` });
    }
    // });
  } else if (request.action === "deleteURL") {
    let index = addresses.indexOf(request.msg);
    addresses.splice(index, 1);

    try {
      chrome.storage.sync.set(
        { addresses: JSON.stringify(addresses) },
        function() {
          sendResponse({ msg: `success deleting url` });
        }
      );
    } catch (error) {
      sendResponse({ msg: `error deleting url` });
    }
  } else if (request.action === "getAddressesForContent") {
    sendResponse({ msg: JSON.stringify(addresses) });
  } else if (request.action === "toggleTimer") {
    chrome.storage.sync.get(["timerStarted"], function(result) {
      if (!result.timerStarted) {
        if (devMode) {
          startTimer(1000, parseInt(request.msg), sendResponse);
        } else {
          startTimer(1000, parseInt(request.msg) * 60, sendResponse);
        }
        sendResponse({ msg: "timerStarted" });
      } else {
        stopTimer();
        sendResponse({ msg: "timerStopped" });
      }
    });
  }
  return true;
});

function timerEnded() {
  let notifOptions = {
    type: "progress",
    iconUrl: "https://image.flaticon.com/icons/png/512/605/605255.png",
    title: "Timer Ended",
    message: "Time for a break?",
    buttons: [{ title: "Start Break" }, { title: "Cancel" }]
  };
  chrome.notifications.create(notifOptions, function(id) {
    chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
      if (notifId === id) {
        if (btnIdx === 0) {
          startBreak();
        }
      }
    });
  });
  window.open("/html/breakNotifPage.html");
}

function startTimer(speed, length, sendResponse) {
  chrome.storage.sync.set({ timerStarted: true });
  timer = setInterval(function() {
    length = length - 1;
    currentTime = length;
    if (length === 0) {
      stopTimer();
      timerEnded();
    }
  }, speed);
}

function startBreak() {
  chrome.storage.sync.get(["breakLength"], function(result) {
    console.log(result.breakLength);
    if (devMode) {
      startTimer(1000, parseInt(result.breakLength), sendResponse);
    } else {
      startTimer(1000, parseInt(result.breakLength) * 60, sendResponse);
    }
  });
}

function stopTimer() {
  chrome.storage.sync.set({ timerStarted: false });
  clearInterval(timer);
}
