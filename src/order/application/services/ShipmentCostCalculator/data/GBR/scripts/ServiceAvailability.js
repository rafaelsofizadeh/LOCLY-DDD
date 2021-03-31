const { writeFileSync } = require('fs');
const { join } = require('path');
const Fuse = require('fuse.js');
const countryData = require('../../country-iso-names.json');

// Obtained from the "Royal Mail Service Availability" PDF
const csv = `Afghanistan,✗,✗,✓,
Aland Islands,✓,✓,✗,✓
Albania,✗,✗,✓,
Algeria,✗,✗,✓,
Andorra,✓,✓,✗,
Angola,✗,✗,✓,
Anguilla,✗,✗,✓,
Antigua Barbuda,✗,✗,✓,
Argentina,✓,✗,✗,
Armenia,✗,✗,✓,
Aruba,✗,✗,✓,
Ascension Island,✗,✗,✓,
Australia,✗,✓,✓,
Austria,✓,✓,✗,✓
Azerbaijan,✗,✗,✓,
Bahamas,✗,✗,✓,
Bahrain,✗,✗,✓,
Bangladesh,✗,✗,✓,
Barbados,✓,✗,✗,
Belarus,✓,✗,✗,
Belgium,✓,✓,✗,✓
Belize,✓,✗,✗,
Benin,✗,✗,✓,
Bermuda,✗,✗,✓,
Bhutan,✗,✗,✓,
Bolivia,✗,✗,✓,
Bonaire,✗,✗,✓,
Bosnia Hertzegovina,✗,✗,✓,
Botswana,✗,✗,✓,
Brazil,✗,✓,✓,
Brunei,✗,✗,✓,
Bulgaria,✓,✗,✗,
Burkina Faso,✗,✗,✓,
Burundi,✗,✗,✓,
Cambodia,✓,✗,✗,
Cameroon,✗,✗,✓,
Canada,✓,✓,✗,
Canary Islands,✓,✓,✗,✓
Cape Verde,✗,✗,✓,
Cayman Islands,✓,✗,✗,
Central African Republic,✗,✗,✓,
Ceuta,✗,✗,✓,
Chad,✗,✗,✓,
Chile,✗,✗,✓,
Colombia,✗,✗,✓,
Comoros Islands,✗,✗,✓,
Congo (Democratic Republic of),✗,✗,✓,
Congo (Republic of),✗,✗,✓,
Cook Islands,✓,✗,✗,
Costa Rica,✗,✗,✓,
Croatia,✓,✓,✗,
Cuba,✗,✗,✓,
Curacao,✗,✗,✓,
Cyprus,✓,✓,✗,
Czech Republic,✓,✗,✗,✓
Denmark,✓,✓,✗,✓
Djibouti,✗,✗,✓,
Dominica,✗,✗,✓,
Dominican Republic,✗,✗,✓,
Ecuador,✓,✗,✗,
Egypt,✗,✗,✓,
El Salvador,✗,✗,✓,
Equatorial Guinea,✗,✗,✓,
Eritrea,✗,✗,✓,
Estonia,✗,✓,✓,✓
Ethiopia,✗,✗,✓,
Falkland Islands,✗,✗,✓,
Faroe Islands,✓,✓,✗,
Fiji,✗,✗,✓,
Finland,✓,✓,✗,✓
France,✓,✓,✗,✓
French Guiana,✗,✗,✓,
French Polynesia,✗,✗,✓,
Gabon,✗,✗,✓,
Gambia,✗,✗,✓,
Georgia,✓,✗,✗,
Germany,✓,✓,✗,✓
Ghana,✗,✗,✓,
Gibraltar,✓,✓,✗,
Greece,✓,✓,✗,✓
Greenland,✓,✓,✗,
Grenada,✗,✗,✓,
Guadeloupe,✗,✗,✓,
Guatemala,✗,✗,✓,
Guinea,✗,✗,✓,
Guinea-Bissau,✗,✗,✓,
Guyana,✗,✗,✓,
Honduras,✗,✗,✓,
Hong Kong,✓,✓,✗,
Hungary,✓,✓,✗,✓
Iceland,✓,✓,✗,✓
India*,✗,✓,✓,
Indonesia,✓,✗,✗,
Iran,✗,✗,✓,
Iraq,✗,✗,✓,
Ireland,✓,✓,✗,✓
Israel,✗,✓,✓,
Italy,✓,✓,✗,✓
Cote D'Ivoire,✗,✗,✓,
Jamaica,✗,✗,✓,
Japan,✓,✗,✗,
Jordan,✗,✗,✓,
Kazakhstan,✗,✗,✓,
Kenya,✗,✗,✓,
Kiribati,✗,✗,✓,
Kosovo,✗,✗,✓,
Kuwait,✗,✗,✓,
Kyrgyzstan,✗,✗,✓,
Laos,✗,✗,✓,
Latvia,✓,✓,✗,✓
Lebanon,✓,✓,✗,
Lesotho,✗,✗,✓,
Liberia,✗,✗,✓,
Libya,✗,✗,✓,
Liechtenstein,✓,✓,✗,
Lithuania,✓,✓,✗,✓
Luxembourg,✓,✓,✗,✓
Macao,✗,✗,✓,
Macedonia,✗,✗,✓,
Madagascar,✗,✗,✓,
Malawi,✗,✗,✓,
Malaysia,✓,✓,✗,
Maldives,✗,✗,✓,
Mali,✗,✗,✓,
Malta,✓,✓,✗,✓
Martinique,✗,✗,✓,
Mauritania,✗,✗,✓,
Mauritius,✗,✗,✓,
Melilla,✗,✗,✓,
Mexico,✗,✗,✓,
Moldova,✓,✗,✗,
Mongolia,✗,✗,✓,
Montserrat,✗,✗,✓,
Morocco,✗,✗,✓,
Mozambique,✗,✗,✓,
Myanmar,✗,✗,✓,
Namibia,✗,✗,✓,
Nauru Island,✗,✗,✓,
Nepal,✗,✗,✓,
Netherlands,✓,✓,✗,✓
New Caledonia,✗,✗,✓,
New Zealand,✓,✓,✗,✓
Nicaragua,✗,✗,✓,
Niger Republic,✗,✗,✓,
Nigeria,✗,✗,✓,
Niue Island,✗,✗,✓,
North Korea,✗,✗,✓,
Norway,✗,✓,✓,✓
Oman,✗,✗,✓,
Pakistan,✗,✗,✓,
Palau,✗,✗,✓,
Panama,✗,✗,✓,
Papua New Guinea,✗,✗,✓,
Paraguay,✗,✗,✓,
Peru,✗,✗,✓,
Philippines,✗,✗,✓,
Pitcairn Island,✗,✗,✓,
Poland,✓,✓,✗,✓
Portugal,✓,✓,✗,✓
Puerto Rico,✗,✗,✓,
Qatar,✗,✗,✓,
Reunion Island,✗,✗,✓,
Romania,✓,✗,✗,✓
Russian Federation,✓,✓,✗,
Rwanda,✗,✗,✓,
San Marino,✓,✓,✗,✓
Sao Tome & Principe,✗,✗,✓,
Saudi Arabia,✗,✗,✓,
Senegal,✗,✗,✓,
Serbia,✓,✓,✗,
Seychelles,✗,✗,✓,
Sierra Leone,✗,✗,✓,
Singapore,✓,✓,✗,
Slovakia,✓,✓,✗,✓
Slovenia,✓,✓,✗,✓
Solomon Islands,✗,✗,✓,
Somalia,,,,
South Africa,✗,✗,✓,
South Sudan,✗,✗,✓,
Spain,✓,✓,✗,✓
Sri Lanka,✗,✗,✓,
St Eustatius,✗,✗,✓,
St Helena,✗,✗,✓,
St Kitts & Nevis,✗,✗,✓,
St Lucia,✗,✗,✓,
St Maarten,✗,✗,✓,
St Vincent & The Grenadines,✗,✗,✓,
Sudan,✗,✗,✓,
Suriname,✗,✗,✓,
Swaziland,✗,✗,✓,
Sweden,✓,✓,✗,✓
Switzerland,✓,✓,✗,✓
Syria,✗,✗,✓,
Taiwan,✗,✗,✓,
Tajikistan,✗,✗,✓,
Tanzania,✗,✗,✓,
Thailand,✓,✗,✗,
Timor-Leste,✗,✗,✓,
Togo,✗,✗,✓,
Tokelau Islands,✗,✗,✓,
Tonga,✓,✗,✗,
Trinidad & Tobago,✓,✗,✗,
Tristan de Cunha,✗,✗,✓,
Tunisia,✗,✗,✓,
Turkey,✓,✓,✗,
Northern Cyprus,✗,✗,✓,
Turkmenistan,✗,✗,✓,
Turks & Caicos Islands,✗,✗,✓,
Tuvalu,✗,✗,✓,
Uganda,✓,✗,✗,
Ukraine,✗,✗,✓,
United Arab Emirates,✓,✗,✗,
Uruguay,✗,✗,✓,
USA,✓,✓,✗,
Uzbekistan,✗,✗,✓,
Vanuatu,✗,✗,✓,
Vatican City State,✓,✓,✗,✓
Venezuela,✗,✗,✓,
Vietnam,✗,✗,✓,
Wallis & Futuna Islands,✗,✗,✓,
Western Sahara,✗,✗,✓,
Western Samoa,✗,✗,✓,
Yemen,✗,✗,✓,
Zambia,✗,✗,✓,`;

const rows = csv.split('\n');
const serviceNames = ['Tracked & Signed', 'Tracked', 'Signed'];
// Map: <country name>: [<available services>,]
const entries = rows.reduce((entries, row) => {
  const [country, ...services] = row.split(',');
  services.pop();
  entries[country] = services.reduce((availableServices, service, i) => {
    if (service === '✓') {
      availableServices.push(serviceNames[i]);
    }

    return availableServices;
  }, []);

  return entries;
}, {});

const searchOptions = {
  shouldSort: true,
  threshold: 0.5,
  keys: ['name'],
};

const fuse = new Fuse(countryData, searchOptions);

const isoEntries = Object.entries(entries).reduce(
  (isoEntries, [country, services]) => {
    const isoMatches = fuse.search(country);

    if (isoMatches.length === 0) return isoEntries;

    //console.log(country, isoMatches.slice(0, 6));
    const match = isoMatches[0].item;

    isoEntries[match['alpha-3']] = services;

    return isoEntries;
  },
  {},
);

writeFileSync(
  join(__dirname, './uk-service-availability.json'),
  JSON.stringify(isoEntries, null, 2),
  'utf8',
);
