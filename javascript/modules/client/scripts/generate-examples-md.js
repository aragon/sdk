const fs = require("fs");
const { argv } = require("process");
const regex = /(\/\* MARKDOWN)(.|\n)*?(\*\/\n)/g;
const removeStrings = ["/* MARKDOWN\n", "*/"];
const glob = require("glob");

generateExamplesMd().catch(err => {
  console.error(err);
  process.exit(1);
});

async function generateExamplesMd() {
  const path = argv[2];
  const outputFile = argv[3];
  if (!path || !outputFile) {
    console.error(
      "Usage:  node generate-examples-md.js <examples-folder> <output-file.md>"
    );
    process.exit(1);
  }
  glob(path + "/**/*.ts", {}, async (err, files) => {
    const proms = files.map(file => {
      return fs.promises
        .readFile(file)
        .then(data => parseData(data))
        .then(tokens => processTokens(tokens));
    });
    const segments = await Promise.all(proms);
    fs.promises.writeFile(outputFile, segments.join("\n"));
  });
}

function processTokens(tokens) {
  let content = "";
  for (const token of tokens) {
    switch (token.type) {
      case "code":
        content += `\n\`\`\`ts\n` + token.content.trim() + `\n\`\`\`\n`;
        break;
      case "markdown":
        content += token.content.trim();
        break;
      default:
        throw new Error("invalid token type");
    }
  }
  return content;
}

function parseData(data) {
  const str = data.toString();
  const matches = str.matchAll(regex);
  const tokens = [];
  let previousEnd = 0;
  for (let match of matches) {
    if (previousEnd !== match.index) {
      tokens.push({
        type: "code",
        content: str.slice(previousEnd, match.index),
      });
    }
    let content = match[0];
    for (let str of removeStrings) {
      content = content.replace(str, "");
    }
    tokens.push({
      type: "markdown",
      content: content,
    });
    previousEnd = match[0].length;
  }
  if (previousEnd !== str.length) {
    tokens.push({
      type: "code",
      content: str.slice(previousEnd, str.length),
    });
  }
  return tokens;
}
