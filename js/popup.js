let addURLBtn = document.getElementById("add-url-btn");
let parentList = document.getElementById("addresses-list");
let blockSitesBtn = document.getElementById("block-sites-btn");
// let saveSettingsBtn = document.getElementById("save-settings-btn");
let settingsBtn = document.getElementById("settings-btn");
let pauseResumeBtn = document.getElementById("pause-resume-btn");
let resetTimerBtn = document.getElementById("reset-timer-btn");
let timer;
let devMode = false;
let globalTimer;
// addressBox.addEventListener("keyup", function(e) {
// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { greeting: addressBox.value });
// });
// });
// window.onload = function() {
checkDefaultSettings();
zeroOutDisplay();

chrome.storage.sync.get(["addresses"], function (result) {
  if (result.addresses !== undefined) {
    let addresses = JSON.parse(result.addresses);
    for (address of addresses) {
      addToList(address);
    }
  }
});

chrome.storage.sync.get(["timerStarted", "onBreak"], function (result) {
  if (result.timerStarted) {
    //get from background script
    chrome.runtime.sendMessage({ action: "getTimeLeft" }, function (response) {
      console.log(response);
      let currentTimeLeft = parseInt(response.timeLeft);
      console.log(response.timeLeft);

      chrome.storage.sync.get(["pausedTime"], function (result) {
        if (
          result.pausedTime === "resumed" ||
          result.pausedTime === undefined ||
          result.pausedTime === null
        ) {
          convertToMinutes(currentTimeLeft);
        }
      });
    });

    document.getElementById("block-sites-btn").innerText = "Stop Timer";
    document.getElementById("pause-resume-btn").disabled = false;
  } else {
    if (result.onBreak) {
      document.getElementById("block-sites-btn").innerText = "Start Break";
      document.getElementById("pause-resume-btn").disabled = true;
    } else {
      document.getElementById("block-sites-btn").innerText = "Start Timer";
      document.getElementById("pause-resume-btn").disabled = true;
    }
  }
});

chrome.storage.sync.get(["completedPomodoros"], function (result) {
  if (result.completedPomodoros === undefined) {
    chrome.storage.sync.set({ completedPomodoros: 0 });
    document.getElementById("completed-pomodoros-display").innerText = 0;
  } else {
    document.getElementById("completed-pomodoros-display").innerText =
      result.completedPomodoros;
  }
});

