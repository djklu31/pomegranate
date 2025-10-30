switchPages("settings");

document
  .getElementById("settings-btn")
  .addEventListener("click", function (event) {
    switchPages("settings");
  });

document
  .getElementById("feedback-btn")
  .addEventListener("click", function (event) {
    switchPages("feedback");
  });

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

chrome.storage.sync.get(["redirectEnabled"], function (result) {
  if (result.redirectEnabled === undefined) {
    chrome.storage.sync.set({
      redirectEnabled: false,
    });
    document.getElementById("custom-block-url").checked = false;
  } else {
    document.getElementById("custom-block-url").checked =
      result.redirectEnabled;

    if (result.redirectEnabled === true) {
      chrome.storage.sync.get(["redirectURL"], function (result) {
        if (result.redirectURL !== undefined) {
          document.getElementById("custom-block-input").value =
            result.redirectURL;
        }
      });
    }
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

function resetBreakValues() {
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

  chrome.storage.sync.get(["breakLength"], function (result) {
    if (result.breakLength === undefined) {
      chrome.storage.sync.set({
        breakLength: 5,
      });
      document.getElementById("regular-break-length").value = 5;
    } else {
      document.getElementById("regular-break-length").value =
        result.breakLength;
    }
  });

  chrome.storage.sync.get(["longBreakLength"], function (result) {
    if (result.longBreakLength === undefined) {
      chrome.storage.sync.set({
        longBreakLength: 2,
      });
      document.getElementById("long-break-length").value = 2;
    } else {
      document.getElementById("long-break-length").value =
        result.longBreakLength;
    }
  });

  document.getElementById("long-break-freq").style.borderColor = "#ced4da";
  document.getElementById("long-break-length").style.borderColor = "#ced4da";
  document.getElementById("regular-break-length").style.borderColor = "#ced4da";
}

function closeAlerts() {
  $(".alert").alert("close");
}

function switchPages(page) {
  if (page === "settings") {
    document.getElementById("settings-btn").style.backgroundColor = "#d75e72";
    document.getElementById("feedback-btn").style.backgroundColor = "initial";
    document.getElementById("settings-page").style.display = "initial";
    document.getElementById("feedback-page").style.display = "none";
  } else {
    document.getElementById("feedback-btn").style.backgroundColor = "#d75e72";
    document.getElementById("settings-btn").style.backgroundColor = "initial";
    document.getElementById("feedback-page").style.display = "initial";
    document.getElementById("settings-page").style.display = "none";
  }
}

function disableBreaks() {
  document.getElementById("regular-break-length").disabled = true;
  document.getElementById("long-break-freq").disabled = true;
  document.getElementById("long-break-length").disabled = true;
}

function enableBreaks() {
  document.getElementById("regular-break-length").disabled = false;
  document.getElementById("long-break-freq").disabled = false;
  document.getElementById("long-break-length").disabled = false;
}

document
  .getElementById("disable-breaks")
  .addEventListener("click", function (event) {
    if (event.target.checked) {
      resetBreakValues();
      disableBreaks();
    } else {
      enableBreaks();
    }
  });

// let querySelectorAll = document.querySelectorAll("input");
// querySelectorAll[0].addEventListener("click", function (event) {
//   console.log(event);
// });
function attachInputBorderListener() {
  let querySelectorAll = document.querySelectorAll("input");
  for (i = 0; i < querySelectorAll.length; i++) {
    querySelectorAll[i].addEventListener("click", function (event) {
      document.getElementById(event.target.id).style.borderColor = "#ced4da";
    });
  }
}
document
  .getElementById("save-settings-btn")
  .addEventListener("click", function () {
    let timerLength = document.getElementById("timer").value;
    let breakLength = document.getElementById("regular-break-length").value;
    let longBreakFreq = document.getElementById("long-break-freq").value;
    let longBreakLength = document.getElementById("long-break-length").value;
    let disableBreaks = document.getElementById("disable-breaks").checked;
    let disableNewTab = document.getElementById("disable-new-tab").checked;
    let exclusiveMode = document.getElementById("exclusive-mode-cb").checked;
    let redirectBox = document.getElementById("custom-block-url").checked;
    let redirectURL = document.getElementById("custom-block-input").value;

    if (redirectBox === true && redirectURL.trim() === "") {
      scroll(0, 0);
      document.getElementById(
        "alert-container"
      ).innerHTML = `<div id="redirection-not-set" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Missing Info:</strong> Please enter custom URL for redirection or un-check redirect mode at the bottom of the page.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    } else if (
      timerLength !== "" &&
      breakLength !== "" &&
      longBreakFreq !== "" &&
      longBreakLength !== ""
    ) {
      chrome.storage.sync.set({
        breakLength: breakLength,
        timerLength: timerLength,
        longBreakFreq: longBreakFreq,
        longBreakLength: longBreakLength,
        exclusiveMode: exclusiveMode,
        disableBreaks: disableBreaks,
        disableNewTab: disableNewTab,
        redirectEnabled: redirectBox,
        redirectURL: redirectURL.trim(),
      });

      if (exclusiveMode) {
        chrome.storage.sync.set({ timerStarted: true });
        stopTimerBG();
      }
      scroll(0, 0);
      document.getElementById(
        "alert-container"
      ).innerHTML = `<div id="save-success" class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>Successfully Saved</strong>
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
    } else {
      scroll(0, 0);
      if (document.getElementById("timer").value.trim() === "") {
        document.getElementById("timer").style.borderColor = "#b8304f";
      }

      if (document.getElementById("regular-break-length").value.trim() === "") {
        document.getElementById("regular-break-length").style.borderColor =
          "#b8304f";
      }

      if (document.getElementById("long-break-length").value.trim() === "") {
        document.getElementById("long-break-length").style.borderColor =
          "#b8304f";
      }

      if (document.getElementById("long-break-freq").value.trim() === "") {
        document.getElementById("long-break-freq").style.borderColor =
          "#b8304f";
      }
      document.getElementById(
        "alert-container"
      ).innerHTML = `<div id="missing-info" class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Missing Info:</strong> Please fill out all the highlighted boxes.
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
      attachInputBorderListener();
    }
  });

function stopTimerBG() {
  chrome.runtime.sendMessage({
    action: "toggleTimer",
  });
}


