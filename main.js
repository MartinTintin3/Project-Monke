window.onload = () => {
	setTimeout(() => {
		let letters = Array.from(document.getElementById("words").children).map(word => Array.from(word.children).map(l => l.innerText)).map(w => w.join("")).join(" ").split("");
		const restartButton = document.getElementById("restartTestButton");
		console.log(letters[0]);
	
		var port = chrome.runtime.connect({name: "hack"});
		port.postMessage({
			letters
		});
		port.onMessage.addListener(msg => {
			console.log(msg);
		});

		restartButton.addEventListener("click", () => {
			port.disconnect();
			setTimeout(() => {
				letters = Array.from(document.getElementById("words").children).map(word => Array.from(word.children).map(l => l.innerText)).map(w => w.join("")).join(" ").split("");
				port.postMessage({
					letters
				});
			}, 1000);
		});
		/* chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			chrome.debugger.sendCommand({
				tabId: sender.tab.id
			}, "Input.dispatchKeyEvent", {
				type: "keyDown",
				text: letters[0],
				unmodifiedText: letters[0],
			});
		}); */
	}, 1000);
}