chrome.storage.sync.get(["pausedTime"], function (result) {
  if (
    result.pausedTime !== "resumed" &&
    result.pausedTime !== undefined &&
    result.pausedTime !== null
  ) {
    //get from background script
    displayPausedTime(result.pausedTime);
    document.getElementById("pause-resume-btn").innerText = "Resume Timer";
  } else {
    document.getElementById("pause-resume-btn").innerText = "Pause Timer";
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
parentList.addEventListener("click", function (event) {
  console.log(event);
  if (event.target.tagName === "BUTTON") {
    chrome.runtime.sendMessage(
      { msg: event.target.parentNode.innerText.trim(), action: "deleteURL" },
      function (response) {
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

pauseResumeBtn.addEventListener("click", function (event) {
  if (event.target.innerText === "Resume Timer") {
    document.getElementById("pause-resume-btn").innerText = "Pause Timer";
    chrome.storage.sync.get(["pausedTime"], function (result) {
      triggerTimer(globalTimer, true);
    });
    chrome.runtime.sendMessage({
      msg: "resume",
      action: "togglePause",
    });
  } else {
    document.getElementById("pause-resume-btn").innerText = "Resume Timer";
    displayPausedTime(globalTimer);
    chrome.runtime.sendMessage({
      msg: "pause",
      action: "togglePause",
    });
  }
});

addURLBtn.addEventListener("click", function () {
  let addressBox = document.getElementById("address-box");

  chrome.runtime.sendMessage(
    {
      msg: addressBox.value,
      action: "addURL",
    },
    function (response) {
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

blockSitesBtn.addEventListener("click", function () {
  chrome.storage.sync.get(["timerStarted", "onBreak"], function (result) {
    if (result.timerStarted !== undefined) {
      if (!result.timerStarted) {
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
        document.getElementById("pause-resume-btn").disabled = false;
        // getTimeLeft();
      } else {
        if (result.onBreak) {
          document.getElementById("block-sites-btn").innerText = "Start Break";
          document.getElementById("pause-resume-btn").disabled = true;
        } else {
          document.getElementById("block-sites-btn").innerText = "Start Timer";
          document.getElementById("pause-resume-btn").disabled = true;
        }

        // stopTimer();
      }
    } else {
      chrome.storage.sync.set({ timerStarted: false });
    }
  });

  chrome.storage.sync.get(["timerLength"], function (result) {
    if (result.timerLength !== undefined) {
      if (result.onBreak) {
        triggerTimer(result.timerLength, false, false, startBreak);
      } else {
        triggerTimer(result.timerLength);
      }
    } else {
      if (result.onBreak) {
        triggerTimer(20, false, true);
      } else {
        triggerTimer(20);
      }
    }
  });
});

resetTimerBtn.addEventListener("click", function () {
  triggerTimer(null, false, true);
});

settingsBtn.addEventListener("click", function () {
  window.open("/html/settings.html");
});

function triggerTimer(length, isResume, isReset, startBreak) {
  chrome.runtime.sendMessage(
    {
      action: "toggleTimer",
      msg: length,
      isResume: isResume,
      isReset: isReset,
      startBreak: startBreak,
    },
    function (response) {
      console.log(response);
      if (response.msg === "timerStarted") {
        if (devMode || isResume) {
          convertToMinutes(parseInt(length));
        } else {
          convertToMinutes(parseInt(length) * 60);
        }
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
        document.getElementById("pause-resume-btn").disabled = false;
      } else if (response.msg === "timerReset") {
        stopTimer();
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        document.getElementById("pause-resume-btn").innerText = "Pause Timer";
        document.getElementById("pause-resume-btn").disabled = true;
        document.getElementById("completed-pomodoros-display").innerText = 0;
      } else if (response.msg === "timerStopped") {
        stopTimer();
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        document.getElementById("pause-resume-btn").innerText = "Pause Timer";
        document.getElementById("pause-resume-btn").disabled = true;
      }
    }
  );
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

  globalTimer = currentTimeLeft;

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
    "timer-display"
  ).innerText = `${paddedMinutes}:${paddedSeconds}`;

  timer = setInterval(function () {
    globalTimer -= 1;
    seconds -= 1;

    if (seconds < 0) {
      minutes = minutes - 1;
      seconds = 59;

      if (minutes < 0) {
        stopTimer();
        chrome.storage.sync.get(["isBreak", "completedPomodoros"], function (
          result
        ) {
          if (!result.isBreak) {
            document.getElementById("completed-pomodoros-display").innerText =
              result.completedPomodoros + 1;
          }
        });
        document.getElementById("timer-display").innerHTML = "";
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
        "timer-display"
      ).innerText = `${paddedMinutes}:${paddedSeconds}`;
    }
  }, 1000);
}

function displayPausedTime(currentTimeLeft) {
  stopTimer();

  globalTimer = currentTimeLeft;

  let minutes = Math.floor(currentTimeLeft / 60);
  let seconds = currentTimeLeft % 60;
  let paddedSeconds;
  let paddedMinutes;

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
    "timer-display"
  ).innerText = `${paddedMinutes}:${paddedSeconds}`;
}

function zeroOutDisplay() {
  document.getElementById("timer-display").innerText = "00:00";
}

function stopTimer() {
  for (i = timer; i >= 0; i--) {
    clearInterval(i);
  }
  zeroOutDisplay();
}

//if settings don't exist, set default values
function checkDefaultSettings() {
  chrome.storage.sync.get(["breakLength"], function (result) {
    if (result.breakLength === undefined) {
      chrome.storage.sync.set({
        breakLength: 5,
      });
    }
  });

  chrome.storage.sync.get(["timerLength"], function (result) {
    if (result.timerLength === undefined) {
      chrome.storage.sync.set({
        timerLength: 10,
      });
    }
  });

  chrome.storage.sync.get(["longBreakFreq"], function (result) {
    if (result.longBreakFreq === undefined) {
      chrome.storage.sync.set({
        longBreakFreq: 10,
      });
    }
  });

  chrome.storage.sync.get(["longBreakLength"], function (result) {
    if (result.longBreakAmt === undefined) {
      chrome.storage.sync.set({
        longBreakLength: 2,
      });
    }
  });

  chrome.storage.sync.get(["totalBreakAmt"], function (result) {
    if (result.totalBreakAmt === undefined) {
      chrome.storage.sync.set({
        totalBreakAmt: 3,
      });
    }
  });
}
