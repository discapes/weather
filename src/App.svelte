<script>
	import autoComplete from "@tarekraafat/autocomplete.js";
	import { onMount } from "svelte";
	import { addCss } from "./util.js";
	import { cities } from "./data.js";
	
	let ac;
	let city = '';
	let selected = false;
	
	onMount(() => {
	ac = new autoComplete({
    placeHolder: "Search for cities...",
    data: {
        src: Object.keys(cities),
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
								}
            },
        },
		   resultsList: {
            element: (list, data) => {
                if (!data.results.length) {
                    const message = document.createElement("div");
                    message.setAttribute("style", "		padding: 5px;");
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
	
	let data = '';
	async function showData() {
		let [lat, long] = cities[city].coordinates.split(" ");
		let [degLat, restLat] = lat.split("°");
		let [minLat, dirLat] = restLat.split("'");
		let [degLong, restLong] = long.split("°");
		let [minLong, dirLong] = restLong.split("'");
		let latDec = (+degLat + (+minLat)/60) * (dirLat === 'N' ? 1 : -1);
		let longDec = (+degLong + (+minLong)/60) * (dirLong === 'E' ? 1 : -1);
		let coordstring = `latitude=${latDec.toFixed(4)}&longitude=${longDec.toFixed(4)}`;
		let url = `https://api.open-meteo.com/v1/forecast?${coordstring}&current_weather=true`;
		console.log(url);
		let res = await fetch(url).then(res => res.json());
		data = JSON.stringify(res, null, 2);
	}
</script>

<div>
<h2>Select a city: <span class:green={selected}>{city}</span></h2>
<input id="autoComplete" placeholder="Enter city" bind:value={city} on:keydown={kd}>
<div>
	<br>
	<br>
	<br>
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