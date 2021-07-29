const data = require('./data.json');
const { writeFile } = require('fs');
const { join } = require('path');

// THIS WILL BE USEFUL in case Postnord's maxWeights for countries change. For now they're all capped at 20kg,
// except for Somalia (SOM), which is capped at 2kg, which is not necessary to account for.

// console.log(
//   JSON.stringify(
//     Object.entries(data).reduce((zones, [iso3, countryData]) => {
//       const { price_zone_id: zone } = countryData[0];
//       const index = countryData.findIndex(
//         ({ package_prices: { delivery_onlineParcel: price } }) => price === 0,
//       );

//       const { max_weight: maxWeight } = countryData[
//         index === -1 ? countryData.length - 1 : index === 0 ? 0 : index - 1
//       ];

//       zones[zone] = zones[zone] || [];
//       zones[zone].push({ iso3, maxWeight });
//       return zones;
//     }, {}),
//     null,
//     2,
//   ),
// );

writeFile(
  join(__dirname, './zones.json'),
  JSON.stringify(
    Object.entries(data).reduce(
      (zones, [iso3, [{ price_zone_id: zoneNum }]]) => {
        const zone = `Zone ${zoneNum}`;
        zones[zone] = zones[zone] || [];
        zones[zone].push(iso3);
        return zones;
      },
      {},
    ),
    null,
    2,
  ),
  err => {
    if (err) throw err;

    console.log('Successful write');
  },
);
