let addURLBtn = document.getElementById("add-url-btn");
let parentList = document.getElementById("addresses-list");
let blockSitesBtn = document.getElementById("block-sites-btn");
// let saveSettingsBtn = document.getElementById("save-settings-btn");
let settingsBtn = document.getElementById("settings-btn");
let pauseResumeBtn = document.getElementById("pause-resume-btn");
let resetTimerBtn = document.getElementById("reset-timer-btn");
let statsBtn = document.getElementById("stats-btn");
let showAddressListBtn = document.getElementById("toggle-address-list");
let timer;
let devMode = false;
let globalTimer;
let instanceReset = false;

checkDefaultSettings();
onPageLoad();

function displayLoading() {
  document.getElementById("loading-message").style.display = "initial";
  document.getElementById("post-load").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading-message").style.display = "none";
  document.getElementById("post-load").style.display = "initial";
}

function onPageLoad() {
  zeroOutDisplay();
  displayLoading();

  chrome.storage.sync.get(["timerStarted", "onBreak", "pausedTime"], function (
    result
  ) {
    if (result.timerStarted) {
      //get from background script
      chrome.runtime.sendMessage({ action: "getTimeLeft" }, function (
        response
      ) {
        console.log(response);
        if (response.timeLeft === false && !result.pausedTime) {
          document.getElementById("timer-display").innerText = "--:--";

          setTimeout(function () {
            chrome.runtime.sendMessage({ action: "getTimeLeft" }, function (
              response
            ) {
              let currentTimeLeft = parseInt(response.timeLeft);
              // chrome.storage.sync.get(["pausedTime"], function (result) {
              if (
                result.pausedTime === "resumed" ||
                result.pausedTime === undefined ||
                result.pausedTime === null
              ) {
                chrome.storage.sync.get(["showAddressList"], function (result) {
                  if (result.showAddressList) {
                    showURLSection();
                  } else {
                    hideURLSection();
                  }
                });
                convertToMinutes(currentTimeLeft);
              }
              // });
            });
          }, 1000);
        } else {
          let currentTimeLeft = parseInt(response.timeLeft);
          // chrome.storage.sync.get(["pausedTime"], function (result) {
          if (
            result.pausedTime === "resumed" ||
            result.pausedTime === undefined ||
            result.pausedTime === null
          ) {
            chrome.storage.sync.get(["showAddressList"], function (result) {
              if (result.showAddressList) {
                showURLSection();
                document.getElementById("toggle-address-list").style.fill =
                  "#da4567";
              } else {
                hideURLSection();
                document.getElementById("toggle-address-list").style.fill =
                  "initial";
              }
            });
            convertToMinutes(currentTimeLeft);
          }
          // });
        }
      });

      if (result.onBreak) {
        hideLoading();
        document.getElementById("block-sites-btn").innerText = "Stop Break";
      } else {
        hideLoading();
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
      }

      showTimer();
      hideURLSection();
      document.getElementById("pause-resume-btn").disabled = false;
    } else {
      if (result.onBreak) {
        hideLoading();
        document.getElementById("block-sites-btn").innerText = "Start Break";
        hideTimer();
        showURLSection();
        document.getElementById("pause-resume-btn").disabled = true;
      } else {
        hideLoading();
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        hideTimer();
        showURLSection();
        document.getElementById("pause-resume-btn").disabled = true;
      }
    }
  });
}

chrome.storage.sync.get(["addresses"], function (result) {
  if (result.addresses !== undefined) {
    let addresses = JSON.parse(result.addresses);
    for (address of addresses) {
      addToList(address);
    }
  }
});

chrome.storage.sync.get(["completedPomodoros"], function (result) {
  if (result.completedPomodoros === undefined) {
    chrome.storage.sync.set({ completedPomodoros: 0 });
  }
});

chrome.storage.sync.get(["showAddressList"], function (result) {
  if (result.showAddressList === undefined) {
    document.getElementById("toggle-address-list").style.fill = "#da4567";
    chrome.storage.sync.set({ showAddressList: true });
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
    chrome.storage.sync.get(["showAddressList"], function (result) {
      if (result.showAddressList) {
        showURLSection();
        document.getElementById("toggle-address-list").style.fill = "#da4567";
      } else {
        hideURLSection();
        document.getElementById("toggle-address-list").style.fill = "initial";
      }
    });
    document.getElementById("pause-resume-btn").innerText = "Resume Timer";
  } else {
    document.getElementById("pause-resume-btn").innerText = "Pause Timer";
  }
});

