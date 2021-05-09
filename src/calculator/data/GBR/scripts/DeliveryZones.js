const { writeFileSync } = require('fs');
const { join } = require('path');
const Fuse = require('fuse.js');
const countriesData = require('../../country-iso-names.json');

// --------------------------------
// ------------Europe--------------
// --------------------------------

// https://www.royalmail.com/international-zones
// [...document.getElementsByTagName('td')].map(cell => cell.innerText)
const europeDeliveryZone = [
  'Albania',
  'Denmark',
  'Kyrgyzstan',
  'Russia',
  'Andorra',
  'Estonia',
  'Latvia',
  'San Marino',
  'Armenia',
  'Faroe Islands',
  'Liechtenstein',
  'Serbia',
  'Austria',
  'Finland',
  'Lithuania',
  'Slovakia',
  'Azerbaijan',
  'France',
  'Luxembourg',
  'Slovenia',
  'Azores',
  'Georgia',
  'Macedonia',
  'Spain',
  'Balearic Islands',
  'Germany',
  'Madeira',
  'Sweden',
  'Belarus',
  'Gibraltar',
  'Malta',
  'Switzerland',
  'Belgium',
  'Greece',
  'Moldova',
  'Tajikistan',
  'Bosnia Herzegovina',
  'Greenland',
  'Monaco',
  'Turkey',
  'Bulgaria',
  'Hungary',
  'Montenegro',
  'Turkmenistan',
  'Canary Islands',
  'Iceland',
  'Netherlands',
  'Ukraine',
  'Corsica',
  'Irish Republic',
  'Norway',
  'Uzbekistan',
  'Croatia',
  'Italy',
  'Poland',
  'Vatican City State',
  'Cyprus',
  'Kazakhstan',
  'Portugal',
  'Czech Republic',
  'Kosovo',
  'Romania',
];

const searchOptions = {
  shouldSort: true,
  threshold: 0.5,
  keys: ['name'],
};

const fuse = new Fuse(countriesData, searchOptions);

const europeDeliveryZoneISO = europeDeliveryZone
  .map(country => fuse.search(country)[0]?.item['alpha-3'])
  .filter(Boolean);

// --------------------------------
// ----------World Zone 2----------
// --------------------------------

// https://www.royalmail.com/international-zones
// [...document.getElementsByTagName('td')].map(cell => cell.innerText)
const world2DeliveryZone = [
  'Australia',
  'Belau',
  'British Indian Ocean Territory',
  'Christmas Island (Indian Ocean)',
  'Christmas Island (Pacific Ocean)',
  'Cocos Islands',
  'Cook Island',
  'Coral Sea Island',
  'Fiji',
  'French Polynesia',
  'French South Antarctic Territory',
  'Keeling',
  'Kiribati',
  'Macao',
  'Nauru Island',
  'New Caledonia',
  'New Zealand',
  'New Zealand Antarctic Territory',
  'Niue Island',
  'Norfolk Island',
  'Norwegian Antarctic Territory',
  'Papua New Guinea',
  "People's Democratic Republic of Laos",
  'Pitcairn Island',
  'Republic of Singapore',
  'Solomon Islands',
  'Tahiti',
  'Tokelau Islands',
  'Tonga',
  'Tuvalu',
  'US Samoa',
  'Western Samoa',
];

const world2DeliveryZoneISO = world2DeliveryZone
  .map(country => fuse.search(country)[0]?.item['alpha-3'])
  .filter(Boolean);

const world3DeliveryZoneISO = ['USA'];

const restOfWorldISO = [
  ...europeDeliveryZoneISO,
  ...world2DeliveryZoneISO,
  ...world3DeliveryZoneISO,
];

const world1DeliveryZoneISO = countriesData
  .map(countryData => countryData['alpha-3'])
  .filter(isoCode => !restOfWorldISO.includes(isoCode));

const output = {
  deliveryZones: {
    Europe: europeDeliveryZoneISO,
    'World 1': world1DeliveryZoneISO,
    'World 2': world2DeliveryZoneISO,
    'World 3': world3DeliveryZoneISO,
  },
};

writeFileSync(
  join(__dirname, './delivery-zones.json'),
  JSON.stringify(output, null, 2),
  'utf8',
);
