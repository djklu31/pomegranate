let breakLength = document.getElementById("break-length");

chrome.storage.sync.get(["breakLength"], function(result) {
  breakLength.value = result.breakLength;
});

chrome.storage.sync.get(["timerLength"], function(result) {
  if (result.timerLength === undefined) {
    document.getElementById("timer").value = 30;
  } else {
    document.getElementById("timer").value = result.timerLength;
  }
});

document
  .getElementById("save-settings-btn")
  .addEventListener("click", function() {
    let timerLength = document.getElementById("timer").value;
    let breakLength = document.getElementById("break-length").value;

    if (timerLength !== "" && breakLength !== "") {
      chrome.storage.sync.set({
        breakLength: document.getElementById("break-length").value
      });
      chrome.storage.sync.set({
        timerLength: document.getElementById("timer").value
      });
    } else {
      alert("Please fill out all values");
    }
  });
