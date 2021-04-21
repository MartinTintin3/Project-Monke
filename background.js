chrome.storage.sync.set({
	"target": 0,
});

chrome.tabs.onHighlighted.addListener((tabId, windowId) => {
	chrome.tabs.query({
		url: "https://monkeytype.com/"
	}, tabs => {
		const tab = tabs.find(t => t.id == tabId.tabIds[0]);
		if(tab) {
			chrome.debugger.attach({
				tabId: tab.id
			}, "1.3", () => {
				if(chrome.runtime.lastError) console.log(chrome.runtime.lastError);
				console.log("attached");
				chrome.storage.sync.set({
					"target": tab.id,
				});
			});
		} else {
			if(chrome.storage.sync.get("target", data => {
				if(data != 0) {
					chrome.debugger.detach({
						tabId: data.target
					}, () => {
						if(chrome.runtime.lastError) console.log(chrome.runtime.lastError);
						console.log("detached");
					});
				}
			}));
		}
	});
});