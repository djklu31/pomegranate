console.log("background running");
let addresses = [];
let timer;
let currentTime = false;
let devMode = true;

chrome.storage.sync.get(["addresses"], function (result) {
  if (result.address !== undefined) {
    addresses = JSON.parse(result.addresses);
  }
});

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
    let index = addresses.indexOf(request.msg.substring(2, request.msg.length));
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
  } else if (request.action === "toggleTimer") {
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
          sendResponse({ msg: "timerStarted" });
        }
      } else {
        stopTimer(timer);
        chrome.storage.sync.set({ pausedTime: null });
        // if (!result.onBreak) {
        //   chrome.storage.sync.set({ onBreak: false });
        // }
        sendResponse({ msg: "timerStopped" });
      }
    });
  } else if (request.action === "togglePause") {
    if (request.msg === "pause") {
      pauseTimer(request.pauseLength);
    } else {
      resumeTimer();
    }
  }
  return true;
});

function timerEnded() {
  chrome.storage.sync.get(
    ["onBreak", "disableBreaks", "breakCount", "longBreakFreq"],
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
                message: `Ready to resume? Long break coming in ${untilLongBreak} break.`,
                buttons: [{ title: "Start Timer" }, { title: "Close" }],
              };
            } else {
              notifOptions = {
                type: "basic",
                iconUrl: "/img/pom-128.png",
                title: "Pomegranate: Break Ended",
                message: `Ready to resume? Long break coming in ${untilLongBreak} breaks.`,
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
                  if (devMode) {
                    startTimer(1000, result.timerLength);
                  } else {
                    startTimer(1000, result.timerLength * 60);
                  }
                });
              }
            }
          });
        });
      } else {
        chrome.storage.sync.set({ onBreak: true });
        let notifOptions = {
          type: "basic",
          iconUrl: "https://image.flaticon.com/icons/png/512/605/605255.png",
          title: "Pomegranate: Timer Ended",
          message: "Take a Short Break?",
          buttons: [{ title: "Start Break" }, { title: "Close" }],
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
    if (length <= 0) {
      chrome.storage.sync.set({ pausedTime: null });
      chrome.storage.sync.set({ timerStarted: false });
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

function resumeTimer() {
  chrome.storage.sync.get(["pausedTime"], function (result) {
    // stopTimer();
    if (devMode) {
      startTimer(1000, parseInt(result.pausedTime));
    } else {
      startTimer(1000, parseInt(result.pausedTime) * 60);
    }
    chrome.storage.sync.set({ pausedTime: "resumed" });
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
        });
      } else {
        chrome.storage.sync.get(["breakLength"], function (result) {
          console.log(result.breakLength);
          if (devMode) {
            startTimer(1000, parseInt(result.breakLength));
          } else {
            startTimer(1000, parseInt(result.breakLength) * 60);
          }
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
  for (let i = timerId; i >= 0; i--) {
    clearInterval(i);
  }
}
