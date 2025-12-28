async function updateView() {
	let db = await fetch("/db.json").then((res) => res.json());
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	// Update calendar
	for (let i = 0; i < 7; i++) {
		let dayItems = document.querySelectorAll(".day-items")[i];
		dayItems.innerHTML = "";
		for (let item of db.calendar[days[i]]) {
			let li = document.createElement("li");
			li.innerText = item;
			dayItems.appendChild(li);
		}

		document.querySelectorAll(".cal-item")[i].hidden =
			db.calendar[days[i]].length === 0;
	}
}

updateView();
setInterval(updateView, 5e3);

let currentNewsItem = -1;
async function updateNews() {
    let db = await fetch("/db.json").then((res) => res.json()),
        newsText = document.getElementById("news-text");
    if (db.news.length === 0) newsText.innerText = "";
    else {
        currentNewsItem = (currentNewsItem + 1) % db.news.length;
        newsText.innerText = db.news[currentNewsItem];
    }
}

updateNews();
setInterval(updateNews, 20e3);

let currentFlyer = -1;
async function updateFlyers() {
	let db = await fetch("/db.json").then((res) => res.json()),
		flyer = document.getElementById("flyer-image");
	flyer.hidden = db.flyers.length === 0;
	if (db.flyers.length !== 0) {
		currentFlyer = (currentFlyer + 1) % db.flyers.length;
		flyer.src = `/images/flyers/${currentFlyer}`;
	}
}

updateFlyers();
setInterval(updateFlyers, 15e3);