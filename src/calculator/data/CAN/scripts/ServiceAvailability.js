const { writeFileSync } = require('fs');
const { join } = require('path');
const { alpha2ToAlpha3 } = require('i18n-iso-countries');

// ocr + PDF
const iso2Zones = {
  AL: 103,
  AR: 107,
  AU: 105,
  AT: 102,
  BS: 101,
  BB: 101,
  BY: 103,
  BE: 102,
  BZ: 101,
  BR: 107,
  KY: 101,
  CL: 107,
  CN: 109,
  CO: 107,
  CR: 101,
  HR: 103,
  CW: 101,
  CY: 102,
  CZ: 102,
  DK: 102,
  EC: 107,
  SV: 101,
  EE: 103,
  ET: 110,
  FI: 102,
  FR: 102,
  DE: 102,
  GR: 102,
  GD: 101,
  GY: 107,
  HK: 104,
  HU: 102,
  IS: 102,
  IN: 106,
  ID: 106,
  IE: 102,
  IL: 108,
  IT: 102,
  JM: 101,
  JP: 104,
  KE: 110,
  KR: 104,
  LV: 103,
  LB: 108,
  LI: 102,
  LT: 103,
  LU: 102,
  MO: 104,
  MY: 104,
  MT: 102,
  MU: 110,
  MX: 101,
  MC: 102,
  MA: 110,
  NL: 102,
  NZ: 105,
  NF: 105,
  NO: 102,
  PH: 106,
  PL: 103,
  PT: 102,
  RO: 103,
  RU: 103,
  KN: 101,
  LC: 101,
  SM: 102,
  SA: 108,
  RS: 103,
  SG: 104,
  SX: 101,
  SK: 103,
  ES: 102,
  SE: 102,
  CH: 102,
  SY: 108,
  TW: 104,
  TH: 104,
  TT: 101,
  AE: 108,
  GB: 102,
  VN: 106,
};

const iso3Zones = Object.entries(iso2Zones)
  .map(([iso2, zone]) => [alpha2ToAlpha3(iso2), zone])
  .reduce((codeGroups, [iso3, zone]) => {
    codeGroups[zone] = codeGroups[zone] || [];

    codeGroups[zone].push(iso3);

    return codeGroups;
  }, {});

writeFileSync(
  join(__dirname, './can-service-availability.json'),
  JSON.stringify(iso3Zones, null, 2),
  'utf8',
);
