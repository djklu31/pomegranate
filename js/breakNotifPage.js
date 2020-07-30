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
      ).innerHTML = `Congrats, made it to ${result.completedPomodoros} pomodoro cycles.<br/ > It's time for a <span class="highlight">long break.</span> <br/ > You deserve it. `;
    } else if (untilLongBreak === 1) {
      document.getElementById(
        "inner-content"
      ).innerHTML = `It's time for a <span class="highlight">short break.</span> <br/> The next break is a long one. <br/> ${result.completedPomodoros} pomodoros completed so far.`;
    } else {
      document.getElementById(
        "inner-content"
      ).innerHTML = `It's time for a <span class="highlight">short break.</span> <br/> ${untilLongBreak} more breaks until a long one. <br/> ${result.completedPomodoros} pomodoros completed so far.`;
    }
  }
);
