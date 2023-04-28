function splitResponse(response: string): string[] {
  const maxLength = 2000;
  const chunks = [];

  while (response.length > maxLength) {
    let chunk = response.slice(0, maxLength);
    response = response.slice(maxLength);

    // Make sure not to cut a word in half when splitting the response
    const lastSpaceIndex = chunk.lastIndexOf(' ');
    if (lastSpaceIndex !== -1) {
      response = chunk.slice(lastSpaceIndex + 1) + response;
      chunk = chunk.slice(0, lastSpaceIndex);
    }

    chunks.push(chunk);
  }

  if (response.length > 0) {
    chunks.push(response);
  }

  return chunks;
}

module.exports = { splitResponse };
