import { liveQuery } from "dexie";
import db from "$lib/db";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { browser } from "$app/environment";

let pdfjs;
if (browser) {
	pdfjs = await import("pdfjs-dist");
	pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
}

let firstTime = true;
let dbResult = liveQuery(async () => {
	const result = await db.books.toArray();
	if (firstTime) {
		if (result[0]) bookState.currentBook = result[0];
		firstTime = false;
	}
	return result;
});

let bookState = $state({ currentBook: null });
dbResult.subscribe((arr) => {
	if (arr[0]) bookState.currentBook = arr[0];
});

export function getCurrentBook() {
	return bookState;
}

function canvasToThumbnailBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(blob);
			},
			"image/webp",
			0.7,
		);
	});
}

async function renderPdfThumbnail(pdf) {
	const page = await pdf.getPage(1);

	let viewport = page.getViewport({ scale: 1 });

	const TARGET_WIDTH = 300;
	const scale = TARGET_WIDTH / viewport.width;

	viewport = page.getViewport({ scale });

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	canvas.width = viewport.width;
	canvas.height = viewport.height;

	await page.render({ canvasContext: ctx, viewport }).promise;

	const blob = await canvasToThumbnailBlob(canvas);

	return blob;
}

export function getCurrentPage() {
	return bookState?.currentBook?.currentPage;
}

export async function setCurrentPage(currentPage) {
	const res = await db.books.update("learning", { currentPage });
}

export async function setCurrentBook(file) {
	const pdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
	const outline = await pdf.getOutline();

	const toc = [];
	if (outline) {
		let res;
		async function walk(input, output) {
			for (let i = 0; i < input.length; i++) {
				const title = input[i].title;
				const dest = Array.isArray(input[i].dest) ? input[i].dest : await pdf.getDestination(input[i].dest);
				const ref = dest[0];
				const page = (await pdf.getPageIndex(ref)) + 1;
				output.push({ title, page, sub: [] });
				if (input[i].items.length !== 0) {
					await walk(input[i].items, output[output.length - 1].sub);
				}
			}
		}
		await walk(outline, toc);
		console.log(toc);
	}

	const metadata = (await pdf.getMetadata()).info;
	const test = (await pdf.getMetadata()).metadata;
	const thumbBlob = await renderPdfThumbnail(pdf);
	let res = await db.books.put({
		name: "learning",
		file,
		title: metadata.Title || null,
		author: metadata.Author || null,
		description: metadata.Subject || null,
		toc,
		thumbBlob,
	});
}
