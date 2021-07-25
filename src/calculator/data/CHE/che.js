const { alpha2ToAlpha3 } = require('i18n-iso-countries');

console.log(
  `AU 5
AT 1
BE 1
BR 5
CA 4
CN 5
DK 1
FR 1
DE 1
IN 5
IT 1
JP 5
NL 1
NZ 5
PL 2
PT 1
RO 3
RU 3
ES 2
SE 2
TH 5
TR 3
UA 3
GB 1
US 4`
    .split('\n')
    .map(row => row.split(' '))
    .map(([iso2, zone]) => [alpha2ToAlpha3(iso2), zone])
    .reduce((zones, [iso3, zone]) => {
      zones[zone] = zones[zone] || [];
      zones[zone].push(iso3);

      return zones;
    }, {}),
);

console.log(
  JSON.stringify(
    '38.00 34.00 43.00 37.00 48.00 41.00 53.00 44.00 58.00 48.00 70.00 53.00 48.00 42.00 54.00 47.00 64.00 53.00 76.00 57.00 88.00 62.00 108.00 77.00 56.00 46.00 65.00 55.00 77.00 65.00 104.00 76.00 130.00 89.00 164.00 113.00 67.00 51.00 81.00 63.00 94.00 75.00 138.00 97.00 182.00 120.00 227.00 155.00 72.00 56.00 89.00 72.00 106.00 87.00 169.00 119.00 231.00 151.00 303.00 186.00 78.00 61.00 101.00 79.00 126.00 97.00 197.00 137.00 268.00 177.00 367.00 217.00 83.00 66.00 109.00 87.00 138.00 107.00 217.00 154.00 296.00 201.00 416.00 253.00'
      .split(' ')
      .map(n => Number(n))
      .reduce(([p, e], n, i) => (i % 2 ? [[...p, n], e] : [p, [...e, n]]), [
        [],
        [],
      ])
      .map(a => chunk(a, 6).map(r => r.slice(0, -1))),
  ),
);

const CHE = {
  postalServiceName: 'Swiss Post',
  priceTableSpecification: {
    currency: 'CHF',
    deliveryZoneNames: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
    weightIntervals: [2000, 5000, 10000, 15000, 20000],
  },
  deliveryZones: {
    'Zone 1': ['AUT', 'BEL', 'DNK', 'FRA', 'DEU', 'ITA', 'NLD', 'PRT', 'GBR'],
    'Zone 2': ['POL', 'ESP', 'SWE'],
    'Zone 3': ['ROU', 'RUS', 'TUR', 'UKR'],
    'Zone 4': ['CAN', 'USA'],
    'Zone 5': ['AUS', 'BRA', 'CHN', 'IND', 'JPN', 'NZL', 'THA'],
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
    {
      id: 'priority',
      tracked: true,
      name: 'PostPac International Priority',
      serviceAvailability: ['all'],
      priceTable: [
        [38, 43, 48, 53, 58],
        [48, 54, 64, 76, 88],
        [56, 65, 77, 104, 130],
        [67, 81, 94, 138, 182],
        [72, 89, 106, 169, 231],
      ],
    },
  ],
};
