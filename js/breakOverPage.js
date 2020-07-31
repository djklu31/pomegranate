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
