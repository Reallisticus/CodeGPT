function splitResponse(response: string): string[] {
  const maxLength = 2000;
  const chunks = [];

  while (response.length > maxLength) {
    let chunk = response.slice(0, maxLength);
    response = response.slice(maxLength);

    // Make sure not to cut a word in half when splitting the response
    const lastSpaceIndex = chunk.lastIndexOf(" ");
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

function extractKeywords(text: string): any {
  const keywords = {
    variables: [] as string[],
    fileNames: [] as string[],
    functionNames: [] as string[],
    lineNumbers: [] as number[],
  };

  // Extract variable names
  const variableRegex = /(?:const|let|var)\s+([\w$]+)/g;
  let variableMatch: RegExpExecArray | null;
  while ((variableMatch = variableRegex.exec(text)) !== null) {
    keywords.variables.push(variableMatch[1]);
  }

  // Extract file names
  const fileNameRegex = /[\w-]+(\.js|\.ts)/g;
  let fileNameMatch: RegExpExecArray | null;
  while ((fileNameMatch = fileNameRegex.exec(text)) !== null) {
    keywords.fileNames.push(fileNameMatch[0]);
  }

  // Extract function names
  const functionNameRegex = /(?:function|def)\s+([\w$]+)/g;
  let functionNameMatch: RegExpExecArray | null;
  while ((functionNameMatch = functionNameRegex.exec(text)) !== null) {
    keywords.functionNames.push(functionNameMatch[1]);
  }

  // Extract line numbers
  const lineNumberRegex = /line\s+(\d+)/gi;
  let lineNumberMatch: RegExpExecArray | null;
  while ((lineNumberMatch = lineNumberRegex.exec(text)) !== null) {
    keywords.lineNumbers.push(parseInt(lineNumberMatch[1], 10));
  }

  return keywords;
}

module.exports = { splitResponse, extractKeywords };
