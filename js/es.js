let ES_HOST = 'http://192.168.1.7:9200';

let unHandledCounter = 0;
let esRequestQueue = [];
let esRequestCache = new Map();

function getDtFromHost(h) {
  let dt = h.replace(/^http[s]?:\/\//, '').split('/')[0].split('?')[0].split('.');
  return dt.reverse().join('.');
}

function getHash(msg) {
  let hash = md5.create();
  hash.update(msg);
  return hash.hex();
}

function esPing() {
  return fetch(ES_HOST, {
    method: 'HEAD'
  }).then(resp => {
    console.log(`esping ${resp.statusText}`);
    return resp.status == 200;
  }).catch(err => {
    console.error(err);
  });
}

function esPut(url, data) {
  url = ES_HOST + url;
  return fetch(url, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

function esPost(url, data) {
  url = ES_HOST + url;
  return fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

function esSearch(url) {
  url = ES_HOST + url;
  return fetch(url).then(resp => resp.json());
}

// init here
esPing().then(ok => {
  if (ok) {
    let doHandle = (resolve, reject) => {
      let url = esRequestQueue.shift();
      let details = esRequestCache.get(url);
      fetch(url).then(async resp => {
        let dt = getDtFromHost(details.initiator || url);
        let id = getHash(url);
        let contentType = resp.headers.get('content-type');
        let content = await resp.text();
        esPut(`/${dt}/page/${id}`, {
            url,
            contentType,
            content
        }).catch(reject).then(resolve);
      });
    };

    let handler = () => {
      return new Promise((resolve, reject) => {
        unHandledCounter--;
        doHandle(resolve, reject);
      });
    };

    let loop = (timeout = 500) => {
      window.setTimeout(() => {
        if (unHandledCounter > 0) {
          handler().then(() => {
            loop(50);
          });
        } else {
          loop();
        }
      }, timeout);
    };

    loop(0);
  }
});