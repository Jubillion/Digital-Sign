/*********************************************************
        This file is meant to be run using the Bun
        JavaScript runtime environment. It is used
        to serve the files for the digital sign.
*********************************************************/

const ROUTES = {
	"/": "./edit/edit.html",
	"/script.js": "./index/index.js",
	"/style.css": "./index/index.css",
	"/view/": "./index/index.html",
	"/edit.js": "./edit/edit.js",
	"/edit.css": "./edit/edit.css",
	"/db.json": "./db.json",
};

Bun.serve({
	port: 8080,
	async fetch(req) {
		let path = new URL(req.url).pathname;
		if (ROUTES[path]) return new Response(Bun.file(ROUTES[path]));
		if (!path.endsWith("/") && ROUTES[path + "/"])
			return Response.redirect(path + "/");

		if (path.startsWith("/add/")) {
			return addToDB(
				path.slice(5),
				await req.arrayBuffer(),
				req.headers.get("content-type")
			);
		} else if (path.startsWith("/rem/")) {
			return removeFromDB(path.slice(5));
		} else if (path.startsWith("/images/flyers/")) {
			const n = parseInt(path.slice(15));
			let db = await Bun.file("./db.json").json();
			if (db.flyers[n])
				return new Response(await Bun.file(`./images/flyers/${db.flyers[n]}`).arrayBuffer(), {
					headers: {
						"Content-Type": `image/${db.flyers[n].split('.').pop()}`,
						"Cache-Control": "no-cache",
					},
				});
		}

		return new Response("Not Found", { status: 404 });
	},
});

const IMAGE_ERROR = new TypeError("Invalid image type.");

async function addToDB(path, img, imgType) {
	let db = await Bun.file("./db.json").json();
	const params = path.split("/");
	switch (params[0]) {
		case "calendar":
			if (Array.isArray(db.calendar[params[1]]))
				db.calendar[params[1]].push(decodeURIComponent(params[2]));
			// sort chronologically later
			break;
		case "flyers":
			try {
				db.flyers.push(await newImage(img, imgType));
			} catch (e) {
				if (e === IMAGE_ERROR) return new Response("Invalid image type.", { status: 400 });
				throw e;
			}
			break;
		case "announcements":
			db.news.push(decodeURIComponent(params[1]));
			break;
		default:
			return new Response("Not Found", { status: 404 });
	}
	await Bun.write("./db.json", JSON.stringify(db, null, 4));
	return new Response("Wrote to DB.");
}

async function newImage(img, type) {
	const UUID = Bun.randomUUIDv7("base64url");
	let fileName = "";
	if (["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(type)) {
		fileName = `${UUID}.${type.split("/")[1]}`;
		Bun.write(`./images/flyers/${fileName}`, img);
	} else throw IMAGE_ERROR;
	return fileName;
}

async function removeFromDB(path) {
	let db = await Bun.file("./db.json").json();
	const params = path.split("/");
	switch (params[0]) {
		case "calendar":
			if (Array.isArray(db.calendar[params[1]]))
				db.calendar[params[1]].splice(parseInt(params[2]), 1);
			break;
		case "flyers":
			if (db.flyers[parseInt(params[1])]) {
				await Bun.file(`./images/flyers/${db.flyers[parseInt(params[1])]}`).delete();
				db.flyers.splice(parseInt(params[1]), 1);
			}
			break;
		case "announcements":
			db.news.splice(parseInt(params[1]), 1);
			break;
		default:
			return new Response("Not Found", { status: 404 });
	}
	await Bun.write("./db.json", JSON.stringify(db, null, 4));
	return new Response("Wrote to DB.");
}
