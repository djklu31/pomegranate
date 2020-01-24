let addURLBtn = document.getElementById("add-url-btn");
// addressBox.addEventListener("keyup", function(e) {
// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//   chrome.tabs.sendMessage(tabs[0].id, { greeting: addressBox.value });
// });
// });
window.onload = function() {
  chrome.storage.sync.get(["addresses"], function(result) {
    let addresses = JSON.parse(result.addresses);
    for (address of addresses) {
      let li = document.createElement("li");
      let ul = document.getElementById("addresses-list");
      li.innerHTML = address;
      ul.appendChild(li);
    }
  });
};

// getStorageBtn.addEventListener("click", function() {
//   chrome.storage.sync.get(["addresses"], function(result) {
//     console.log(`Got addresses from storage: ${result.addresses}`);
//   });
// });

addURLBtn.addEventListener("click", function() {
  let addressBox = document.getElementById("address-box");

  chrome.runtime.sendMessage(
    {
      msg: addressBox.value
    },
    function(response) {
      if (response.msg === "success adding url") {
        let addressBox = document.getElementById("address-box");
        let li = document.createElement("li");
        let ul = document.getElementById("addresses-list");
        li.innerHTML = addressBox.value;
        ul.appendChild(li);
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
