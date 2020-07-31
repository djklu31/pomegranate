chrome.storage.sync.get(
  ["breakCount", "longBreakFreq", "completedPomodoros"],
  function (result) {
    let breakCount = parseInt(result.breakCount) + 1;
    let nextNumber = parseInt(result.longBreakFreq);

    while (nextNumber < breakCount) {
      nextNumber += parseInt(result.longBreakFreq);
    }

    let untilLongBreak = nextNumber - breakCount;
    if (untilLongBreak === 0) {
      document.getElementById(
        "inner-content"
      ).innerHTML = `<img class="big-icon" src="/img/party-big.png" />Congrats, made it to ${result.completedPomodoros} pomodoro cycles.<br/ > It's time for a <span class="highlight">long break.</span> <br/ > You deserve it. `;
    } else if (untilLongBreak === 1) {
      document.getElementById(
        "inner-content"
      ).innerHTML = `<img class="big-icon" src="/img/short-break-big.png" />It's time for a <span class="highlight">short break.</span> <br/> The next break is a long one. <br/> ${result.completedPomodoros} pomodoros completed so far.`;
    } else {
      document.getElementById(
        "inner-content"
      ).innerHTML = `<img class="big-icon" src="/img/short-break-big.png" />It's time for a <span class="highlight">short break.</span> <br/> ${untilLongBreak} more breaks until a long one. <br/> ${result.completedPomodoros} pomodoros completed so far.`;
    }
  }
);

document.getElementById("start-btn").addEventListener("click", function () {
  //start break
  triggerBreak(null, false, false, true);
  closeTimerEndedWindows();
});

function triggerBreak(length, isResume, isReset, startBreak) {
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
          console.log("CLOSE: " + JSON.stringify(tab));
          chrome.tabs.remove(tab.id);
        }
      }
    }
  });
}
