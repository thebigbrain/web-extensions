chrome.webRequest.onCompleted.addListener(
    function(details) {
        let url = details.url;
        if (details.method == 'GET') {
            if(esRequestCache.get(url) || !/^http/.test(url)) {
                return;
            }
            esRequestCache.set(url, details);
            esRequestQueue.push(url);
            unHandledCounter++;
        }
    },
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
    }
);