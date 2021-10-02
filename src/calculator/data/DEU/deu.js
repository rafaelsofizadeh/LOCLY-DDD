const zones = require('./zones.json');
const countries = require('../country-iso-names.json');

const zoneIso = Array.prototype.concat.apply(Object.values(zones));
const countriesIso = countries.map(({ 'alpha-3': iso3 }) => iso3);

console.log(JSON.stringify(countriesIso.filter(c => !zoneIso.includes(c))));
