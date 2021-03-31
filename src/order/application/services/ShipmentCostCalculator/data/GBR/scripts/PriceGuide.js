/* Price table structure:

      | Europe  WZ1 WZ2 WZ3 => each row = 4 entries
______|____________________________________________
0.1kg |
0.25kg|
0.5kg |
0.75kg|
1kg   |
1.25kg|
1.5kg |
2kg   |
*/

// Price extraction:
const chunk = (arr, n) =>
  Array.from(Array(Math.ceil(arr.length / 4)), (_, i) =>
    arr.slice(i * n, i * n + n),
  );

const prices = `price
price 
price 
...`
  .split('\n')
  .map(str => parseFloat(str))
  .map(num => num * 1.38)
  .map(num => Math.round((num + Number.EPSILON) * 100) / 100);

chunk(prices, 4 /* some number */);
