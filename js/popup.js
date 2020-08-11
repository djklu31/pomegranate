let addURLBtn = document.getElementById("add-url-btn");
let parentList = document.getElementById("addresses-list");
let blockSitesBtn = document.getElementById("block-sites-btn");
// let saveSettingsBtn = document.getElementById("save-settings-btn");
let settingsBtn = document.getElementById("settings-btn");
let pauseResumeBtn = document.getElementById("pause-resume-btn");
let resetTimerBtn = document.getElementById("reset-timer-btn");
let statsBtn = document.getElementById("stats-btn");
let showAddressListBtn = document.getElementById("toggle-address-list");
let skipBreakBtn = document.getElementById("skip-break-btn");
let timer;
let devMode = false;
let globalTimer;

checkDefaultSettings();
onPageLoad();
setDescription();

$(function () {
  $("#skip-break-btn").tooltip();
});

function displayLoading() {
  document.getElementById("loading-message").style.display = "initial";
  document.getElementById("post-load").style.display = "none";
}

function hideLoading() {
  document.getElementById("loading-message").style.display = "none";
  document.getElementById("post-load").style.display = "initial";
}

chrome.storage.sync.get(["popupOpenCount"], function (result) {
  let count = result.popupOpenCount + 1;
  chrome.storage.sync.set({ popupOpenCount: count });

  if (count === 1) {
    chrome.storage.sync.set({ onBreak: false });
    chrome.storage.sync.set({ pausedTime: null });
    chrome.storage.sync.set({ breakStarted: false });
    chrome.storage.sync.set({ timerStarted: true });
    toggleStartStop();
  }
});

function onPageLoad() {
  zeroOutDisplay();
  displayLoading();

  chrome.storage.sync.get(["exclusiveMode"], function (result) {
    if (result.exclusiveMode) {
      forceStopTimer();
      hideLoading();
      // document.getElementById(
      //   "description"
      // ).innerHTML = `<span class="highlight">Exclusive Mode</span> is enabled and websites entered are always being blocked. The timer is disabled.`;
    } else {
      chrome.storage.sync.get(
        [
          "timerStarted",
          "onBreak",
          "pausedTime",
          "disableBreaks",
          "longBreakFreq",
        ],
        function (result) {
          // if (!result.disableBreaks) {
          //   document.getElementById(
          //     "description"
          //   ).innerHTML = `<span class="highlight">Focus mode</span> is enabled. All websites entered below will be blocked when the timer starts.`;
          // }

          if (result.timerStarted) {
            //get from background script
            chrome.runtime.sendMessage({ action: "getTimeLeft" }, function (
              response
            ) {
              console.log(response);
              if (response.timeLeft === false && !result.pausedTime) {
                document.getElementById("timer-display").innerText = "--:--";

                setTimeout(function () {
                  chrome.runtime.sendMessage(
                    { action: "getTimeLeft" },
                    function (response) {
                      let currentTimeLeft = parseInt(response.timeLeft);
                      // chrome.storage.sync.get(["pausedTime"], function (result) {
                      if (
                        result.pausedTime === "resumed" ||
                        result.pausedTime === undefined ||
                        result.pausedTime === null
                      ) {
                        chrome.storage.sync.get(["showAddressList"], function (
                          result
                        ) {
                          if (result.showAddressList) {
                            showURLSection();
                          } else {
                            hideURLSection();
                          }
                        });
                        convertToMinutes(currentTimeLeft);
                      }
                      // });
                    }
                  );
                }, 1000);
              } else {
                let currentTimeLeft = parseInt(response.timeLeft);
                // chrome.storage.sync.get(["pausedTime"], function (result) {
                if (
                  result.pausedTime === "resumed" ||
                  result.pausedTime === undefined ||
                  result.pausedTime === null
                ) {
                  chrome.storage.sync.get(["showAddressList"], function (
                    result
                  ) {
                    if (result.showAddressList) {
                      showURLSection();
                      document.getElementById(
                        "toggle-address-list"
                      ).style.fill = "#da4567";
                    } else {
                      hideURLSection();
                      document.getElementById(
                        "toggle-address-list"
                      ).style.fill = "initial";
                    }
                  });
                  convertToMinutes(currentTimeLeft);
                }
                // });
              }
            });

            if (result.onBreak) {
              hideLoading();
              setDescription(true);
              document.getElementById("block-sites-btn").innerText =
                "Stop Break";
              document.getElementById("skip-break-btn").style.display =
                "initial;";
            } else {
              hideLoading();
              setDescription(true);
              document.getElementById("block-sites-btn").innerText =
                "Stop Timer";
              document.getElementById("skip-break-btn").style.display = "none";
            }

            showTimer();
            hideURLSection();
            document.getElementById("pause-resume-btn").disabled = false;
          } else {
            if (result.onBreak) {
              hideLoading();
              document.getElementById("block-sites-btn").innerText =
                "Start Break";
              document.getElementById("skip-break-btn").style.display =
                "initial;";
              hideTimer();
              showURLSection();
              document.getElementById("pause-resume-btn").disabled = true;
            } else {
              hideLoading();
              document.getElementById("block-sites-btn").innerText =
                "Start Timer";
              document.getElementById("skip-break-btn").style.display = "none";
              hideTimer();
              showURLSection();
              document.getElementById("pause-resume-btn").disabled = true;
            }
          }
        }
      );
      chrome.storage.sync.get(["pausedTime", "onBreak"], function (result) {
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
              document.getElementById("toggle-address-list").style.fill =
                "#da4567";
            } else {
              hideURLSection();
              document.getElementById("toggle-address-list").style.fill =
                "initial";
            }
          });

          chrome.storage.sync.get(["onBreak"], function (result) {
            if (result.onBreak) {
              document.getElementById("pause-resume-btn").innerText =
                "Resume Break";
            } else {
              document.getElementById("pause-resume-btn").innerText =
                "Resume Timer";
            }
          });
        } else {
          chrome.storage.sync.get(["onBreak"], function (result) {
            if (result.onBreak) {
              document.getElementById("pause-resume-btn").innerText =
                "Pause Break";
              document.getElementById("skip-break-btn").style.display =
                "initial;";
            } else {
              document.getElementById("pause-resume-btn").innerText =
                "Pause Timer";
              document.getElementById("skip-break-btn").style.display = "none";
            }
          });
        }
      });
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

