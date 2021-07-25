const Fuse = require('fuse.js');
const countryData = require('../country-iso-names.json');

// https://www.nationsonline.org/oneworld/countrynames_italian.htm
function extract() {
  return [...document.getElementsByTagName('tr')]
    .filter(tr => tr.getElementsByTagName('td').length === 5)
    .map(tr => [...tr.getElementsByTagName('td')])
    .map(tr =>
      tr
        .slice(1, 3)
        .map(td => td.innerText.replace(/\(.+\)/, '').replace(/,.+/, '')),
    );
}

const countryTranslations = [
  { eng: 'Afghanistan', it: 'Afghanistan' },
  { eng: 'Albania', it: 'Albania' },
  { eng: 'Algeria', it: 'Algeria' },
  { eng: 'American Samoa', it: 'Samoa Americane' },
  { eng: 'Andorra', it: 'Andorra' },
  { eng: 'Angola', it: 'Angola' },
  { eng: 'Anguilla', it: 'Anguilla' },
  { eng: 'Antarctica', it: 'Antartide' },
  { eng: 'Antigua and Barbuda', it: 'Antigua e Barbuda' },
  { eng: 'Argentina', it: 'Argentina' },
  { eng: 'Armenia', it: 'Armenia' },
  { eng: 'Aruba', it: 'Aruba' },
  { eng: 'Australia', it: 'Australia' },
  { eng: 'Austria', it: 'Austria' },
  { eng: 'Azerbaijan', it: 'Azerbaigian' },
  { eng: 'Bahamas', it: 'Bahamas' },
  { eng: 'Bahrain', it: 'Bahrain' },
  { eng: 'Bangladesh', it: 'Bangladesh' },
  { eng: 'Barbados', it: 'Barbados' },
  { eng: 'Belarus', it: 'Bielorussia' },
  { eng: 'Belgium', it: 'Belgio' },
  { eng: 'Belize', it: 'Belize' },
  { eng: 'Benin', it: 'Benin' },
  { eng: 'Bermuda', it: 'Bermuda' },
  { eng: 'Bhutan', it: 'Bhutan' },
  { eng: 'Bolivia', it: 'Bolivia' },
  { eng: 'Bosnia and Herzegovina', it: 'Bosnia ed Erzegovina' },
  { eng: 'Botswana', it: 'Botswana' },
  { eng: 'Brazil', it: 'Brasile' },
  { eng: 'Brunei', it: 'Brunei' },
  { eng: 'Bulgaria', it: 'Bulgaria' },
  { eng: 'Burkina Faso', it: 'Burkina Faso' },
  { eng: 'Burundi', it: 'Burundi' },
  { eng: 'Cambodia', it: 'Cambogia' },
  { eng: 'Cameroon', it: 'Camerun' },
  { eng: 'Canada', it: 'Canada' },
  { eng: 'Cape Verde', it: 'Capo Verde' },
  { eng: 'Cayman Islands', it: 'Isole Cayman' },
  { eng: 'Central African Republic', it: 'Repubblica Centrafricana' },
  { eng: 'Chad', it: 'Ciad' },
  { eng: 'Chile', it: 'Cile' },
  { eng: 'China', it: 'Cina' },
  { eng: 'Christmas Island', it: 'Isola di Natale' },
  { eng: 'Cocos  Islands', it: 'Isole Cocos' },
  { eng: 'Colombia', it: 'Colombia' },
  { eng: 'Comoros', it: 'Comore' },
  {
    eng: 'Democratic Republic of the Congo ',
    it: 'Repubblica Democratica del Congo',
  },
  { eng: 'Congo', it: 'Repubblica del Congo' },
  { eng: 'Cook Islands', it: 'Isole Cook' },
  { eng: 'Costa Rica', it: 'Costa Rica' },
  ['Ivory Coast ', "Costa d'Avorio"],
  { eng: 'Croatia', it: 'Croazia' },
  { eng: 'Cuba', it: 'Cuba' },
  { eng: 'Cyprus', it: 'Cipro' },
  { eng: 'Czechia', it: 'Cechia ' },
  { eng: 'Denmark', it: 'Danimarca' },
  { eng: 'Djibouti', it: 'Gibuti' },
  { eng: 'Dominica', it: 'Dominica' },
  { eng: 'Dominican Republic', it: 'Repubblica Dominicana' },
  { eng: 'East Timor ', it: 'Timor Est' },
  { eng: 'Ecuador', it: 'Ecuador' },
  { eng: 'Egypt', it: 'Egitto' },
  { eng: 'El Salvador', it: 'El Salvador' },
  { eng: 'Equatorial Guinea', it: 'Guinea Equatoriale' },
  { eng: 'Eritrea', it: 'Eritrea' },
  { eng: 'Estonia', it: 'Estonia' },
  { eng: 'Ethiopia', it: 'Etiopia' },
  { eng: 'Falkland Islands', it: 'Isole Falkland' },
  { eng: 'Faroe Islands', it: 'Isole Faroe ' },
  { eng: 'Fiji', it: 'Figi' },
  { eng: 'Finland', it: 'Finlandia' },
  { eng: 'France', it: 'Francia' },
  { eng: 'French Guiana', it: 'Guyana francese' },
  { eng: 'French Polynesia', it: 'Polinesia francese' },
  { eng: 'Gabon', it: 'Gabon' },
  { eng: 'Gambia', it: 'Gambia' },
  { eng: 'Georgia', it: 'Georgia' },
  { eng: 'Germany', it: 'Germania' },
  { eng: 'Ghana', it: 'Ghana' },
  { eng: 'Gibraltar', it: 'Gibilterra' },
  { eng: 'Greece', it: 'Grecia' },
  { eng: 'Greenland', it: 'Groenlandia' },
  { eng: 'Grenada', it: 'Grenada' },
  { eng: 'Guadeloupe', it: 'Guadalupa' },
  { eng: 'Guam', it: 'Guam' },
  { eng: 'Guatemala', it: 'Guatemala' },
  { eng: 'Guinea', it: 'Guinea' },
  { eng: 'Guinea-Bissau', it: 'Guinea-Bissau' },
  { eng: 'Guyana', it: 'Guyana' },
  { eng: 'Haiti', it: 'Haiti' },
  { eng: 'Honduras', it: 'Honduras' },
  { eng: 'Hong Kong', it: 'Hong Kong' },
  { eng: 'Hungary', it: 'Ungheria' },
  { eng: 'Iceland', it: 'Islanda' },
  { eng: 'India', it: 'India' },
  { eng: 'Indonesia', it: 'Indonesia' },
  { eng: 'Iran ', it: 'Iran ' },
  { eng: 'Iraq', it: 'Irak' },
  { eng: 'Ireland', it: 'Irlanda' },
  { eng: 'Israel', it: 'Israele' },
  { eng: 'Italy', it: 'Italia' },
  { eng: 'Jamaica', it: 'Giamaica' },
  { eng: 'Japan', it: 'Giappone' },
  { eng: 'Jordan', it: 'Giordania' },
  { eng: 'Kazakhstan', it: 'Kazakistan' },
  { eng: 'Kenya', it: 'Kenya' },
  { eng: 'Kiribati', it: 'Kiribati' },
  { eng: 'Korea', it: 'Corea del Nord' },
  { eng: 'Korea', it: 'Corea del Sud ' },
  { eng: 'Kosovo', it: 'Kosovo' },
  { eng: 'Kuwait', it: 'Kuwait' },
  { eng: 'Kyrgyzstan', it: 'Kirghizistan' },
  { eng: 'Laos', it: 'Laos' },
  { eng: 'Latvia', it: 'Lettonia' },
  { eng: 'Lebanon', it: 'Libano' },
  { eng: 'Lesotho', it: 'Lesotho' },
  { eng: 'Liberia', it: 'Liberia' },
  { eng: 'Libya', it: 'Libia' },
  { eng: 'Liechtenstein', it: 'Liechtenstein' },
  { eng: 'Lithuania', it: 'Lituania' },
  { eng: 'Luxembourg', it: 'Lussemburgo' },
  { eng: 'Macau', it: 'Macao' },
  { eng: 'North Macedonia', it: 'Macedonia del Nord' },
  { eng: 'Madagascar', it: 'Madagascar' },
  { eng: 'Malawi', it: 'Malawi' },
  { eng: 'Malaysia', it: 'Malaysia' },
  { eng: 'Maldives', it: 'Maldive' },
  { eng: 'Mali', it: 'Mali' },
  { eng: 'Malta', it: 'Malta' },
  { eng: 'Marshall Islands', it: 'Isole Marshall' },
  { eng: 'Martinique', it: 'Martinica' },
  { eng: 'Mauritania', it: 'Mauritania' },
  { eng: 'Mauritius', it: 'Mauritius' },
  { eng: 'Mayotte', it: 'Maiotta' },
  { eng: 'Mexico', it: 'Messico' },
  { eng: 'Micronesia', it: 'Micronesia' },
  { eng: 'Moldova', it: 'Moldavia' },
  { eng: 'Monaco', it: 'Monaco' },
  { eng: 'Mongolia', it: 'Mongolia' },
  { eng: 'Montenegro', it: 'Montenegro' },
  { eng: 'Montserrat', it: 'Montserrat' },
  { eng: 'Morocco', it: 'Marocco' },
  { eng: 'Mozambique', it: 'Mozambico' },
  { eng: 'Myanmar', it: 'Birmania ' },
  { eng: 'Namibia', it: 'Namibia' },
  { eng: 'Nauru', it: 'Nauru' },
  { eng: 'Nepal', it: 'Nepal' },
  { eng: 'Netherlands', it: 'Paesi Bassi' },
  { eng: 'New Caledonia', it: 'Nuova Caledonia' },
  { eng: 'New Zealand', it: 'Nuova Zelanda' },
  { eng: 'Nicaragua', it: 'Nicaragua' },
  { eng: 'Niger', it: 'Niger' },
  { eng: 'Nigeria', it: 'Nigeria' },
  { eng: 'Norway', it: 'Norvegia' },
  { eng: 'Oman', it: 'Oman' },
  { eng: 'Pakistan', it: 'Pakistan' },
  { eng: 'Palau', it: 'Palau' },
  { eng: 'State of Palestine', it: 'Stato di Palestina' },
  { eng: 'Panama', it: 'Panama' },
  { eng: 'Papua New Guinea', it: 'Papua Nuova Guinea' },
  { eng: 'Paraguay', it: 'Paraguay' },
  { eng: 'Peru', it: 'Perù' },
  { eng: 'Philippines', it: 'Filippine' },
  { eng: 'Pitcairn Island', it: 'Pitcairn' },
  { eng: 'Poland', it: 'Polonia' },
  { eng: 'Portugal', it: 'Portogallo' },
  { eng: 'Puerto Rico', it: 'Puerto Rico' },
  { eng: 'Qatar', it: 'Qatar' },
  { eng: 'Réunion', it: 'Riunione ' },
  { eng: 'Romania', it: 'Romania' },
  { eng: 'Russian Federation', it: 'Russia' },
  { eng: 'Rwanda', it: 'Ruanda' },
  { eng: 'Saint Kitts and Nevis', it: 'Saint Kitts e Nevis' },
  { eng: 'Saint Lucia', it: 'Saint Lucia' },
  { eng: 'Saint Vincent and the Grenadines', it: 'Saint Vincent e Grenadine' },
  { eng: 'Samoa', it: 'Samoa' },
  { eng: 'San Marino', it: 'San Marino' },
  { eng: 'Sao Tome and Príncipe', it: 'São Tomé e Príncipe' },
  { eng: 'Saudi Arabia', it: 'Arabia Saudita' },
  { eng: 'Senegal', it: 'Senegal' },
  { eng: 'Serbia', it: 'Serbia' },
  { eng: 'Seychelles', it: 'Seychelles' },
  { eng: 'Sierra Leone', it: 'Sierra Leone' },
  { eng: 'Singapore', it: 'Singapore' },
  { eng: 'Slovakia ', it: 'Slovacchia' },
  { eng: 'Slovenia', it: 'Slovenia' },
  { eng: 'Solomon Islands', it: 'Isole Salomone' },
  { eng: 'Somalia', it: 'Somalia' },
  { eng: 'South Africa', it: 'Sudafrica' },
  { eng: 'South Sudan', it: 'Sudan del Sud' },
  { eng: 'Spain', it: 'Spagna' },
  { eng: 'Sri Lanka', it: 'Sri Lanka' },
  { eng: 'Sudan', it: 'Sudan' },
  { eng: 'Suriname', it: 'Suriname' },
  { eng: 'Swaziland ', it: 'Swaziland ' },
  { eng: 'Sweden', it: 'Svezia' },
  { eng: 'Switzerland', it: 'Svizzera' },
  { eng: 'Syria', it: 'Siria' },
  { eng: 'Taiwan ', it: 'Taiwan ' },
  { eng: 'Tajikistan', it: 'Tagikistan' },
  { eng: 'Tanzania', it: 'Tanzania' },
  { eng: 'Thailand', it: 'Thailandia' },
  { eng: 'Tibet', it: 'Tibet' },
  { eng: 'Timor-Leste ', it: 'Timor Est' },
  { eng: 'Togo', it: 'Togo' },
  { eng: 'Tokelau', it: 'Tokelau' },
  { eng: 'Tonga', it: 'Tonga' },
  { eng: 'Trinidad and Tobago', it: 'Trinidad e Tobago' },
  { eng: 'Tunisia', it: 'Tunisia' },
  { eng: 'Turkey', it: 'Turchia' },
  { eng: 'Turkmenistan', it: 'Turkmenistan' },
  { eng: 'Turks and Caicos Islands', it: 'Turks e Caicos' },
  { eng: 'Tuvalu', it: 'Tuvalu' },
  { eng: 'Uganda', it: 'Uganda' },
  { eng: 'Ukraine', it: 'Ucraina' },
  { eng: 'United Arab Emirates', it: 'Emirati Arabi Uniti' },
  { eng: 'United Kingdom', it: 'Regno Unito' },
  ['United States', "Stati Uniti d'America "],
  { eng: 'Uruguay', it: 'Uruguay' },
  { eng: 'Uzbekistan', it: 'Uzbekistan' },
  { eng: 'Vanuatu', it: 'Vanuatu' },
  { eng: 'Vatican City State ', it: 'Città del Vaticano ' },
  { eng: 'Venezuela', it: 'Venezuela' },
  { eng: 'Vietnam', it: 'Vietnam' },
  { eng: 'Virgin Islands ', it: 'Isole Vergini americane' },
  { eng: 'Virgin Islands ', it: 'Isole Vergini britanniche' },
  { eng: 'Wallis and Futuna Islands', it: 'Wallis e Futuna' },
  { eng: 'Western Sahara', it: 'Sahara Occidentale' },
  { eng: 'Yemen', it: 'Yemen' },
  { eng: 'Zambia', it: 'Zambia' },
  { eng: 'Zimbabwe', it: 'Zimbabwe' },
];

