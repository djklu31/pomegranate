console.log("background running");
let timer;
let currentTime = false;
let devMode = false;

//keep track of first popup open.
chrome.storage.sync.set({ popupOpenCount: 0 });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "addURL") {
    chrome.storage.sync.get(["addresses"], function (result) {
      let addresses = [];

      if (result.addresses !== undefined) {
        addresses = JSON.parse(result.addresses);
      }

      addresses.push(request.msg);

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
    });
  } else if (request.action === "deleteURL") {
    //remove the ending "hyphen"
    chrome.storage.sync.get(["addresses"], function (result) {
      let addresses = [];

      if (result.addresses !== undefined) {
        addresses = JSON.parse(result.addresses);
      }

      let index = addresses.indexOf(
        request.msg.substring(2, request.msg.length)
      );
      if (index != -1) {
        addresses.splice(index, 1);
      }

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
    });
  }
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getTimeLeft") {
    sendResponse({ timeLeft: currentTime });
  }
  if (request.action === "showRedirectNotif") {
    showRedirectNotif(request.original, request.redirectURL);
    sendResponse({ msg: "notif-success" });
  }
  return true;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleTimer") {
    chrome.storage.sync.get(["timerStarted", "onBreak"], function (result) {
      if (request.startBreak) {
        startBreak();
        sendResponse({ msg: "breakStarted" });
      } else if (request.isReset) {
        stopTimer(timer);
        chrome.storage.sync.set({ breakCount: 0 });
        chrome.storage.sync.set({ pausedTime: null });
        chrome.storage.sync.set({ onBreak: false });
        chrome.storage.sync.set({ completedPomodoros: 0 });
        sendResponse({ msg: "timerReset" });
      } else if (!result.timerStarted || request.isResume) {
        if (request.isResume) {
          startTimer(1000, parseInt(request.msg));
          sendResponse({ msg: "timerStarted" });
        } else {
          if (devMode) {
            startTimer(1000, parseInt(request.msg));
          } else {
            startTimer(1000, parseInt(request.msg) * 60);
          }
          chrome.browserAction.setBadgeBackgroundColor({ color: "#48A367" });
          sendResponse({ msg: "timerStarted" });
        }
      } else {
        stopTimer(timer);
        chrome.storage.sync.set({ pausedTime: null });
        // }
        // if (!result.onBreak) {
        //   chrome.storage.sync.set({ onBreak: false });
        sendResponse({ msg: "timerStopped" });
      }
    });
  } else if (request.action === "togglePause") {
    if (request.msg === "pause") {
      pauseTimer(request.pauseLength);
    } else {
      resumeTimer(function () {
        sendResponse({ msg: "resumed" });
      });
    }
  }
  return true;
});

function showRedirectNotif(currentSite, redirectURL) {
  let notifOptions = {
    type: "basic",
    iconUrl: "/img/pom-128.png",
    title: "Pomegranate",
    message: currentSite + " was redirected to " + redirectURL,
    buttons: [{ title: "Close" }],
  };

  chrome.notifications.create(notifOptions, function (id) {});
}

function timerEnded() {
  chrome.storage.sync.get(
    [
      "onBreak",
      "disableBreaks",
      "breakCount",
      "longBreakFreq",
      "completedPomodoros",
    ],
    function (result) {
      if (result.onBreak || result.disableBreaks) {
        chrome.storage.sync.set({ onBreak: false });
        let notifOptions = {};

        let breakCount = parseInt(result.breakCount) + 1;
        let nextNumber = parseInt(result.longBreakFreq);

        while (nextNumber < breakCount) {
          nextNumber += parseInt(result.longBreakFreq);
        }

        let untilLongBreak = nextNumber - breakCount;

        if (result.disableBreaks) {
          notifOptions = {
            type: "basic",
            iconUrl: "/img/pom-128.png",
            title: "Pomegranate: Timer Ended",
            message: "Would you like to start another cycle?",
            buttons: [{ title: "Start Timer" }, { title: "Close" }],
          };
          chrome.storage.sync.get(["disableNewTab"], function (result) {
            if (!result.disableNewTab) {
              window.open("/html/resumeCyclePage.html");
            }
          });
        } else {
          if (untilLongBreak === 0) {
            notifOptions = {
              type: "basic",
              iconUrl: "/img/pom-128.png",
              title: "Pomegranate: Long Break Ended",
              message: `Long break is over. Ready to resume?`,
              buttons: [{ title: "Start Timer" }, { title: "Close" }],
            };
          } else {
            if (untilLongBreak === 1) {
              notifOptions = {
                type: "basic",
                iconUrl: "/img/pom-128.png",
                title: "Pomegranate: Break Ended",
                message: `Ready to resume? The next break is a long one.`,
                buttons: [{ title: "Start Timer" }, { title: "Close" }],
              };
            } else {
              notifOptions = {
                type: "basic",
                iconUrl: "/img/pom-128.png",
                title: "Pomegranate: Break Ended",
                message: `Ready to resume? A long break is coming in ${untilLongBreak} breaks.`,
                buttons: [{ title: "Start Timer" }, { title: "Close" }],
              };
            }
          }
          chrome.storage.sync.get(["disableNewTab"], function (result) {
            if (!result.disableNewTab) {
              window.open("/html/breakOverPage.html");
            }
          });
        }

        chrome.notifications.create(notifOptions, function (id) {
          chrome.notifications.onButtonClicked.addListener(function (
            notifId,
            btnIdx
          ) {
            if (notifId === id) {
              if (btnIdx === 0) {
                chrome.storage.sync.get(["timerLength"], function (result) {
                  chrome.storage.sync.set({ onBreak: false });
                  chrome.runtime.sendMessage(
                    { action: "startTimer" },
                    function (response) {
                      if (response === undefined) {
                        if (devMode) {
                          startTimer(1000, result.timerLength);
                        } else {
                          startTimer(1000, result.timerLength * 60);
                        }
                      }
                    }
                  );
                });
                chrome.browserAction.setBadgeBackgroundColor({
                  color: "#48A367",
                });
                closeTimerEndedWindows();
              }
            }
          });
        });
      } else {
        let breakCount = parseInt(result.breakCount) + 1;
        let nextNumber = parseInt(result.longBreakFreq);

        while (nextNumber < breakCount) {
          nextNumber += parseInt(result.longBreakFreq);
        }

        let untilLongBreak = nextNumber - breakCount;
        let notifOptions = {};

        if (untilLongBreak === 0) {
          notifOptions = {
            type: "basic",
            iconUrl: "https://image.flaticon.com/icons/png/512/605/605255.png",
            title: "Pomegranate: Timer Ended",
            message: `Congrats, you've made it this far. ${
              result.completedPomodoros + 1
            } pomodoro cycles completed. Ready to take a long break?`,
            buttons: [{ title: "Start Break" }, { title: "Close" }],
          };
        } else {
          notifOptions = {
            type: "basic",
            iconUrl: "https://image.flaticon.com/icons/png/512/605/605255.png",
            title: "Pomegranate: Timer Ended",
            message: `Pomodoro cycle finished. Ready to take a short break?`,
            buttons: [{ title: "Start Break" }, { title: "Close" }],
          };
        }

        chrome.storage.sync.set({ onBreak: true });
        chrome.notifications.create(notifOptions, function (id) {
          chrome.notifications.onButtonClicked.addListener(function (
            notifId,
            btnIdx
          ) {
            if (notifId === id) {
              if (btnIdx === 0) {
                chrome.runtime.sendMessage({ action: "startBreak" }, function (
                  response
                ) {
                  if (response === undefined) {
                    startBreak();
                  }
                });
                closeTimerEndedWindows();
              }
            }
          });
        });
        chrome.storage.sync.get(["disableNewTab"], function (result) {
          if (!result.disableNewTab) {
            window.open("/html/breakNotifPage.html");
          }
        });
      }
    }
  );
}

