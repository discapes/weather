<script>
  import autoComplete from "@tarekraafat/autocomplete.js";
  import { onMount } from "svelte";
  import { addCss, formatHHMMSSDDMMYY } from "./util";
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
    let city = cityName;
    const { country, latitude, longitude, timezone } = cities[city];
    const query = queryString({
      latitude,
      longitude,
      timezone,
      hourly: ["temperature_2m", "apparent_temperature", "relativehumidity_2m", "weathercode"],
      current_weather: true,
      daily: ["sunrise", "sunset"],
    });
    const url = `https://api.open-meteo.com/v1/forecast?${query}`;
    const res = await fetch(url).then((res) => res.json());
    data = { country, localtime: convertTZ(new Date(), timezone), ...res };

    const days = [];
    let day = 0;
    data.hourly.time.forEach((timestr, i) => {
      const time = new Date(timestr);
      let sunrise = new Date(data.daily.sunrise[day]);
      let sunset = new Date(data.daily.sunset[day]);
      if (time.getHours() === 0) {
        days.push({
          date: time,
          hours: [],
          sunrise: sunrise.getHours().toString().padStart(2, "0") + ":" + sunrise.getMinutes().toString().padStart(2, "0"),
          sunset: sunset.getHours().toString().padStart(2, "0") + ":" + sunset.getMinutes().toString().padStart(2, "0"),
        });
      }
      days[day].hours[time.getHours()] = {
        temp: data.hourly.temperature_2m[i],
        apparent_temperature: data.hourly.apparent_temperature[i],
        relativehumidity_2m: data.hourly.relativehumidity_2m[i],
        weathercode: data.hourly.weathercode[i],
      };

      day += time.getHours() === 23;
    });
    data.days = days;
    dataAge = 0;
  }
  function dayToString(n) {
    switch (n) {
      case 0:
        return "Sun";
      case 1:
        return "Mon";
      case 2:
        return "Tue";
      case 3:
        return "Thu";
      case 4:
        return "Wed";
      case 5:
        return "Fri";
      case 6:
        return "Sat";
    }
  }
  function queryString(options) {
    /* Encoding with URLSearchParams doesn't work with API */
    let str = "";
    for (const [k, v] of Object.entries(options)) {
      str += `${k}=${v}&`;
    }
    return str;
  }
  function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
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
        return "Mainly clear";
      case 2:
        return "Partly cloudy";
      case 3:
        return "Overcase";
      case 45:
        return "Fog";
      case 48:
        return "Depositing rime fog";
      case 51:
        return "Light drizzle";
      case 53:
        return "Moderate drizzle";
      case 55:
        return "Dense drizzle";
      case 56:
        return "Light freezing drizzle";
      case 57:
        return "Dense freezing drizzle";
      case 61:
        return "Slight rain";
      case 63:
        return "Moderate rain";
      case 65:
        return "Heavy rain";
      case 66:
        return "Light freezing rain";
      case 67:
        return "Heavy freezing rain";
      case 71:
        return "Slight snowfall";
      case 73:
        return "Moderate snowfall";
      case 75:
        return "Heavy snowfall";
      case 77:
        return "Snow grains";
      case 80:
        return "Slight showers";
      case 81:
        return "Moderate showers";
      case 82:
        return "Violent showers";
      case 85:
        return "Slight snow showers";
      case 86:
        return "Heavy snow showers";
      case 95:
        return "Thunderstorm";
      case 96:
        return "Thunderstorm with slight hail";
      case 99:
        return "Thunderstorm with heavy hail";
    }
  }
  let dataAge = 0; // seconds
  setInterval(() => {
    dataAge++;
  }, 1000);
  function weatherCodeToIcon(ww, day) {
    switch (ww) {
      case 0:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/1.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/101.svg";
      case 1:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/2.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/102.svg";
      case 2:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/4.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/104.svg";
      case 3:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/7.svg";
      case 45:
      case 48:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/9.svg";
      case 51:
      case 53:
      case 55:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/11.svg";
      case 56:
      case 57:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/11.svg";
      case 61:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/37.svg";
      case 63:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/38.svg";
      case 65:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/39.svg";
      case 66:
      case 67:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/17.svg";
      case 71:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/57.svg";
      case 73:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/58.svg";
      case 75:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/59.svg";
      case 77:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/59.svg";
      case 80:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/21.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/121.svg";
      case 81:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/24.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/124.svg";
      case 82:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/127.svg";
      case 85:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/52.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/152.svg";
      case 86:
        return day ? "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/53.svg" : "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/153.svg";
      case 95:
      case 96:
      case 99:
        return "https://cdn.fmi.fi/symbol-images/smartsymbol/v3/p/77.svg";
    }
  }
