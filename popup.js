let addURLBtn = document.getElementById("add-url-btn");
let parentList = document.getElementById("addresses-list");
let blockSitesBtn = document.getElementById("block-sites-btn");
// addressBox.addEventListener("keyup", function(e) {
// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { greeting: addressBox.value });
// });
// });
window.onload = function() {
  chrome.storage.sync.get(["addresses"], function(result) {
    let addresses = JSON.parse(result.addresses);
    for (address of addresses) {
      addToList(address);
    }
  });

  chrome.storage.sync.get(["timerStarted"], function(result) {
    if (result.timerStarted) {
      //get from background script
      chrome.runtime.sendMessage({ action: "getTimeLeft" }, function(response) {
        console.log(response.msg);
      });

      document.getElementById("block-sites-btn").innerText = "Stop Timer";
    } else {
      document.getElementById("block-sites-btn").innerText = "Start Timer";
    }
  });

  // chrome.runtime.sendMessage({ action: "getTimeLeft" }, function(response) {
  //   if (response.msg === "success deleting url") {
  //     var list = document.getElementsByTagName("li");
  //     for (item of list) {
  //       if (item.innerText === event.target.parentNode.innerText) {
  //         item.parentNode.removeChild(item);
  //       }
  //     }
  //   } else if (response.msg === "error deleting url") {
  //     console.log("ERROR deleting URL (handle somehow)");
  //   }
  // });
};
// getStorageBtn.addEventListener("click", function() {
//   chrome.storage.sync.get(["addresses"], function(result) {
//     console.log(`Got addresses from storage: ${result.addresses}`);
//   });
// });
//Event Listeners
parentList.addEventListener("click", function(event) {
  console.log(event);
  if (event.target.tagName === "BUTTON") {
    chrome.runtime.sendMessage(
      { msg: event.target.parentNode.innerText.trim(), action: "deleteURL" },
      function(response) {
        if (response.msg === "success deleting url") {
          var list = document.getElementsByTagName("li");
          for (item of list) {
            if (item.innerText === event.target.parentNode.innerText) {
              item.parentNode.removeChild(item);
            }
          }
        } else if (response.msg === "error deleting url") {
          console.log("ERROR deleting URL (handle somehow)");
        }
      }
    );
  }
});

addURLBtn.addEventListener("click", function() {
  let addressBox = document.getElementById("address-box");

  chrome.runtime.sendMessage(
    {
      msg: addressBox.value,
      action: "addURL"
    },
    function(response) {
      if (response.msg === "success adding url") {
        let addressBox = document.getElementById("address-box");
        addToList(addressBox.value);
        addressBox.value = "";
      } else if (response.msg === "error adding url") {
        console.log("ERROR adding URL (handle somehow)");
      }
    }
  );

  // chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello" });
  // });
});

blockSitesBtn.addEventListener("click", function() {
  chrome.storage.sync.get(["timerStarted"], function(result) {
    if (result.timerStarted !== undefined) {
      chrome.storage.sync.set({ timerStarted: !result.timerStarted });
      if (!result.timerStarted) {
        document.getElementById("block-sites-btn").innerText = "Stop Timer";
      } else {
        document.getElementById("block-sites-btn").innerText = "Start Timer";
      }
    } else {
      chrome.storage.sync.set({ timerStarted: false });
    }
  });

  chrome.runtime.sendMessage(
    { action: "startTimer", msg: document.getElementById("timer").value },
    function(response) {
      console.log(typeof response.msg);
      if (response.msg === "timerExpired") {
        document.getElementById("block-sites-btn").innerText = "Start Timer";
      }
    }
  );
});

function addToList(addresses) {
  let li = document.createElement("li");
  let ul = document.getElementById("addresses-list");
  li.innerHTML = `${addresses} <button class="button">-</button>`;
  ul.appendChild(li);
}
