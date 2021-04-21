chrome.storage.sync.set({
	"target": 0,
});

chrome.tabs.onHighlighted.addListener((tabId, windowId) => {
	chrome.tabs.query({
		url: "https://monkeytype.com/"
	}, tabs => {
		const tab = tabs.find(t => t.id == tabId.tabIds[0]);
		if(tab) {
			const onDebuggerEnabled = (debuggeeId) => {
				debuggerEnabled = true
			}
			  
			const onAttach = (debuggeeId) => {
				chrome.debugger.sendCommand(debuggeeId, "Debugger.enable", {}, onDebuggerEnabled.bind(null, debuggeeId));
				console.log("attached");
				chrome.storage.sync.set({
					"target": tab.id,
				});
			}

			let tabId = tab.id;
			let debuggeeId = { tabId };

			chrome.debugger.attach(debuggeeId, "1.3", onAttach.bind(null, debuggeeId));
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

chrome.runtime.onConnect.addListener(port => {
	console.assert(port.name == "hack");
	port.onMessage.addListener(msg => {
		console.log(msg);
		chrome.storage.sync.get("target", data => {
			console.log(data);
			if(data != 0) {
				let index = 0;
				const interval = setInterval(() => {
					if(index == msg.letters.length) return clearInterval(interval);
					chrome.debugger.sendCommand({
						tabId: data.target
					}, "Input.dispatchKeyEvent", {
						type: "keyDown",
						text: msg.letters[index],
						key: msg.letters[index],
						code: `Key${msg.letters[index].toUpperCase()}`,
						modifiers: 0
					}, e => {
						if(chrome.runtime.lastError) console.log(chrome.runtime.lastError);
					});
					index++;
				}, 100);
			}
		});
	});
  });