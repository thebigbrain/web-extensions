function listener(details) {
    console.log(details)
    let filter = chrome.webRequest.filterResponseData(details.requestId);
    let decoder = new TextDecoder("utf-8");
    let encoder = new TextEncoder();

    filter.ondata = event => {
        let str = decoder.decode(event.data, { stream: true });
        // Just change any instance of Example in the HTTP response
        // to WebExtension Example.
        console.log(str)
        str = str.replace(/Web-ext/g, 'WebExtension Example');
        filter.write(encoder.encode(str));
        filter.disconnect();
    }

    return {};
}

chrome.webRequest.onBeforeRequest.addListener(
    listener,
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);