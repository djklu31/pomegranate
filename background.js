console.log("background running");
let addresses = [];
let timer;
let currentTime;

window.onload = function() {
  chrome.storage.sync.get(["addresses"], function(result) {
    console.log(result);
    addresses = JSON.parse(result.addresses);
  });
};

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
  } else if (request.action === "startTimer") {
    chrome.storage.sync.get(["timerStarted"], function(result) {
      if (!result.timerStarted) {
        startTimer(1000, request.msg, sendResponse);
      } else {
        stopTimer();
      }
    });
  } else if (request.action === "getTimeLeft") {
    sendResponse({ msg: currentTime });
  }
  return true;
});

function startTimer(speed, length, sendResponse) {
  timer = setInterval(function() {
    currentTime = length;
    length = length - 1;
    if (length === 0) {
      clearInterval(timer);
      alert("DONE");
      chrome.storage.sync.set({ timerStarted: false }, function() {
        sendResponse({ msg: "timerExpired" });
      });
    }
  }, speed);
}

function stopTimer() {
  clearInterval(timer);
}

// function setStorage(sendResponse, action) {
//   try {
//     chrome.storage.sync.set(
//       { addresses: JSON.stringify(addresses) },
//       function() {
//         sendResponse({ msg: `success ${action} url` });
//         return true;
//       }
//     );
//   } catch (error) {
//     sendResponse({ msg: `error ${action} url` });
//     return true;
//   }
// }
