/*

Rates: (copy and pase the part starting with EUR1, include newlines (\n))

Standard parcel
EUR1 13.00 19.50 25.00 34.00 
EUR2 18.50 25.00 31.00 40.00 
ROW 29.30 46.80 83.30 145.30 

Registered parcel (item cost up to €100)
EUR1 15.50 22.00 27.50 36.50 
EUR2 21.00 27.50 33.50 42.50 
ROW 31.80 49.30 85.80 147.80 

Registered parcel (item cost up to €500)
EUR1 18.00 24.50 30.00 39.00 
EUR2 23.50 30.00 36.00 45.00 
ROW 34.30 51.80 88.30 150.30 

Registered parcel (item cost up to €5500)
EUR1 28.00 34.50 40.00 49.00 
EUR2 33.50 40.00 46.00 55.00 
ROW 44.30 61.80 98.30 160.30
*/

function processNl(rates) {
  const [EUR1, EUR2, ROW] = rates.split('\n').map(i => i.split(' ').slice(1));
  EUR1.splice(-1, 1);
  EUR2.splice(-1, 1);
  return EUR1.map((eur1, i) => [eur1, EUR2[i], ROW[i]])
    .map(r => `[${r.map(c => c)}]`)
    .toString();
}
