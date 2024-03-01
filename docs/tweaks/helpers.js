exports.toLowerCase = toLowerCase;
exports.stripTags = stripTags;
exports.extractText = extractText;

function stripTags(input) {
  // Replace HTML entities with their corresponding characters
  const decodedInput = input.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  // Remove <p> tags
  return decodedInput.replace(/<\/?p>/gi, "");
}

function toLowerCase(input) {
  return input.toLowerCase();
}

function extractText(input) {
  // Keep only alphabetic characters (a-z, A-Z)
  return input.match(/[a-zA-Z0-9]+/g).join("");
}
