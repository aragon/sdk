
exports.stripTags = stripTags

function stripTags(input) {
    // Replace HTML entities with their corresponding characters
    var decodedInput = input.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Remove <p> tags
    return decodedInput.replace(/<\/?p>/ig, "");
}

  