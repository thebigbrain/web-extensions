let ES_HOST = 'http://192.168.1.7:9200';

let unHandledCounter = 0;
let esRequestQueue = [];
let esRequestCache = new Map();

function getDtFromHost(h) {
  let dt = h.replace(/^http[s]?:\/\//, '').replace('/', '').split('.');
  return dt.reverse().join('.');
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
    body: JSON.stringify(data)
  });
}

function esPost(url, data) {
  url = ES_HOST + url;
  return fetch(url, {
    method: 'POST',
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
      fetch(url).then(resp => {
        let dt = getDtFromHost(details.initiator)
        esPost(`/website/${dt}/`, {
          url,
          content: resp.text()
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
    }

    loop(0);
  }
})