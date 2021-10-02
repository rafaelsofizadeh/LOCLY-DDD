const { writeFile } = require('fs');
const { join } = require('path');
const data = require('./prices.json');

writeFile(
  join(__dirname, './data.json'),
  JSON.stringify(
    Object.entries(data).reduce((dataC, [iso3, countryData]) => {
      dataC[iso3] = countryData.slice(0, -3);
      return dataC;
    }, {}),
    null,
    2,
  ),
  err => {
    if (err) throw err;

    console.log('Successful write');
  },
);
