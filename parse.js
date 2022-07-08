import * as fs from 'fs';
import * as readline from 'readline';
import { getCountryName } from './countrycodes.js';

const DEV = true;

const stream = fs.createReadStream('data.txt');
const rl = readline.createInterface({ input: stream, });
// http://download.geonames.org/export/dump/


let cities = {};

let i = 0;
for await (const line of rl) {
	if (DEV && i > 99) break;
	i++;
	const [geonameid,
		name,
		asciiname,
		alternatenames,
		latitude,
		longitude,
		featureclass,
		featurecode,
		countrycode,
		cc2,
		adm1code,
		adm2code,
		adm3code,
		adm4code,
		population,
		elevation,
		dem,
		timezone,
		oddate] = line.split('\t');
	const country = getCountryName(countrycode);
	cities[name] = { country, latitude, longitude, timezone, cc: countrycode };
}

fs.writeFileSync('src/citynames.js', `export const citynames = ${JSON.stringify(Object.keys(cities).map(name => `${name} (${cities[name].cc})`))};`);
fs.writeFileSync('src/cities.js', `export const cities = ${JSON.stringify(cities)};`);