const data = {
  '1': 'NORVEGIA SVIZZERA',
  '1 bis':
    'AUSTRIA BELGIO BULGARIA CIPRO CROAZIA DANIMARCA FINLANDIA GRECIA IRLANDA LUSSEMBURGO MALTA PORTOGALLO CECHIA SLOVACCHIA SLOVENIA SPAGNA SVEZIA UNGHERIA',
  '2':
    'ALGERIA ANGOLA ARABIASAUDITA ARMENIA AZERBAIDJAN BAHRAIN BOSNIA-ERZEGOVINA BURKINAFASO BURUNDI CAMERUN CANADA CAPOVERDE COMORE COREADELSUD DOMINICA EGITTO ERITREA ETIOPIA FAROE(ISOLE) GABON GEORGIA GHANA GIAPPONE GIBUTI GIORDANIA GUINEA GUINEABISSAU GUINEAEQUATORIALE HONGKONG IRAQ ISRAELE KAZAKISTAN KIRGHIZISTAN KUWAIT LIBANO MACAO MAROCCO MESSICO MOLDAVIA MONTENEGRO OMAN QATAR REPUBBLICADOMINICANA RUANDA SENEGAL SERBIA SINGAPORE TAIWAN TANZANIA THAILANDIA TOGO TUNISIA UCRAINA UGANDA UZBEKISTAN',
  '2 bis': 'ESTONIA LETTONIA LITUANIA',
  '3':
    'AFGHANISTAN ANGUILLA ANTIGUA&BARBUDA ARUBA BAHAMAS BANGLADESH BENIN BERMUDA BIELORUSSIA BOLIVIA BOTSWANA BRASILE CIAD COSTADAVORIO COSTARICA ECUADOR ELSALVADOR EMIRATI ARABI UNITI FILIPPINE GAMBIA GIAMAICA GROENLANDIA GUATEMALA HAITI HONDURAS INDIA INDONESIA KENYA LAOS LESOTHO MADAGASCAR MALAWI MALESIA MALI MAYOTTE MONTSERRAT REPUBBLICADELCONGO REP. DEM. DELCONGO SAINTKITTSANDNEVIS SAINTLUCIA SURINAME TRINIDAD&TOBAGO',
  '4':
    'ARGENTINA BHUTAN CAMBOGIA CAYMANISLANDS CILE COLOMBIA COOK(ISOLE) GUYANA GUYANA(FRANCESE) LIBERIA MALDIVE MARTINICA MAURITANIA MAURITIUS MONGOLIA MOZAMBICO NAMIBIA NEPAL NICARAGUA NIGER NIGERIA PAKISTAN PANAMA PARAGUAY PERU REUNIONISOLE SEYCHELLES SIERRALEONE SRI LANKA SUDAFRICA SWAZILAND TIMOREST TURCHIA TUVALU VENEZUELA VIETNAM WALLISFUTUNAISOLE ZAMBIA ZIMBABWE',
  '5': 'FRANCIA GERMANIA OLANDA',
  '5 bis': 'REGNOUNITO',
  '6': 'ALBANIA ANDORRA GIBILTERRA LIECHTENSTEIN MACEDONIADELNORD STATIUNITI',
  '7': 'ROMANIA',
  '8': 'POLONIA',
  '9': 'CINA',
  '10': 'CANARIE ISOLE GUERNESEY ISLANDA',
  '11': 'AUSTRALIA GRENADA GUAM MICRONESIA NUOVAZELANDA PALAU',
  '12': 'RUSSIA',
  '13':
    'BARBADOS BELIZE BRUNEI FIJIISOLE GUADALUPA JERSEY KIRIBATI NUOVACALEDONIA PAPUANUOVAGUINEA POLINESIA(FRANCESE) PORTORICO REPUBBLICACENTRAFRICANA SAINTVINCENT(EGRANADINES) SALOMONE(ISOLE) SAMOA(WESTERN) TAGIKISTAN TONGA(ISOLE) URUGUAY VANUATU',
};

