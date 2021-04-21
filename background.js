chrome.storage.sync.set({
	"target": 0,
});

const attach_and_detach = (tabId) => {
	chrome.tabs.query({
		url: "https://monkeytype.com/"
	}, tabs => {
		const tab = tabs.find(t => t.id == tabId.tabIds[0]);
		if(tab) {
			console.log(tab);
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
}

chrome.tabs.onCreated.addListener(() => console.log("created"));
chrome.webNavigation.onCompleted.addListener(({ tabId }) => attach_and_detach(tabId))
chrome.tabs.onHighlighted.addListener((tabId, windowId) => attach_and_detach(tabId));
let interval = 0;

chrome.runtime.onConnect.addListener(port => {
	console.assert(port.name == "hack");
	port.onMessage.addListener(msg => {
		console.log(msg);
		chrome.storage.sync.get("target", data => {
			if(data != 0) {
				if(interval != 0) clearInterval(interval);
				let index = 0;
				interval = setInterval(() => {
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
						if(chrome.runtime.lastError.startsWith("Debugger is not attached to the tab")) clearInterval(interval);
					});
					index++;
				}, 50);
			}
		});
	});

	port.onDisconnect.addListener(() => {
		clearInterval(interval);
	})
  });