</script>

<div class="overflow-y-auto overflow-x-hidden bg-gradient-to-r from-purple-100 to-pink-100 h-screen">
  <div class="flex flex-col items-center p-10 pb-0">
    <h2>Select a city: <span class:green={selected}>{cityName}</span></h2>
    <input id="autoComplete" placeholder="Enter city" bind:value={cityName} on:keydown={kd} />
  </div>
  {#if data}
    <div class="flex flex-wrap justify-center m-3">
      <div class="sm:basis-1/2">
        <div class="border-black border p-2 m-3 inline-block float-right">
          <p class="m-px">Country: {data.country}</p>
          <p class="m-px">Latitude: {data.latitude}</p>
          <p class="m-px">Longitude: {data.longitude}</p>
          <p class="m-px">Local time: {formatHHMMSSDDMMYY(new Date(data.localtime.getTime() + dataAge * 1000))}</p>
        </div>
      </div>
      <div class="sm:basis-1/2 flex items-start flex-col">
        <h3 class="w-full m-pxx">Current weather</h3>
        <h4 class="m-px">{weatherCodeToString(data.current_weather.weathercode)}</h4>
        <p class="m-px">Temperature: {data.current_weather.temperature}°C</p>
        <p class="m-px">Wind speed: {data.current_weather.windspeed} km/h</p>
        <div>
          <p class="m-px inline">Wind direction: {degreesToDirection(data.current_weather.winddirection)}</p>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/12/Right_arrow.svg"
            class="w-5 inline align-sub"
            style={`transform: rotate(${data.current_weather.winddirection - 90}deg)`} />
        </div>
      </div>
    </div>
    <div class="flex justify-center w-screen px-10">
      <div class="overflow-auto">
        <table class="">
          <tr>
            <th
              >Day<br /><span class="text-sd text-neutral-500 font-normal"
                >sunrise&nbsp-
                <div class="-m-1" />
                sunset</span
              ></th>
            {#each new Array(24).fill(0) as _, i}
              {#if i === data.localtime.getHours()}
                <th class="bg-[#ffffff50]">
                  {String(i).padStart(2, "0")}:00
                </th>
              {:else}
                <th>
                  {String(i).padStart(2, "0")}:00
                </th>
              {/if}
            {/each}
          </tr>
          {#each data.days as day}
            <tr>
              <th
                >{dayToString(day.date.getDay())}
                {day.date.getDate()}.<br />
                <span class="text-sd text-neutral-500 font-normal"
                  >{day.sunrise} -
                  <div class="-m-1" />
                  {day.sunset}</span
                ></th>
              {#each day.hours as hour}
                <td class="">
                  <div class="flex flex-col items-center">
                    {Math.round(hour.temp)}°C
                    <div class="-m-1" />
                    <span class="text-sm text-neutral-500 font-normal">({Math.round(hour.apparent_temperature)}°C)</span>
                    <div class="" />
                    <img src={weatherCodeToIcon(hour.weathercode, true)} class="h-10" />
                    <div class="" />
                    <span class="text-sm text-neutral-800 font-normal">{Math.round(hour.relativehumidity_2m)}%</span>
                  </div>
                </td>
              {/each}
            </tr>
          {/each}
        </table>
      </div>
    </div>
  {/if}
  <div class="text-center pb-5">
    <br />Displayed are temperature, apparent temperature and humidity.
    <br />Weather data from <a target="_blank" href="https://open-meteo.com/">open-meteo.com.</a>
    <br />City location and timezone data from <a target="_blank" href="https://www.geonames.org/">geonames.org.</a>
  </div>
</div>

<style global lang="postcss">
  @tailwind base;
  @tailwind utilities;

  body {
    overflow: visible;
    color: #333;
    margin: 0;
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

  table {
    /* font-family: arial, sans-serif; */
    border-collapse: collapse;
    width: 100%;
  }

  td,
  th {
    background-color: #ffffff90;
    border: 2px solid #dddddd00;
    background-clip: padding-box;
    text-align: left;
    padding: 10px;
  }

  tr:nth-child(even) {
    /* background-color: #dddddd; */
  }
  tr:nth-child(odd) {
    /* background-color: white; */
  }

  a {
    color: blue;
  }
</style>
