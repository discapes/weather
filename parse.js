import * as fs from 'fs';
import * as readline from 'readline';
import { getCountryName } from './countrycodes.js';

const stream = fs.createReadStream('data.txt');
const rl = readline.createInterface({ input: stream, });
// http://download.geonames.org/export/dump/


let cities = {};

for await (const line of rl) {
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
	cities[name] = { country, latitude, longitude, timezone, };
}

fs.writeFileSync('src/citynames.js', `export const citynames = ${JSON.stringify(Object.getOwnPropertyNames(cities))};`);
fs.writeFileSync('src/cities.js', `export const cities = ${JSON.stringify(cities)};`);