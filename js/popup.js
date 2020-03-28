let addURLBtn = document.getElementById("add-url-btn");
let parentList = document.getElementById("addresses-list");
let blockSitesBtn = document.getElementById("block-sites-btn");
// let saveSettingsBtn = document.getElementById("save-settings-btn");
let settingsBtn = document.getElementById("settings-btn");
let timer;
let devMode = false;
// addressBox.addEventListener("keyup", function(e) {
// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { greeting: addressBox.value });
// });
// });
// window.onload = function() {
chrome.storage.sync.get(["addresses"], function(result) {
  let addresses = JSON.parse(result.addresses);
  for (address of addresses) {
    addToList(address);
  }
});

chrome.storage.sync.get(["timerStarted"], function(result) {
  if (result.timerStarted) {
    //get from background script
    chrome.runtime.sendMessage({ action: "getTimeLeft" }, function(response) {
      console.log(response);
      let currentTimeLeft = parseInt(response.timeLeft);
      console.log(response.timeLeft);

      convertToMinutes(currentTimeLeft);
    });

    document.getElementById("block-sites-btn").innerText = "Stop Timer";
  } else {
    document.getElementById("block-sites-btn").innerText = "Start Timer";
  }
});

// chrome.runtime.sendMessage({ action: "getTimeLeft" }, function(response) {
//   if (response.msg === "success deleting url") {
//     var list = document.getElementsByTagName("li");
//     for (item of list) {
//       if (item.innerText === event.target.parentNode.innerText) {
//         item.parentNode.removeChild(item);
//       }
//     }
//   } else if (response.msg === "error deleting url") {
//
// });
// };
// getStorageBtn.addEventListener("click", function() {
//   chrome.storage.sync.get(["addresses"], function(result) {
//     console.log(`Got addresses from storage: ${result.addresses}`);
//   });
// });
//Event Listeners
parentList.addEventListener("click", function(event) {
  console.log(event);
  if (event.target.tagName === "BUTTON") {
    chrome.runtime.sendMessage(
      { msg: event.target.parentNode.innerText.trim(), action: "deleteURL" },
      function(response) {
        if (response.msg === "success deleting url") {
          var list = document.getElementsByTagName("li");
          for (item of list) {
            if (item.innerText === event.target.parentNode.innerText) {
              item.parentNode.removeChild(item);
            }
          }
        } else if (response.msg === "error deleting url") {
          console.log("ERROR deleting URL (handle somehow)");
        }
      }
    );
  }
});

// saveSettingsBtn.addEventListener("click", function() {
//   let breakLength = document.getElementById("break-length").value;
//   chrome.storage.sync.set({ breakLength: breakLength });
// });

addURLBtn.addEventListener("click", function() {
  let addressBox = document.getElementById("address-box");

  chrome.runtime.sendMessage(
    {
      msg: addressBox.value,
      action: "addURL"
    },
    function(response) {
      if (response.msg === "success adding url") {
        let addressBox = document.getElementById("address-box");
        addToList(addressBox.value);
        addressBox.value = "";
      } else if (response.msg === "error adding url") {
        console.log("ERROR adding URL (handle somehow)");
      }
    }
  );

  // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" });
  // });
});

blockSitesBtn.addEventListener("click", function() {
  chrome.storage.sync.get(["timerStarted"], function(result) {
    if (result.timerStarted !== undefined) {
      if (!result.timerStarted) {
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
        // getTimeLeft();
      } else {
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        // stopTimer();
      }
    } else {
      chrome.storage.sync.set({ timerStarted: false });
    }
  });

  chrome.storage.sync.get(["timerLength"], function(result) {
    if (result.timerLength !== undefined) {
      triggerTimer(result.timerLength);
    } else {
      triggerTimer(20);
    }
  });
});

settingsBtn.addEventListener("click", function() {
  window.open("/html/settings.html");
});

function triggerTimer(length) {
  chrome.runtime.sendMessage({ action: "toggleTimer", msg: length }, function(
    response
  ) {
    console.log(response);
    if (response.msg === "timerStarted") {
      if (devMode) {
        convertToMinutes(parseInt(length));
      } else {
        convertToMinutes(parseInt(length) * 60);
      }
      document.getElementById("block-sites-btn").innerText = "Stop Timer";
    } else if (response.msg === "timerStopped") {
      stopTimer();
      document.getElementById("block-sites-btn").innerText = "Start Timer";
    }
  });
}

function startBreak() {
  let breakLength = document.getElementById("break-length");
  alert("break starting");
  convertToMinutes(breakLength * 60);
}

function addToList(addresses) {
  let li = document.createElement("li");
  let ul = document.getElementById("addresses-list");
  li.innerHTML = `${addresses} <button class="button">-</button>`;
  ul.appendChild(li);
}

function convertToMinutes(currentTimeLeft) {
  let minutes = Math.floor(currentTimeLeft / 60);
  let seconds = currentTimeLeft % 60;
  let paddedSeconds;
  let paddedMinutes;
  let timerStopped = false;

  if (seconds < 10) {
    paddedSeconds = "0" + seconds;
  } else {
    paddedSeconds = seconds;
  }

  if (minutes < 10) {
    paddedMinutes = "0" + minutes;
  } else {
    paddedMinutes = minutes;
  }

  document.getElementById(
    "timerDisplay"
  ).innerText = `${paddedMinutes}:${paddedSeconds}`;

  timer = setInterval(function() {
    seconds -= 1;

    if (seconds < 0) {
      minutes = minutes - 1;
      seconds = 59;

      if (minutes < 0) {
        console.log("timeout");
        clearInterval(timer);
        document.getElementById("timerDisplay").innerHTML = "";
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        timerStopped = true;
      }
    }
    if (seconds < 10) {
      paddedSeconds = "0" + seconds;
    } else {
      paddedSeconds = seconds;
    }

    if (minutes < 10) {
      paddedMinutes = "0" + minutes;
    } else {
      paddedMinutes = minutes;
    }

    if (!timerStopped) {
      document.getElementById(
        "timerDisplay"
      ).innerText = `${paddedMinutes}:${paddedSeconds}`;
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  document.getElementById("timerDisplay").innerHTML = "";
}