//Event Listeners
parentList.addEventListener("click", function (event) {
  console.log(event);
  if (event.target.tagName === "A") {
    chrome.runtime.sendMessage(
      { msg: event.target.parentNode.innerText.trim(), action: "deleteURL" },
      function (response) {
        if (response.msg === "success deleting url") {
          var list = document.getElementsByTagName("li");
          for (item of list) {
            if (item.innerText === event.target.parentNode.innerText) {
              item.parentNode.removeChild(item);
              break;
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
      pauseLength: globalTimer,
    });
  }
});

statsBtn.addEventListener("mouseover", function (event) {
  // if (!instanceReset) {
  chrome.storage.sync.get(["completedPomodoros", "breakCount"], function (
    result
  ) {
    statsBtn.setAttribute(
      "title",
      `Completed Pomodoros: ${result.completedPomodoros} Completed Breaks: ${result.breakCount}`
    );
    statsBtn.setAttribute(
      "data-original-title",
      `Completed Pomodoros: ${result.completedPomodoros} Completed Breaks: ${result.breakCount}`
    );
    $("#stats-btn").tooltip("show");
  });
});

showAddressListBtn.addEventListener("click", function (event) {
  toggleShowAddressList(function (result) {
    if (result === true) {
      showURLSection();
      document.getElementById("toggle-address-list").style.fill = "#da4567";
    } else {
      hideURLSection();
      document.getElementById("toggle-address-list").style.fill = "initial";
    }
  });
});

function toggleShowAddressList(callback) {
  chrome.storage.sync.get(["showAddressList"], function (result) {
    chrome.storage.sync.set({ showAddressList: !result.showAddressList });
    callback(!result.showAddressList);
  });
}

function addURL(event) {
  let addressBox = document.getElementById("address-box");
  if (
    (event.keyCode === 13 || event.type === "click") &&
    addressBox.value !== ""
  ) {
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
  }
}

addURLBtn.addEventListener("click", addURL);
document.getElementById("address-box").addEventListener("keyup", addURL);

blockSitesBtn.addEventListener("click", function () {
  chrome.storage.sync.get(["timerStarted", "onBreak"], function (result) {
    if (!result.timerStarted) {
      if (result.onBreak) {
        document.getElementById("block-sites-btn").innerText = "Stop Break";
        document.getElementById("pause-resume-btn").disabled = true;
      } else {
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
        document.getElementById("pause-resume-btn").disabled = false;
      }
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
  });

  chrome.storage.sync.get(["timerLength", "onBreak", "timerStarted"], function (
    result
  ) {
    if (result.timerLength !== undefined) {
      if (result.onBreak && !result.timerStarted) {
        triggerTimer(result.timerLength, false, false, true);
      } else {
        triggerTimer(result.timerLength);
      }
    } else {
      if (result.onBreak && !result.timerStarted) {
        triggerTimer(20, false, false, true);
      } else {
        triggerTimer(20);
      }
    }
  });
});

resetTimerBtn.addEventListener("click", function () {
  instanceReset = true;
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
      if (response.msg === "timerStarted" || response.msg === "breakStarted") {
        if (response.msg === "breakStarted") {
          chrome.storage.sync.get(["breakLength"], function (result) {
            if (devMode) {
              convertToMinutes(result.breakLength);
            } else {
              convertToMinutes(result.breakLength * 60);
            }
          });
        } else {
          if (devMode || isResume) {
            convertToMinutes(parseInt(length));
          } else {
            convertToMinutes(parseInt(length) * 60);
          }
        }
        showTimer();
        chrome.storage.sync.get(["showAddressList"], function (result) {
          if (result.showAddressList) {
            showURLSection();
          } else {
            hideURLSection();
          }
        });
        document.getElementById("pause-resume-btn").disabled = false;
      } else if (response.msg === "timerReset") {
        stopTimer();
        hideTimer();
        showURLSection();
        document.getElementById("block-sites-btn").innerText = "Start Timer";
        document.getElementById("pause-resume-btn").innerText = "Pause Timer";
        document.getElementById("pause-resume-btn").disabled = true;
      } else if (response.msg === "timerStopped") {
        stopTimer();
        hideTimer();
        showURLSection();
        // chrome.storage.sync.get(["onBreak"], function (result) {
        //   if (result.onBreak) {
        //     document.getElementById("block-sites-btn").innerText =
        //       "Start Break";
        //   } else {
        //     document.getElementById("block-sites-btn").innerText =
        //       "Start Timer";
        //   }
        // });
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
  li.setAttribute("class", "li-delete-url");
  let ul = document.getElementById("addresses-list");
  li.innerHTML = `<div id="delete-url"><a class="delete-btn">-</a>${addresses}</div>`;
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
        onPageLoad();
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

function showTimer() {
  document.getElementById("timer-container").style.display = "initial";
  document.getElementById("reset-timer-btn").style.display = "none";
  document.getElementById("pause-resume-btn").style.display = "initial";
  document.getElementById("title-container").style.display = "none";
  document.getElementById("toggle-address-list").style.display = "initial";
}

function hideTimer() {
  document.getElementById("timer-container").style.display = "none";
  document.getElementById("reset-timer-btn").style.display = "initial";
  document.getElementById("pause-resume-btn").style.display = "none";
  document.getElementById("title-container").style.display = "flex";
  document.getElementById("toggle-address-list").style.display = "none";
}

function showURLSection() {
  document.getElementById("block-url-container").style.display = "initial";
}

function hideURLSection() {
  document.getElementById("block-url-container").style.display = "none";
}

//if settings don't exist, set default values
function checkDefaultSettings() {
  chrome.storage.sync.get(["timerStarted"], function (result) {
    if (result.timerStarted === undefined) {
      chrome.storage.sync.set({ timerStarted: false });
    }
  });

  chrome.storage.sync.get(["breakLength"], function (result) {
    if (result.breakLength === undefined) {
      chrome.storage.sync.set({
        breakLength: 5,
      });
    }
  });

  chrome.storage.sync.get(["breakCount"], function (result) {
    if (result.breakCount === undefined) {
      chrome.storage.sync.set({
        breakCount: 0,
      });
    }
  });

  chrome.storage.sync.get(["timerLength"], function (result) {
    if (result.timerLength === undefined) {
      chrome.storage.sync.set({
        timerLength: 20,
      });
    }
  });

  chrome.storage.sync.get(["longBreakFreq"], function (result) {
    if (result.longBreakFreq === undefined) {
      chrome.storage.sync.set({
        longBreakFreq: 4,
      });
    }
  });

  chrome.storage.sync.get(["longBreakLength"], function (result) {
    if (result.longBreakLength === undefined) {
      chrome.storage.sync.set({
        longBreakLength: 10,
      });
    }
  });
}