function startTimer(speed, length) {
  chrome.storage.sync.set({ timerStarted: true });
  stopTimer(timer, true);
  timer = setInterval(function () {
    //stop all previous timers if a new one is started
    length = length - 1;
    currentTime = length;
    let minutes = Math.floor(currentTime / 60);
    let seconds = currentTime % 60;

    if (minutes < 1) {
      chrome.browserAction.setBadgeText({ text: seconds.toString() + "s" });
    } else {
      chrome.browserAction.setBadgeText({
        text: (minutes + 1).toString() + "m",
      });
    }
    if (length <= 0) {
      chrome.storage.sync.set({ pausedTime: null });
      chrome.storage.sync.set({ timerStarted: false });
      chrome.browserAction.setBadgeText({ text: "" });
      stopTimer(timer);
      timerEnded();
      chrome.storage.sync.get(["completedPomodoros", "onBreak"], function (
        result
      ) {
        if (!result.onBreak) {
          chrome.storage.sync.set({
            completedPomodoros: result.completedPomodoros + 1,
          });
        } else {
          recordBreak();
        }
      });
    }
  }, speed);
}

function pauseTimer(pauseLength) {
  chrome.storage.sync.set({ pausedTime: pauseLength });
  console.log("paused: " + currentTime);
  stopTimer(timer, true);
}

function resumeTimer(callback) {
  chrome.storage.sync.get(["pausedTime"], function (result) {
    // stopTimer();
    if (devMode) {
      startTimer(1000, parseInt(result.pausedTime));
    } else {
      startTimer(1000, parseInt(result.pausedTime) * 60);
    }
    chrome.storage.sync.set({ pausedTime: "resumed" });
    callback();
  });
}

function checkLongBreak(breakCount) {
  chrome.storage.sync.get(["longBreakFreq"], function (result) {
    let longBreakFreq = result.longBreakFreq;

    chrome.storage.sync.get(["longBreakLength"], function (result) {
      let longBreakLength = result.longBreakLength;

      if (breakCount % parseInt(longBreakFreq) === 0) {
        chrome.storage.sync.get(["breakLength"], function (result) {
          console.log(result.breakLength);
          if (devMode) {
            startTimer(1000, parseInt(longBreakLength));
          } else {
            startTimer(1000, parseInt(longBreakLength) * 60);
          }
          chrome.browserAction.setBadgeBackgroundColor({ color: "#a39448" });
        });
      } else {
        chrome.storage.sync.get(["breakLength"], function (result) {
          console.log(result.breakLength);
          if (devMode) {
            startTimer(1000, parseInt(result.breakLength));
          } else {
            startTimer(1000, parseInt(result.breakLength) * 60);
          }
          chrome.browserAction.setBadgeBackgroundColor({ color: "#a39448" });
        });
      }
    });
  });
}

function startBreak() {
  chrome.storage.sync.get(["breakCount"], function (result) {
    let breakCount;
    breakCount = result.breakCount + 1;

    checkLongBreak(breakCount);
  });
}

function recordBreak() {
  chrome.storage.sync.get(["breakCount"], function (result) {
    let breakCount;
    breakCount = result.breakCount + 1;

    chrome.storage.sync.set({ breakCount: breakCount });
  });
}

function stopTimer(timerId, dontReflect) {
  currentTime = false;
  if (!dontReflect) {
    chrome.storage.sync.set({ timerStarted: false });
  }
  chrome.browserAction.setBadgeText({ text: "" });
  for (let i = timerId; i >= 0; i--) {
    clearInterval(i);
  }
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
