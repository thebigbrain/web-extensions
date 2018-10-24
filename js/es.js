let ES_HOST = 'http://192.168.1.7:9200';

let unHandledCounter = 0;
let esRequestQueue = [];
let esRequestCache = new Map();

function logError(err) {
  console.error(err);
}

function getDtFromHost(h) {
  let dt = h.replace(/^http[s]?:\/\//, '').split('/')[0].split('?')[0].split('.');
  return dt.reverse().join('.');
}

function getHash(msg) {
  let hash = md5.create();
  hash.update(msg);
  return hash.hex();
}

async function esPing() {
  try {
    let resp = await fetch(ES_HOST, {
        method: 'HEAD'
    });
    return resp;
  } catch(err) {
    ES_HOST = 'http://192.168.42.130:9200';
    let resp = await fetch(ES_HOST, {
        method: 'HEAD'
    });
    return resp;
  }
}

function esPut(url, data) {
  request = new Request(ES_HOST + url);
  return fetch(request, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

function esPost(url, data) {
  request = new Request(ES_HOST + url);
  return fetch(request, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(data)
  });
}

function esSearch(url) {
  request = new Request(ES_HOST + url);
  return fetch(request).then(resp => resp.json());
}

// init here
esPing().then(resp => {
  if (resp.status == 200) {
    async function doHandle() {
      let url = esRequestQueue.shift();
      let details = esRequestCache.get(url);
      try {
        let resp = await fetch(url);
        let dt = getDtFromHost(details.initiator);
        let id = getHash(url);
        let contentType = resp.headers.get('content-type');
        let content = await resp.text();
        let contentHash
        try {
          await esPut(`/${dt}/page/${id}`, {
            url,
            contentType,
            content
          });
        }catch (err) {
          logError(err);
        }
      } catch (err) {
        logError(err);
      }
    }

    let handler = async () => {
      try {
        let res = await doHandle();
        return res;
      } catch (err) {
        logError(err);
      }
    };

    let loop = (timeout = 500) => {
      window.setTimeout(async () => {
        if (unHandledCounter > 0) {
          unHandledCounter--;
          await handler();
          loop(50);
        } else {
          loop();
        }
      }, timeout);
    };

    loop(0);
  }
});