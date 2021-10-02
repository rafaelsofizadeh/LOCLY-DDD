const { alpha2ToAlpha3 } = require('i18n-iso-countries');
const { readFile, writeFile } = require('fs');
const { join } = require('path');

readFile(join(__dirname, './swiss-data.csv'), 'utf8', (err, data) => {
  if (err) throw err;

  const zones = data
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .slice(1)
    .map(row => row.split(' '))
    .map(([iso2, zone, _, emw]) => [alpha2ToAlpha3(iso2), zone, Number(emw)])
    .reduce((zones, [iso3, zone, mw]) => {
      zones[zone] = zones[zone] || [];
      zones[zone].push({ iso3, maxWeight: mw });

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
});

const CHE = {
  postalServiceName: 'Swiss Post',
  priceTableSpecification: {
    currency: 'CHF',
    deliveryZoneNames: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    weightIntervals: [2000, 5000, 10000, 15000, 20000],
  },
  deliveryZones: {
    'Zone 1': [
      {
        iso3: 'AUT',
        maxWeight: 30,
      },
      {
        iso3: 'BEL',
        maxWeight: 30,
      },
      {
        iso3: 'DNK',
        maxWeight: 30,
      },
      {
        iso3: 'FRA',
        maxWeight: 30,
      },
      {
        iso3: 'DEU',
        maxWeight: 30,
      },
      {
        iso3: 'ITA',
        maxWeight: 30,
      },
      {
        iso3: 'NLD',
        maxWeight: 20,
      },
      {
        iso3: 'GBR',
        maxWeight: 30,
      },
    ],
    'Zone 2': [
      {
        iso3: 'POL',
        maxWeight: 20,
      },
      {
        iso3: 'PRT',
        maxWeight: 30,
      },
      {
        iso3: 'ESP',
        maxWeight: 30,
      },
      {
        iso3: 'SWE',
        maxWeight: 30,
      },
    ],
    'Zone 3': [
      {
        iso3: 'ROU',
        maxWeight: 30,
      },
      {
        iso3: 'RUS',
        maxWeight: 20,
      },
      {
        iso3: 'TUR',
        maxWeight: 30,
      },
      {
        iso3: 'UKR',
        maxWeight: 30,
      },
    ],
    'Zone 4': [
      {
        iso3: 'CAN',
        maxWeight: 30,
      },
      {
        iso3: 'USA',
        maxWeight: 30,
      },
    ],
    'Zone 5': [
      {
        iso3: 'AUS',
        maxWeight: 20,
      },
      {
        iso3: 'BRA',
        maxWeight: 30,
      },
      {
        iso3: 'CHN',
        maxWeight: 30,
      },
      {
        iso3: 'IND',
        maxWeight: 20,
      },
      {
        iso3: 'JPN',
        maxWeight: 30,
      },
      {
        iso3: 'NZL',
        maxWeight: 30,
      },
      {
        iso3: 'THA',
        maxWeight: 30,
      },
    ],
  },
  deliveryServices: [
    {
      id: 'economy',
      tracked: true,
      name: 'PostPac International Economy',
      serviceAvailability: ['all'],
      priceTable: [
        [34, 37, 41, 44, 48],
        [42, 47, 53, 57, 62],
        [46, 55, 65, 76, 89],
        [51, 63, 75, 97, 120],
        [56, 72, 87, 119, 151],
      ],
    },
  ],
};
