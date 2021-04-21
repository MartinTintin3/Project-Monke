const testOption = document.getElementById("test-checkbox");
const checkButton = document.getElementById("check-button");

testOption.addEventListener('change', () => {
	if(chrome.runtime.error) return;
	chrome.storage.sync.set({"data": testOption.checked});
});

checkButton.addEventListener('click', () => {
	chrome.storage.sync.get("data", data => {
		console.log(data);
	});
});