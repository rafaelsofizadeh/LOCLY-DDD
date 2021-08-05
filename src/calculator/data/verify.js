console.log(
  JSON.stringify(
    Object.entries(require('./price-guide.json'))
      .filter(
        ([key, value]) =>
          Object.values(value.deliveryZones)
            .reduce((arr, zone) => arr.concat(zone), [])
            .includes('GBR') === false,
      )
      .map(([key]) => key),
    null,
    2,
  ),
);
