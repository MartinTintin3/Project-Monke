const intervalRange = document.getElementById("interval-range");
chrome.storage.sync.get("interval", data => {
	intervalRange.value = parseInt(data.interval);
	document.getElementById("interval-value").innerText =  parseInt(data.interval);
});


intervalRange.addEventListener('input', () => {
	document.getElementById("interval-value").innerText = intervalRange.value;
	chrome.storage.sync.set({
		"interval": parseInt(intervalRange.value),
	});
	const port = chrome.runtime.connect({name: "hack"});
	port.postMessage({
		type: "interval",
		value: parseInt(intervalRange.value)
	})
});