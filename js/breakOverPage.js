chrome.storage.sync.get(["breakCount", "longBreakFreq"], function (result) {
  let breakCount = parseInt(result.breakCount);
  let nextNumber = parseInt(result.longBreakFreq);

  while (nextNumber < breakCount) {
    nextNumber += parseInt(result.longBreakFreq);
  }

  let untilLongBreak = nextNumber - breakCount;
  if (untilLongBreak === 0) {
    document.getElementById(
      "long-short"
    ).innerHTML = `<img class="big-icon" src="/img/vacation-big.png" />Long`;
  } else {
    document.getElementById(
      "long-short"
    ).innerHTML = `<img class="big-icon" src="/img/breaks-over.png" />Short`;
  }
});

document.getElementById("start-btn").addEventListener("click", function () {
  //start break
  chrome.storage.sync.get(["timerLength"], function (result) {
    triggerTimer(result.timerLength, false, false, false);
    closeTimerEndedWindows();
  });
});

function triggerTimer(length, isResume, isReset, startBreak) {
  chrome.runtime.sendMessage({
    action: "toggleTimer",
    msg: length,
    isResume: isResume,
    isReset: isReset,
    startBreak: startBreak,
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
          chrome.tabs.remove(tab.id);
        }
      }
    }
  });
}