//Event Listeners

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "startTimer") {
    toggleStartStop();
    sendResponse({ msg: "timer-started" });
  } else if (request.action === "startBreak") {
    toggleStartStop();
    sendResponse({ msg: "break-started" });
  }
  return true;
});

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
    chrome.runtime.sendMessage(
      {
        msg: "resume",
        action: "togglePause",
      },
      function (response) {
        if (response.msg === "resumed") {
          setDescription(true);
        }
      }
    );
  } else if (event.target.innerText === "Resume Break") {
    document.getElementById("pause-resume-btn").innerText = "Pause Break";
    chrome.storage.sync.get(["pausedTime"], function (result) {
      triggerTimer(globalTimer, true);
    });
    chrome.runtime.sendMessage(
      {
        msg: "resume",
        action: "togglePause",
      },
      function (response) {
        if (response.msg === "resumed") {
          setDescription(true);
        }
      }
    );
  } else {
    if (event.target.innerText === "Pause Break") {
      document.getElementById("pause-resume-btn").innerText = "Resume Break";
    } else {
      document.getElementById("pause-resume-btn").innerText = "Resume Timer";
    }
    document.getElementById(
      "description"
    ).innerHTML = `<img class="status-icon" src="/img/pause.png" />The timer is <span class="highlight">paused.</span>`;
    displayPausedTime(globalTimer);
    chrome.runtime.sendMessage({
      msg: "pause",
      action: "togglePause",
      pauseLength: globalTimer,
    });
  }
});

skipBreakBtn.addEventListener("click", function (event) {
  $("#skip-break-btn").tooltip("hide");
  chrome.storage.sync.set({ onBreak: false });
  chrome.storage.sync.set({ timerStarted: true });
  chrome.storage.sync.set({ breakStarted: false });
  chrome.storage.sync.get(["breakCount"], function (result) {
    let count = result.breakCount + 1;
    chrome.storage.sync.set({ breakCount: count });
  });
  toggleStartStop();
});

