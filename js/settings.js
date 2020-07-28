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

chrome.storage.sync.get(["exclusiveMode"], function (result) {
  if (result.exclusiveMode === undefined) {
    chrome.storage.sync.set({
      exclusiveMode: false,
    });
    document.getElementById("exclusive-mode-cb").checked = false;
  } else {
    if (result.exclusiveMode === false) {
      document.getElementById("exclusive-mode-cb").checked = false;
    } else {
      document.getElementById("exclusive-mode-cb").checked = true;
    }
  }
});

chrome.storage.sync.get(["longBreakFreq"], function (result) {
  if (result.longBreakFreq === undefined) {
    chrome.storage.sync.set({
      longBreakFreq: 10,
    });
    document.getElementById("long-break-freq").value = 4;
  } else {
    document.getElementById("long-break-freq").value = result.longBreakFreq;
  }
});

chrome.storage.sync.get(["disableNewTab"], function (result) {
  if (result.disableNewTab === undefined) {
    chrome.storage.sync.set({
      disableNewTab: false,
    });
    document.getElementById("disable-new-tab").checked = false;
  } else {
    document.getElementById("disable-new-tab").checked = result.disableNewTab;
  }
});

chrome.storage.sync.get(["longBreakLength"], function (result) {
  if (result.longBreakLength === undefined) {
    chrome.storage.sync.set({
      longBreakLength: 2,
    });
    document.getElementById("long-break-length").value = 2;
  } else {
    document.getElementById("long-break-length").value = result.longBreakLength;
  }
});

chrome.storage.sync.get(["totalBreakAmt"], function (result) {
  if (result.totalBreakAmt === undefined) {
    chrome.storage.sync.set({
      totalBreakAmt: 3,
    });
    document.getElementById("total-break-amt").value = 10;
  } else {
    document.getElementById("total-break-amt").value = result.totalBreakAmt;
  }
});

chrome.storage.sync.get(["disableBreaks"], function (result) {
  if (result.disableBreaks === undefined) {
    chrome.storage.sync.set({
      disableBreaks: false,
    });
    document.getElementById("disable-breaks").checked = false;
    enableBreaks();
  } else {
    document.getElementById("disable-breaks").checked = result.disableBreaks;
    if (result.disableBreaks) {
      disableBreaks();
    } else {
      enableBreaks();
    }
  }
});

function disableBreaks() {
  document.getElementById("regular-break-length").disabled = true;
  document.getElementById("long-break-freq").disabled = true;
  document.getElementById("long-break-length").disabled = true;
  document.getElementById("total-break-amt").disabled = true;
}

function enableBreaks() {
  document.getElementById("regular-break-length").disabled = false;
  document.getElementById("long-break-freq").disabled = false;
  document.getElementById("long-break-length").disabled = false;
  document.getElementById("total-break-amt").disabled = false;
}

document
  .getElementById("disable-breaks")
  .addEventListener("click", function (event) {
    if (event.target.checked) {
      disableBreaks();
    } else {
      enableBreaks();
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
    let disableBreaks = document.getElementById("disable-breaks").checked;
    let disableNewTab = document.getElementById("disable-new-tab").checked;
    let exclusiveMode = document.getElementById("exclusive-mode-cb").checked;

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
        exclusiveMode: exclusiveMode,
        disableBreaks: disableBreaks,
        disableNewTab: disableNewTab,
      });
    } else {
      alert("Please fill out all values");
    }
  });