function translate() {
  const translationSearch = new Fuse(countryTranslations, {
    includeScore: true,
    shouldSort: true,
    threshold: 0.5,
    keys: ['it'],
  });

  return Object.keys(data).reduce((result, zone) => {
    result[zone] = data[zone].split(' ').map(it => {
      const matches = translationSearch.search(it);

      if (!matches.length) {
        return '???????????????' + it;
      }

      return matches[0].item['eng'];
    });

    return result;
  }, {});
}

const translatedData = {
  'Zone 1': ['Norway', 'Switzerland'],
  'Zone 2': [
    'Algeria',
    'Angola',
    'Saudi Arabia',
    'Armenia',
    'Azerbaijan',
    'Bahrain',
    'Bosnia and Herzegovina',
    'Burkina Faso',
    'Burundi',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Comoros',
    'Korea',
    'Dominica',
    'Egypt',
    'Eritrea',
    'Ethiopia',
    'Faroe Islands',
    'Gabon',
    'Georgia',
    'Ghana',
    'Japan',
    'Djibouti',
    'Jordan',
    'Guinea',
    'Guinea-Bissau',
    'Equatorial Guinea',
    'Hong Kong',
    'Iran',
    'Israel',
    'Kazakhstan',
    'Kyrgyzstan',
    'Kuwait',
    'Lebanon',
    'Macau',
    'Morocco',
    'Mexico',
    'Moldova',
    'Montenegro',
    'Oman',
    'Qatar',
    'Dominican Republic',
    'Rwanda',
    'Senegal',
    'Serbia',
    'Singapore',
    'Taiwan ',
    'Tanzania',
    'Thailand',
    'Togo',
    'Tunisia',
    'Ukraine',
    'Uganda',
    'Uzbekistan',
  ],
  'Zone 3': [
    'Afghanistan',
    'Anguilla',
    'Antigua and Barbuda',
    'Aruba',
    'Bahamas',
    'Bangladesh',
    'Benin',
    'Bermuda',
    'Belarus',
    'Bolivia',
    'Botswana',
    'Brazil',
    'Chad',
    'Costa Rica',
    'Costa Rica',
    'Ecuador',
    'El Salvador',
    'United Arab Emirates',
    'Saudi Arabia',
    'Tunisia',
    'Philippines',
    'Gambia',
    'Jamaica',
    'Greenland',
    'Guatemala',
    'Haiti',
    'Honduras',
    'India',
    'Indonesia',
    'Kenya',
    'Laos',
    'Lesotho',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Mali',
    'Mayotte',
    'Montserrat',
    'Congo',
    'Central African Republic',
    'Dominica',
    'Congo',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Suriname',
    'Trinidad and Tobago',
  ],
  'Zone 4': [
    'Argentina',
    'Bhutan',
    'Cambodia',
    'Cayman Islands',
    'Chile',
    'Colombia',
    'Cook Islands',
    'Guyana',
    'French Guiana',
    'Liberia',
    'Maldives',
    'Martinique',
    'Mauritania',
    'Mauritius',
    'Mongolia',
    'Mozambique',
    'Namibia',
    'Nepal',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Pakistan',
    'Panama',
    'Paraguay',
    'Peru',
    'Réunion',
    'Seychelles',
    'Sierra Leone',
    'Sri Lanka',
    'Sri Lanka',
    'South Africa',
    'Swaziland ',
    'East Timor ',
    'Turkey',
    'Tuvalu',
    'Venezuela',
    'Vietnam',
    'Wallis and Futuna Islands',
    'Zambia',
    'Zimbabwe',
  ],
  'Zone 5': ['France', 'Germany', 'Iceland'],
  'Zone 6': [
    'Albania',
    'Andorra',
    'Gibraltar',
    'Liechtenstein',
    'North Macedonia',
    'Mauritius',
  ],
  'Zone 7': ['Romania'],
  'Zone 8': ['Poland'],
  'Zone 9': ['China'],
  'Zone 10': ['Canada', 'Cayman Islands', 'Guernsey', 'Iceland'],
  'Zone 11': [
    'Australia',
    'Grenada',
    'Guam',
    'Micronesia',
    'New Zealand',
    'Palau',
  ],
  'Zone 12': ['Russian Federation'],
  'Zone 13': [
    'Barbados',
    'Belize',
    'Brunei',
    'Cayman Islands',
    'Guadeloupe',
    'Seychelles',
    'Kiribati',
    'New Caledonia',
    'Papua New Guinea',
    'French Polynesia',
    'Portugal',
    'Central African Republic',
    'Saint Vincent and the Grenadines',
    'Solomon Islands',
    'American Samoa',
    'Tajikistan',
    'Tonga',
    'Uruguay',
    'Vanuatu',
  ],
  'Zone 1 – with VAT tax': [
    'Austria',
    'Belgium',
    'Bulgaria',
    'Cyprus',
    'Croatia',
    'Denmark',
    'Finland',
    'Greece',
    'Ireland',
    'Luxembourg',
    'Malta',
    'Portugal',
    'Czechia',
    'Slovakia ',
    'Slovenia',
    'Spain',
    'Sweden',
    'Hungary',
  ],
  'Zone 2 – with VAT tax': ['Estonia', 'Latvia', 'Lithuania'],
  'Zone 5 – with VAT tax': ['United Kingdom'],
};

