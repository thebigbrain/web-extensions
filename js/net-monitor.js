const regexp_allowed_hosts = [
  /\.mozilla\.org/,
  /\.eastmoney\.com/
];

function isUrlAllowed(url = '') {
  for (let reg in regexp_allowed_hosts) {
    if (url.search(reg) !== -1) {
      return true;
    }
  }
  return false;
}

function beforeRequestListener(details) {
  let url = details.url;
  if (details.method == 'GET') {
    if (esRequestCache.get(url) || !/^http/.test(url) || !isUrlAllowed(url)) {
        return;
    }
    console.log(url, details);
    esRequestCache.set(url, details);
    esRequestQueue.push(url);
    unHandledCounter++;
  }
}

chrome.webRequest.onBeforeRequest.addListener(
  beforeRequestListener,
  {
    urls: [
        "<all_urls>"
    ],
    types: [
        "main_frame",
        "sub_frame",
        "xmlhttprequest",
        "script",
        "other"
    ]
  }, [
    'requestBody'
  ]
);