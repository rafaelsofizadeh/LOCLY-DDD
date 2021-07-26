const zonesAndMaxWeight = require('./usa-country-zone-maxweight.json');
const countryData = require('../country-iso-names.json');
const Fuse = require('fuse.js');
const { writeFile } = require('fs');
const { join } = require('path');

function extractZonesAndMaxWeight() {
  return Array.prototype.concat
    .apply(
      [],
      Array(6)
        .fill(19)
        .map((e, i) => e + i * 2)
        .map(i => `#_c4${i} > table > tbody`)
        .map(selector => [
          ...document.querySelector(selector).getElementsByTagName('tr'),
        ]),
    )
    .map(tr =>
      [...tr.getElementsByTagName('td')]
        .filter((tds, i) => [0, 3, 4, 6, 7].includes(i))
        .map(td => td.innerText),
    );
}

const stdCountries = zonesAndMaxWeight
  .slice(1)
  .filter(([a, b, c, sz, smw]) => sz !== 'n/a' && smw !== 'n/a');

const countryNameSearch = new Fuse(countryData, {
  shouldSort: true,
  threshold: 0.5,
  keys: ['name'],
});

const zones = stdCountries.reduce((zones, [name, b, c, sz, smw]) => {
  const pz = Number(sz);
  // Convert lbs to kg and round
  // https://stackoverflow.com/a/11832950/6539857
  const mw = Math.round((Number(smw) * 0.453592 + Number.EPSILON) * 100) / 100;

  zones[pz] = zones[pz] || [];

  const [match] = countryNameSearch.search(name);

  if (!match) return zones;

  const iso3 = match.item['alpha-3'];
  zones[pz].push({ iso3, maxWeight: mw });

  return zones;
}, {});

writeFile(
  join(__dirname, './zones.json'),
  JSON.stringify(zones, null, 2),
  err => {
    if (err) throw err;
    console.log('Successful write.');
  },
);

function extractPrices() {
  const canada = [
    ...document
      .querySelector('#_c330 > table > tbody')
      .getElementsByTagName('tr'),
  ]
    .map(tr => tr.getElementsByTagName('td')[1].innerText)
    .map(e => (e == '-' ? -1 : Number(e.replace('$', ''))));
    
  const world = rows
    .map(bodyrows => [...bodyrows])[0]
    .map((tr, i) => [tr, rows[1][i]])
    .map(rows =>
      rows.map(row =>
        [...row.getElementsByTagName('td')]
          .slice(1)
          .map(td =>
            td.innerText === '-' ? -1 : Number(td.innerText.replace('$', '')),
          ),
      ),
    )
    .map(cr => Array.prototype.concat.apply([], cr));
  const worldwide = canada.map((c, i) => [c, ...world[i]]);

  return worldwide;
}