function nameToIso() {
  const isoSearch = new Fuse(countryData, {
    includeScore: true,
    shouldSort: true,
    threshold: 0.5,
    keys: ['name'],
  });

  return Object.entries(translatedData).reduce(
    (isoEntries, [zone, countries]) => {
      isoEntries[zone] = countries.map(country => {
        const matches = isoSearch.search(country);

        if (matches.length === 0) return '?!' + country;

        return matches[0].item['alpha-3'];
      }, []);

      return isoEntries;
    },
    {},
  );
}

const isoEntries = nameToIso(translatedData);
console.log(JSON.stringify(isoEntries));

const ITA = {
  postalServiceName: 'Poste Italiane',
  priceTableSpecification: {
    currency: 'EUR',
    deliveryZoneNames: [
      'Zone 1',
      'Zone 1 – with VAT tax',
      'Zone 2',
      'Zone 2 – with VAT tax',
      'Zone 3',
      'Zone 4',
      'Zone 5',
      'Zone 5 – with VAT tax',
      'Zone 6',
      'Zone 7 – with VAT tax',
      'Zone 8 – with VAT tax',
      'Zone 9',
      'Zone 10',
      'Zone 11',
      'Zone 12',
      'Zone 13',
    ],
    weightIntervals: [1000, 3000, 5000, 10000, 15000, 20000, 26000, 30000],
  },
  deliveryZones: {
    'Zone 1': ['NOR', 'CHE'],
    'Zone 1 – with VAT tax': [
      'AUT',
      'BEL',
      'BGR',
      'CYP',
      'HRV',
      'DNK',
      'FIN',
      'GRC',
      'IRL',
      'LUX',
      'MLT',
      'PRT',
      'CZE',
      'SVK',
      'SVN',
      'ESP',
      'SWE',
      'HUN',
    ],
    'Zone 2': [
      'DZA',
      'AGO',
      'SAU',
      'ARM',
      'AZE',
      'BHR',
      'BIH',
      'BFA',
      'BDI',
      'CMR',
      'CAN',
      'CPV',
      'COM',
      'PRK',
      'DMA',
      'EGY',
      'ERI',
      'ETH',
      'FRO',
      'GAB',
      'GEO',
      'GHA',
      'JPN',
      'DJI',
      'JOR',
      'GIN',
      'GNB',
      'GNQ',
      'HKG',
      'IRN',
      'ISR',
      'KAZ',
      'KGZ',
      'KWT',
      'LBN',
      'MAC',
      'MAR',
      'MEX',
      'MDA',
      'MNE',
      'OMN',
      'QAT',
      'DOM',
      'RWA',
      'SEN',
      'SRB',
      'SGP',
      'TWN',
      'TZA',
      'THA',
      'TGO',
      'TUN',
      'UKR',
      'UGA',
      'UZB',
    ],
    'Zone 2 – with VAT tax': ['EST', 'LVA', 'LTU'],
    'Zone 3': [
      'AFG',
      'AIA',
      'ATG',
      'ABW',
      'BHS',
      'BGD',
      'BEN',
      'BMU',
      'BLR',
      'BOL',
      'BWA',
      'BRA',
      'TCD',
      'CRI',
      'CRI',
      'ECU',
      'SLV',
      'ARE',
      'SAU',
      'TUN',
      'PHL',
      'GMB',
      'JAM',
      'GRL',
      'GTM',
      'HTI',
      'HND',
      'IND',
      'IDN',
      'KEN',
      'LAO',
      'LSO',
      'MDG',
      'MWI',
      'MYS',
      'MLI',
      'MYT',
      'MSR',
      'COG',
      'CAF',
      'DMA',
      'COG',
      'KNA',
      'LCA',
      'SUR',
      'TTO',
    ],
    'Zone 4': [
      'ARG',
      'BTN',
      'KHM',
      'CYM',
      'CHL',
      'COL',
      'COK',
      'GUY',
      'GUF',
      'LBR',
      'MDV',
      'MTQ',
      'MRT',
      'MUS',
      'MNG',
      'MOZ',
      'NAM',
      'NPL',
      'NIC',
      'NER',
      'NGA',
      'PAK',
      'PAN',
      'PRY',
      'PER',
      'REU',
      'SYC',
      'SLE',
      'LKA',
      'LKA',
      'ZAF',
      'THA',
      '?!East Timor ',
      'TUR',
      'TUV',
      'VEN',
      'VNM',
      'WLF',
      'ZMB',
      'ZWE',
    ],
    'Zone 5': ['GBR'],
    'Zone 5 – with VAT tax': ['FRA', 'DEU', 'ISL'],
    'Zone 6': ['ALB', 'AND', 'GIB', 'LIE', 'MKD', 'MUS'],
    'Zone 7 – with VAT tax': ['ROU'],
    'Zone 8 – with VAT tax': ['POL'],
    'Zone 9': ['CHN'],
    'Zone 10': ['CAN', 'CYM', 'GGY', 'ISL'],
    'Zone 11': ['AUS', 'GRD', 'GUM', 'FSM', 'NZL', 'PLW'],
    'Zone 12': ['RUS'],
    'Zone 13': [
      'BRB',
      'BLZ',
      'BRN',
      'CYM',
      'GLP',
      'SYC',
      'KIR',
      'NCL',
      'PNG',
      'PYF',
      'PRT',
      'CAF',
      'VCT',
      'SLB',
      'ASM',
      'TJK',
      'TON',
      'URY',
      'VUT',
    ],
  },
  deliveryServices: [
    {
      id: 'standard',
      tracked: true,
      name: 'International Express',
      serviceAvailability: ['all'],
      priceTable: [
        [
          34,
          39.34,
          46.96,
          57.65,
          46.85,
          43.7,
          32.7,
          29.3,
          40,
          38.64,
          35.59,
          40.9,
          33.5,
          44.7,
          43.93,
          43.7,
        ],
        [
          37.98,
          41.18,
          49.95,
          61.31,
          50.63,
          49.2,
          35.4,
          40.14,
          44,
          40.66,
          37.61,
          45,
          37.98,
          49,
          49.85,
          59,
        ],
        [
          45.6,
          50.33,
          68.72,
          84.18,
          72.41,
          63.5,
          42.4,
          48.68,
          63.9,
          48.8,
          44.74,
          63,
          45.6,
          65,
          70.55,
          90,
        ],
        [
          57.73,
          68.32,
          92.16,
          112.55,
          100.67,
          94,
          68.32,
          58.5,
          89.9,
          62.01,
          56.94,
          84.38,
          63,
          110,
          100.3,
          158,
        ],
        [
          72,
          78.08,
          124.65,
          152.5,
          139.59,
          136,
          89.06,
          75.5,
          116,
          82.96,
          68.11,
          118,
          84,
          151,
          166,
          233,
        ],
        [
          86,
          101.26,
          157.59,
          192.15,
          179.24,
          179.24,
          113.46,
          95.5,
          147.29,
          93.94,
          81.34,
          153.77,
          106,
          216,
          182.8,
          304,
        ],
        [
          90,
          111.02,
          211,
          259.86,
          243,
          230,
          120.78,
          101.5,
          198,
          101.66,
          106.54,
          207,
          106,
          220,
          247.5,
          304,
        ],
        [
          99,
          123.53,
          238.5,
          292.8,
          270,
          247.5,
          123.53,
          103.75,
          232,
          111.02,
          118.74,
          234,
          106,
          247,
          275,
          304,
        ],
      ],
    },
  ],
};

