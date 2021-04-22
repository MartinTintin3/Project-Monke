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
let timeout = 0;
let delay = 500;

chrome.runtime.onConnect.addListener(port => {
	console.assert(port.name == "hack");
	port.onMessage.addListener(msg => {
		if(msg.type == "letters") {
			clearTimeout(timeout);
			chrome.storage.sync.get("target", data => {
				if(data != 0) {
					let index = 0;
					const sendKey = () => {
						timeout = setTimeout(() => {
							if(index == msg.letters.length) return clearTimeout(timeout);
							console.log(msg.letters[index]);
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
							sendKey();
						}, delay);
					}

					sendKey();
				}
			});
		} else if(msg.type == "stop") {
			clearTimeout(timeout);
		} else if(msg.type == "interval") {
			delay = msg.value;
		}
	});
  });