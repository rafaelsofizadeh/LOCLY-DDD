const { writeFile } = require('fs');
const { join } = require('path');
const data = require('./data.json');
const zones = require('./zones.json');

const priceTable = Object.keys(zones).map(zone =>
  data[Object.keys(data).find(iso3 => data[iso3][0].price_zone_id == zone)].map(
    ({ package_prices: { delivery_onlineParcel: price } }) => price,
  ),
);

writeFile(
  join(__dirname, './pricetable.json'),
  JSON.stringify(priceTable, null, 2),
  err => {
    if (err) throw err;

    console.log('Successful write');
  },
);