statsBtn.addEventListener("mouseover", function (event) {
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

function untilLongBreak(callback) {
  chrome.storage.sync.get(["breakCount", "longBreakFreq"], function (result) {
    let breakCount = parseInt(result.breakCount) + 1;
    let nextNumber = parseInt(result.longBreakFreq);

    while (nextNumber < breakCount) {
      nextNumber += parseInt(result.longBreakFreq);
    }

    let untilLongBreak = nextNumber - breakCount;
    callback(untilLongBreak);
  });
}

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

blockSitesBtn.addEventListener("click", toggleStartStop);

function toggleStartStop() {
  chrome.storage.sync.get(
    ["timerStarted", "onBreak", "showAddressList"],
    function (result) {
      if (!result.timerStarted) {
        if (result.onBreak) {
          document.getElementById("block-sites-btn").innerText = "Stop Break";
          document.getElementById("skip-break-btn").style.display = "initial;";
          document.getElementById("pause-resume-btn").disabled = true;
          if (result.showAddressList) {
            showURLSection();
            document.getElementById("toggle-address-list").style.fill =
              "#da4567";
          } else {
            hideURLSection();
            document.getElementById("toggle-address-list").style.fill =
              "initial";
          }
          setDescription(true);
        } else {
          setDescription(true);
          document.getElementById("block-sites-btn").innerText = "Stop Timer";
          document.getElementById("skip-break-btn").style.display = "none";
          if (result.showAddressList) {
            showURLSection();
            document.getElementById("toggle-address-list").style.fill =
              "#da4567";
          } else {
            hideURLSection();
            document.getElementById("toggle-address-list").style.fill =
              "initial";
          }
          document.getElementById("pause-resume-btn").disabled = false;
        }
        closeTimerEndedWindows();
        // getTimeLeft();
      } else {
        if (result.onBreak) {
          document.getElementById("block-sites-btn").innerText = "Start Break";
          document.getElementById("skip-break-btn").style.display = "initial;";
          document.getElementById("pause-resume-btn").disabled = true;
        } else {
          document.getElementById("block-sites-btn").innerText = "Start Timer";
          document.getElementById("skip-break-btn").style.display = "none";
          document.getElementById("pause-resume-btn").disabled = true;
        }
        // stopTimer();
      }
    }
  );

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
}

resetTimerBtn.addEventListener("click", function () {
  triggerTimer(null, false, true);
});

settingsBtn.addEventListener("click", function () {
  openSettingsPage();
});

function openSettingsPage() {
  window.open("/html/settings.html");
}

// function setTimerOnDesc() {
//   document.getElementById(
//     "description"
//   ).innerHTML = `<span class="highlight">Focus</span> timer is running and websites entered are being blocked.`;
// }

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
        document.getElementById("skip-break-btn").style.display = "none";
        document.getElementById("pause-resume-btn").innerText = "Pause Timer";
        document.getElementById("pause-resume-btn").disabled = true;
        setDescription();
      } else if (response.msg === "timerStopped") {
        stopTimer();
        hideTimer();
        showURLSection();

        setDescription();
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

function setDescription(timerOn) {
  chrome.storage.sync.get(
    [
      "disableBreaks",
      "exclusiveMode",
      "onBreak",
      "completedPomodoros",
      "pausedTime",
    ],
    function (result) {
      if (
        result.pausedTime !== "resumed" &&
        result.pausedTime !== undefined &&
        result.pausedTime !== null
      ) {
        document.getElementById(
          "description"
        ).innerHTML = `<img class="status-icon" src="/img/pause.png" />The timer is <span class="highlight">paused.</span>`;
      } else if (timerOn) {
        if (result.onBreak) {
          untilLongBreak(function (result) {
            if (result == 0) {
              document.getElementById(
                "description"
              ).innerHTML = `<img class="status-icon" src="/img/long-break.png" /><span class="highlight">Long break</span> started.`;
            } else if (result == 1) {
              document.getElementById(
                "description"
              ).innerHTML = `<img class="status-icon" src="/img/short-break.png" /><span class="highlight">Break started.</span> Blocked websites are now enabled. The next break is a long one.`;
            } else {
              document.getElementById(
                "description"
              ).innerHTML = `<img class="status-icon" src="/img/short-break.png" /><span class="highlight">Break started.</span> Blocked websites are now enabled. ${result} breaks until long break.`;
            }
          });
        } else {
          document.getElementById(
            "description"
          ).innerHTML = `<img class="status-icon" src="/img/color-clock.png" /><span class="highlight">Focus timer is running.</span> The websites entered are being blocked.`;
        }
      } else {
        if (result.exclusiveMode) {
          document.getElementById(
            "description"
          ).innerHTML = `<img class="status-icon" src="/img/exclusive-mode.png" /><span class="highlight">Exclusive Mode is enabled.</span> The websites entered below are ALWAYS being blocked and the timer is disabled.`;
        } else if (result.onBreak) {
          untilLongBreak(function (res) {
            if (res == 0) {
              document.getElementById(
                "description"
              ).innerHTML = `<img class="status-icon" src="/img/party.png" /><span class="highlight">Congrats.</span> You've completed ${result.completedPomodoros} pomodoro cycles. Ready to stretch your legs and take a <span class="highlight">long break?</span>`;
            } else {
              document.getElementById(
                "description"
              ).innerHTML = `<img class="status-icon" src="/img/completed.png" /><span class="highlight">Pomodoro cycle ended.</span> Ready to take a short break?`;
            }
          });
        } else if (result.disableBreaks) {
          document.getElementById(
            "description"
          ).innerHTML = `<img class="status-icon" src="/img/single-timer.png" /><span class="highlight">Single Timer Mode is on.</span> Breaks are disabled but the normal timer works as expected.`;
        } else {
          document.getElementById(
            "description"
          ).innerHTML = `<img class="status-icon" src="/img/focus-mode.png" /><span class="highlight">Focus mode is enabled.</span> All websites entered below will be blocked when the timer starts.`;
        }
      }
    }
  );
}

function addToList(addresses) {
  let li = document.createElement("li");
  li.setAttribute("class", "li-delete-url");
  let ul = document.getElementById("addresses-list");
  li.innerHTML = `<div class="delete-url"><a class="delete-btn">-</a>${addresses}</div>`;
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

  if (!isNaN(paddedMinutes) && !isNaN(paddedSeconds)) {
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
          setDescription();
          stopTimer();
          document.getElementById("timer-display").innerHTML = "";
          document.getElementById("block-sites-btn").innerText = "Start Timer";
          document.getElementById("skip-break-btn").style.display = "none";
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
  } else {
    chrome.storage.sync.set({ onBreak: false });
    chrome.storage.sync.set({ pausedTime: null });
    chrome.storage.sync.set({ breakStarted: false });
    chrome.storage.sync.set({ timerStarted: true });
    toggleStartStop();
  }
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

function forceStopTimer() {
  hideTimer();
  showURLSection();
  document.getElementById("block-sites-btn").innerText = "Start Timer";
  document.getElementById("skip-break-btn").style.display = "none";
  document.getElementById("block-sites-btn").disabled = true;
  document.getElementById("pause-resume-btn").innerText = "Pause Timer";
  document.getElementById("pause-resume-btn").disabled = true;
  document.getElementById("reset-timer-btn").disabled = true;
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

  // chrome.storage.sync.get(["disableBreaks"], function (result) {
  //   if (result.disableBreaks) {
  //     document.getElementById(
  //       "description"
  //     ).innerHTML = `<span class="highlight">Single Timer Mode</span> is on. Breaks are disabled but the normal timer works as expected.`;
  //   }
  // });

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

function closeTimerEndedWindows() {
  chrome.tabs.query({}, function (tabs) {
    // and use that tab to fill in out title and url
    console.log(tabs);
    if (tabs !== undefined) {
      for (tab of tabs) {
        if (
          tab.title === "Timer Ended - Pomegranate" ||
          tab.title === "Break's Over - Pomegranate"
        ) {
          console.log("CLOSE: " + JSON.stringify(tab));
          chrome.tabs.remove(tab.id);
        }
      }
    }
  });
}
