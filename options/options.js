let form = document.querySelector('form');
form.onsubmit = function (event) {
  event.preventDefault();
  let input = document.getElementById('url');
  let es_host = input.value;
  chrome.storage.local.set({es_host});
};
