function containsURL(str: string): boolean {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  );
  return !!urlPattern.test(str);
}

function extractURLs(text: string): string[] {
  const urlRegex = /https?:\/\/(?:www\.|(?!www))[^\s]+\.[^\s]+/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

module.exports = { containsURL, extractURLs };
