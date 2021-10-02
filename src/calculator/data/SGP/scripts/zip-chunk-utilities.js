function zip(multiarray) {
  return Array(multiarray.length)
    .fill([])
    .map((_, i) => multiarray.map(r => r[i]));
}

function chunk(arr, size) {
  const chunks = [];

  while (arr.length) {
    chunks.push(inner(arr, size));
  }

  function inner(arr, size) {
    return arr.splice(0, size);
  }

  return chunks;
}
