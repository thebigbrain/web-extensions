function reload() {
  let reload = true;
  chrome.runtime.sendMessage({reload});
}
alert('test');
function changeES_HOST(event) {
  // chrome.runtime.sendMessage({event});
  // chrome.storage.local.set({es_host: null});
  let content = document.getElementById('content');
  content.innerText = event.value;
}
