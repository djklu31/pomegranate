chrome.storage.sync.get(["breakLength"], function (result) {
  if (result.breakLength === undefined) {
    chrome.storage.sync.set({
      breakLength: 5,
    });
    document.getElementById("regular-break-length").value = 5;
  } else {
    document.getElementById("regular-break-length").value = result.breakLength;
  }
});

chrome.storage.sync.get(["timerLength"], function (result) {
  if (result.timerLength === undefined) {
    chrome.storage.sync.set({
      timerLength: 20,
    });
    document.getElementById("timer").value = 20;
  } else {
    document.getElementById("timer").value = result.timerLength;
  }
});

chrome.storage.sync.get(["longBreakFreq"], function (result) {
  if (result.longBreakFreq === undefined) {
    chrome.storage.sync.set({
      longBreakFreq: 10,
    });
    document.getElementById("long-break-freq").value = 10;
  } else {
    document.getElementById("long-break-freq").value = result.longBreakFreq;
  }
});

chrome.storage.sync.get(["longBreakLength"], function (result) {
  if (result.longBreakAmt === undefined) {
    chrome.storage.sync.set({
      longBreakLength: 2,
    });
    document.getElementById("long-break-length").value = 2;
  } else {
    document.getElementById("long-break-length").value = result.longBreakAmt;
  }
});

chrome.storage.sync.get(["totalBreakAmt"], function (result) {
  if (result.totalBreakAmt === undefined) {
    chrome.storage.sync.set({
      totalBreakAmt: 3,
    });
    document.getElementById("total-break-amt").value = 3;
  } else {
    document.getElementById("total-break-amt").value = result.totalBreakAmt;
  }
});

document
  .getElementById("save-settings-btn")
  .addEventListener("click", function () {
    let timerLength = document.getElementById("timer").value;
    let breakLength = document.getElementById("regular-break-length").value;
    let longBreakFreq = document.getElementById("long-break-freq").value;
    let longBreakLength = document.getElementById("long-break-length").value;
    let totalBreakAmt = document.getElementById("total-break-amt").value;

    if (
      timerLength !== "" &&
      breakLength !== "" &&
      longBreakFreq !== "" &&
      longBreakLength !== "" &&
      totalBreakAmt !== ""
    ) {
      chrome.storage.sync.set({
        breakLength: breakLength,
        timerLength: timerLength,
        longBreakFreq: longBreakFreq,
        longBreakLength: longBreakLength,
        totalBreakAmt: totalBreakAmt,
      });
    } else {
      alert("Please fill out all values");
    }
  });
