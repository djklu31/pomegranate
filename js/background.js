console.log("background running");
let addresses = [];
let timer;
let currentTime = 0;
let devMode = false;

// window.onload = function() {
chrome.storage.sync.get(["addresses"], function (result) {
  console.log(result);
  addresses = JSON.parse(result.addresses);
});
// };

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getTimeLeft") {
    sendResponse({ timeLeft: currentTime });
  }
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "addURL") {
    // chrome.storage.sync.get(["addresses"], function(result) {
    //   let addresses = [];
    //   addresses = JSON.parse(result.addresses);
    addresses.push(request.msg);
    // setStorage(sendResponse, "adding");
    try {
      chrome.storage.sync.set(
        { addresses: JSON.stringify(addresses) },
        function () {
          sendResponse({ msg: `success adding url` });
        }
      );
    } catch (error) {
      sendResponse({ msg: `error adding url` });
    }
    // });
  } else if (request.action === "deleteURL") {
    //remove the ending "hyphen"
    let index = addresses.indexOf(
      request.msg.substring(0, request.msg.length - 2)
    );
    addresses.splice(index, 1);

    try {
      chrome.storage.sync.set(
        { addresses: JSON.stringify(addresses) },
        function () {
          sendResponse({ msg: `success deleting url` });
        }
      );
    } catch (error) {
      sendResponse({ msg: `error deleting url` });
    }
  } else if (request.action === "getAddressesForContent") {
    sendResponse({ msg: JSON.stringify(addresses) });
  } else if (request.action === "toggleTimer") {
    chrome.storage.sync.get(["timerStarted"], function (result) {
      if (!result.timerStarted || request.isResume) {
        if (devMode || request.isResume) {
          startTimer(1000, parseInt(request.msg), sendResponse);
        } else {
          startTimer(1000, parseInt(request.msg) * 60, sendResponse);
        }
        sendResponse({ msg: "timerStarted" });
      } else {
        stopTimer(timer);
        chrome.storage.sync.set({ pausedTime: null });
        sendResponse({ msg: "timerStopped" });
      }
    });
  } else if (request.action === "togglePause") {
    if (request.msg === "pause") {
      pauseTimer();
    } else {
      resumeTimer();
    }
  }
  return true;
});

function timerEnded() {
  let notifOptions = {
    type: "progress",
    iconUrl: "https://image.flaticon.com/icons/png/512/605/605255.png",
    title: "Timer Ended",
    message: "Time for a break?",
    buttons: [{ title: "Start Break" }, { title: "Cancel" }],
  };
  chrome.notifications.create(notifOptions, function (id) {
    chrome.notifications.onButtonClicked.addListener(function (
      notifId,
      btnIdx
    ) {
      if (notifId === id) {
        if (btnIdx === 0) {
          startBreak();
        }
      }
    });
  });
  window.open("/html/breakNotifPage.html");
}

function startTimer(speed, length) {
  chrome.storage.sync.set({ timerStarted: true });
  stopTimer(timer, true);
  timer = setInterval(function () {
    //stop all previous timers if a new one is started
    length = length - 1;
    currentTime = length;
    if (length <= 0) {
      chrome.storage.sync.set({ pausedTime: null });
      stopTimer(timer);
      timerEnded();
    }
  }, speed);
}

function pauseTimer() {
  chrome.storage.sync.set({ pausedTime: currentTime });
  console.log("paused: " + currentTime);
  stopTimer(timer, true);
}

function resumeTimer() {
  chrome.storage.sync.get(["pausedTime"], function (result) {
    // stopTimer();
    if (devMode) {
      startTimer(1000, parseInt(result.pausedTime) * 60);
    } else {
      startTimer(1000, parseInt(result.pausedTime));
    }

    chrome.storage.sync.set({ pausedTime: "resumed" });
  });
}

function startBreak() {
  chrome.storage.sync.get(["breakLength"], function (result) {
    console.log(result.breakLength);
    if (devMode) {
      startTimer(1000, parseInt(result.breakLength));
    } else {
      startTimer(1000, parseInt(result.breakLength) * 60);
    }
  });
}

function stopTimer(timerId, dontReflect) {
  currentTime = 0;

  if (!dontReflect) {
    chrome.storage.sync.set({ timerStarted: false });
  }

  for (let i = timerId; i >= 0; i--) {
    clearInterval(i);
  }
}
