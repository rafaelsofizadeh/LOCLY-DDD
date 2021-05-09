const { writeFileSync, write } = require('fs');
const { join } = require('path');

const countryToServiceAvailability = require('./country-to-service-availability.json');

const serviceToCountryAvailability = Object.entries(
  countryToServiceAvailability,
).reduce((stca, [country, services]) => {
  for (service of services) {
    if (!(service in stca)) {
      stca[service] = [];
    }

    stca[service].push(country);
  }

  return stca;
}, {});

writeFileSync(
  join(__dirname, './service-to-country-availability.json'),
  JSON.stringify(serviceToCountryAvailability),
  'utf8',
);
