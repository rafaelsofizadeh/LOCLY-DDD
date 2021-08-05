const Fuse = require('fuse.js');
const deuToIso3Data = require('./deu-iso3.json');
const zones = require('./zones.json');

const countryNameSearch = new Fuse(deuToIso3Data, {
  shouldSort: true,
  threshold: 0.3,
  keys: ['0'],
});

console.log(
  zones
    .map(([name, zone]) => {
      const res = countryNameSearch.search(name);

      if (res.length) {
        return [res[0].item[1], Number(zone)];
      }
    })
    .filter(Boolean)
    .reduce((zones, [iso3, zone]) => {
      zones[zone] = zones[zone] || [];
      zones[zone].push(iso3);
      return zones;
    }, {}),
);
