const { readFile, writeFile } = require('fs');
const Fuse = require('fuse.js');
const translation = require('./translation.json');
const path = require('path');
const { alpha2ToAlpha3 } = require('i18n-iso-countries');

const translate = new Fuse(translation, {
  shouldSort: true,
  threshold: 0.5,
  keys: ['name'],
});

readFile(path.join(__dirname, './poland-data.csv'), 'utf8', (err, data) => {
  if (err) throw err;

  writeFile(
    path.join(__dirname, './zones.json'),
    JSON.stringify(
      data
        .split('\n')
        .map(r => {
          const [n, name, eu, pu] = r.split(',');
          const e = eu.trim();
          const p = pu.trim();

          const matches = translate.search(name);

          if (matches.length === 0) return undefined;

          return [matches[0].item['iso2'], e, p];
        })
        .filter(Boolean)
        .reduce(
          (result, [iso2, e, p]) => {
            const iso3 = alpha2ToAlpha3(iso2);

            if (e) {
              result.economy[e] = result.economy[e] || [];
              result.economy[e].push(iso3);
            }

            if (p) {
              result.priority[p] = result.priority[p] || [];
              result.priority[p].push(iso3);
            }

            return result;
          },
          {
            economy: {},
            priority: {},
          },
        ),
      null,
      2,
    ),
    err => {
      if (err) throw err;
      console.log('Successful write.');
    },
  );
});
