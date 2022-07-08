<script>
	import autoComplete from "@tarekraafat/autocomplete.js";
	import { onMount } from "svelte";
	import { addCss } from "./util";
	import { cities } from "./cities";
	import { citynames } from "./citynames";

	let ac;
	let city = "";
	let selected = false;

	onMount(() => {
		ac = new autoComplete({
			placeHolder: "Search for cities...",
			data: {
				src: citynames,
				cache: true,
			},
			resultItem: {
				highlight: true,
			},
			events: {
				input: {
					selection: (event) => {
						selected = true;
						city = event.detail.selection.value;
						showData();
					},
				},
			},
			resultsList: {
				element: (list, data) => {
					if (!data.results.length) {
						const message = document.createElement("div");
						message.setAttribute("style", "padding: 5px;");
						message.innerHTML = `Found No Results for "${data.query}"`;
						list.prepend(message);
					}
				},
				noResults: true,
			},
			diacritics: true,
			submit: true,
			threshold: 3,
		});
	});
	addCss("https://cdn.jsdelivr.net/npm/@tarekraafat/autocomplete.js@10.2.7/dist/css/autoComplete.min.css");

	function kd(e) {
		selected = false;
		if (e.key === "Tab") {
			e.preventDefault();
			ac.select();
		}
	}

	let data = "";
	async function showData() {
		const { country, latitude, longitude, timezone } = cities[city];
		const query = queryString({ latitude, longitude, timezone, current_weather: true, daily: ["sunrise", "sunset"] });
		const url = `https://api.open-meteo.com/v1/forecast?${query}`;
		console.log(`"${url}"`);
		const res = await fetch(url).then((res) => res.json());
		data = JSON.stringify({ country, ...res }, null, 2);
	}
	function queryString(options) {
		/* Encoding with URLSearchParams doesn't work with API */
		let str = "";
		for (const [k, v] of Object.entries(options)) {
			str += `${k}=${v}&`;
		}
		return str;
	}
</script>

<div>
	<h2>Select a city: <span class:green={selected}>{city}</span></h2>
	<input id="autoComplete" placeholder="Enter city" bind:value={city} on:keydown={kd} />
	<div>
		<br />
		<br />
		<br />
		<pre>
{data}
	</pre>
	</div>
</div>

<style>
	.green {
		color: green;
	}
</style>
