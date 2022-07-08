<script>
  import autoComplete from "@tarekraafat/autocomplete.js";
  import { onMount } from "svelte";
  import { addCss } from "./util";
  import { cities } from "./cities";
  import { citynames } from "./citynames";

  let ac;
  let cityName = "";
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
            cityName = event.detail.selection.value;
            showData();
          },
        },
      },
      resultsList: {
        element: (list, data) => {
          if (data.results.length === 1) {
            ac.goTo(0);
          } else if (!data.results.length) {
            const message = document.createElement("div");
            message.setAttribute("class", "p-2");
            message.innerHTML = `Found No Results for "${data.query}"`;
            list.prepend(message);
          }
        },
        maxResults: Infinity,
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
    let city = cityName.slice(0, cityName.indexOf(" (")); // without cc
    const { country, latitude, longitude, timezone } = cities[city];
    const query = queryString({ latitude, longitude, timezone, current_weather: true, daily: ["sunrise", "sunset"] });
    const url = `https://api.open-meteo.com/v1/forecast?${query}`;
    const res = await fetch(url).then((res) => res.json());
    const options = {
      timeZone: data.timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    const formatter = new Intl.DateTimeFormat([], options);
    data = { country, localtime: formatter.format(new Date()), ...res };
  }
  function queryString(options) {
    /* Encoding with URLSearchParams doesn't work with API */
    let str = "";
    for (const [k, v] of Object.entries(options)) {
      str += `${k}=${v}&`;
    }
    return str;
  }
  function degreesToDirection(deg) {
    if (deg <= 11.25) return "north";
    else if (deg <= 33.75) return "north-northeast";
    else if (deg <= 56.25) return "northeast";
    else if (deg <= 78.75) return "east-northeast";
    else if (deg <= 101.25) return "east";
    else if (deg <= 123.75) return "east-southeast";
    else if (deg <= 146.25) return "southeast";
    else if (deg <= 168.25) return "south-southeast";
    else if (deg <= 191.25) return "south";
    else if (deg <= 213.75) return "south-southwest";
    else if (deg <= 236.25) return "southwest";
    else if (deg <= 258.75) return "west-southwest";
    else if (deg <= 281.25) return "west";
    else if (deg <= 303.75) return "west-northwest";
    else if (deg <= 326.25) return "northwest";
    else if (deg <= 348.75) return "north-northwest";
    else if (deg <= 360) return "north";
    else return "error";
  }
  function weatherCodeToString(ww) {
    switch (ww) {
      case 0:
        return "Clear sky";
      case 1:
      case 2:
      case 3:
        return "Mainly clear, partly cloudy, and overcast";
      case 45:
      case 48:
        return "Fog and depositing rime fog";
      case 51:
      case 53:
      case 55:
        return "Drizzle: Light, moderate, and dense intensity";
      case 56:
      case 57:
        return "Freezing Drizzle: Light and dense intensity";
      case 61:
      case 63:
      case 65:
        return "Rain: Slight, moderate and heavy intensity";
      case 66:
      case 67:
        return "Freezing Rain: Light and heavy intensity";
      case 71:
      case 73:
      case 75:
        return "Snow fall: Slight, moderate, and heavy intensity";
      case 77:
        return "Snow grains";
      case 80:
      case 81:
      case 82:
        return "Rain showers: Slight, moderate, and violent";
      case 85:
      case 86:
        return "Snow showers slight and heavy";
      case 95:
        return "Thunderstorm: Slight or moderate";
      case 96:
      case 99:
        return "Thunderstorm with slight and heavy hail";
    }
  }
</script>

<div class="p-10 bg-gradient-to-r from-purple-100 to-pink-100 h-full flex flex-col items-center">
  <h2>Select a city: <span class:green={selected}>{cityName}</span></h2>
  <input id="autoComplete" placeholder="Enter city" bind:value={cityName} on:keydown={kd} />
  {#if data}
    <div>
      <h4 class="m-px mt-3">Country: {data.country}</h4>
      <h4 class="m-px">Latitude: {data.latitude}</h4>
      <h4 class="m-px mb-3">Longitude: {data.longitude}</h4>
      <h4 class="m-px mb-3">Local time: {data.localtime}</h4>
      <h3 class="w-full m-px text-center">Current weather</h3>
      <h4 class="m-px text-center mb-3">{weatherCodeToString(data.current_weather.weathercode)}</h4>
      <h4 class="m-px">Temperature: {data.current_weather.temperature}°C</h4>
      <h4 class="m-px">Wind speed: {data.current_weather.windspeed} km/h</h4>
      <h4 class="m-px">Wind direction: {degreesToDirection(data.current_weather.winddirection)}</h4>
      <pre>
{JSON.stringify(data, null, 2)}
	</pre>
    </div>
  {/if}
</div>

<style global lang="postcss">
  @tailwind base;
  @tailwind utilities;

  body {
    overflow: visible;
    color: #333;
    margin: 0;
    height: 100vh;
    box-sizing: border-box;
    font-family: "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  }

  h1 {
    display: block;
    font-weight: bold;
    font-size: 2em;
    margin-block-start: 0.67em;
    margin-block-end: 0.67em;
  }

  h2 {
    display: block;
    font-weight: bold;
    font-size: 1.5em;
    margin-block-start: 0.83em;
    margin-block-end: 0.83em;
  }

  h3 {
    display: block;
    font-weight: bold;
    font-size: 1.17em;
    /* margin-block-start: 1em; */
    /* margin-block-end: 1em; */
  }
  h4 {
    display: block;
    font-weight: bold;
    font-size: 1em;
    margin-block-start: 1.33em;
    margin-block-end: 1.33em;
  }
  h5 {
    display: block;
    font-weight: bold;
    font-size: 0.83em;
    margin-block-start: 1.67em;
    margin-block-end: 1.67em;
  }

  h6 {
    display: block;
    font-weight: bold;
    font-size: 0.67em;
    margin-block-start: 2.33em;
    margin-block-end: 2.33em;
  }

  .green {
    color: green;
  }
</style>
