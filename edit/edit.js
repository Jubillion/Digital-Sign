let options = ["nullOption", "calendar", "flyers", "announcements"];

function select(num) {
	for (let option of options)
		document.getElementById(option).style.display =
			options[num] === option ? "block" : "none";
}

async function updateFromDB() {
	let db = await (await fetch("/db.json")).json(),
		a = null,
		li = null,
		dayElement = null;
	const announcements = document.getElementById("announcements-items"),
		flyers = document.getElementById("flyers-items");
	announcements.innerHTML = "";
	flyers.innerHTML = "";
	for (let i = 0; i < db.news.length; i++) {
		a = document.createElement("a");
		a.onclick = () => {
			removeAnnouncement(i);
		};
		li = document.createElement("li");
		li.innerText = db.news[i];
		a.appendChild(li);
		announcements.appendChild(a);
	}
	for (let day in db.calendar) {
		dayElement = document.getElementById(day.toLowerCase());
		dayElement.innerHTML = "";

		dayElement.hidden = db.calendar[day].length === 0;
		document.getElementById("h-" + day.toLowerCase()).hidden =
			dayElement.hidden;

		for (let i = 0; i < db.calendar[day].length; i++) {
			a = document.createElement("a");
			a.onclick = () => {
				removeCalendarEvent(day, i);
			};
			li = document.createElement("li");
			li.innerText = db.calendar[day][i];
			a.appendChild(li);
			dayElement.appendChild(a);
		}
	}
	for (let i = 0; i < db.flyers.length; i++) {
		let a = document.createElement("a"),
			li = document.createElement("li"),
			img = document.createElement("img");
		a.onclick = async () => {
			await fetch(`/rem/flyers/${i}`);
			updateFromDB();
		};
		img.src = `/images/flyers/${i}`;
		img.style.width = "100%";
		a.appendChild(li);
		li.appendChild(img);
		li.className = "flyer-item";
		flyers.appendChild(a);
	}
}

async function newAnnouncement() {
	const text = document.getElementById("announce-text").value;
	document.getElementById("announce-text").value = "";
	if (text) await fetch("/add/announcements/" + encodeURIComponent(text));
	updateFromDB();
}

async function newFlyer() {
	const fileInput = document.getElementById("flyer-file");
	if (fileInput.files.length === 0) return;
	const file = fileInput.files[0];
	await fetch("/add/flyers/", {
		method: "POST",
		body: await file.arrayBuffer(),
		headers: {
			"Content-Type": file.type,
		},
	});
	fileInput.value = "";
	updateFromDB();
}

async function removeAnnouncement(index) {
	await fetch("/rem/announcements/" + index.toString());
	updateFromDB();
}

async function newCalendarEvent() {
    const day = document.getElementById("event-day").value,
        text = document.getElementById("event-text").value;
    let time = document.getElementById("event-time").value;
    time = time.split(":");
    time[0] = parseInt(time[0]);
    if (time[0] >= 12) {
        time[0] -= 12;
        time[1] += "PM";
    } else {
        time[1] += "AM";
    }
    if (time[0] === 0) time[0] = 12;
    const fullText = `${time.join(":")}—${text}`;
    document.getElementById("event-text").value = "";
    document.getElementById("event-time").value = "08:00";
    document.getElementById("event-day").value = "Sunday";
    if (text) await fetch("/add/calendar/" + day + "/" + encodeURIComponent(fullText));
    updateFromDB();
}

async function removeCalendarEvent(day, index) {
    await fetch(`/rem/calendar/${day}/${index.toString()}`);
    updateFromDB();
}