/*
34,00
39,34
46,96
57,65
46,85
43,70
32,70
29,30 
40,00
38,64
35,59
40,90
33,50
44,70
43,93
43,70



37,98
41,18
49,95
61,31
50,63
49,20
35.40
40,14
44,00
40,66
37,61
45,00
37,98
49,00
49,85
59,00



45,60
50,33
68,72
84,18
72,41
63,50
42,40
48,68
63,90
48,80
44,74
63,00
45,60
65,00
70,55
90,00



57,73
68,32
92,16
112,55
100,67
94,00
68,32
58,50
89,90
62,01
56,94
84,38
63,00
110,00
100,30
158,00



72,00
78,08
124,65
152,50
139,59
136,00
89,06
75,50
116,00
82,96
68,11
118,00
84,00
151,00
166,00
233,00



86,00
101,26
157,59
192,15
179,24
179,24
113,46
95,50
147,29
93,94
81,34
153,77
106,00
216,00
182,80
304,00



90,00
111,02
211,00
259,86
243,00
230,00
120,78
101,50
198,00
101,66
106,54
207,00
106,00
220,00
247,50
304,00



99,00
123,53
238,50
292,80
270,00
247,50
123,53
103,75
232,00
111,02
118,74
234,00
106,00
247,00
275,00
304,00















*/
