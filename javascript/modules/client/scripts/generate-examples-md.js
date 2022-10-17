const fs = require("fs");
const { argv } = require("process");
const regex = /(\/\* MARKDOWN)(.|\n)*?(\*\/\n)/g;
const removeStrings = ["/* MARKDOWN\n", "*/"];

generateExamplesMd();

async function generateExamplesMd() {
  const path = argv[2];
  const outputFile = argv[3];
  if (!path || !outputFile) {
    console.error(
      "Usage:  node generate-examples-md.js <examples-folder> <output-file.md>"
    );
    process.exit(1);
  }
  const files = getFileNames(path);
  if (fs.existsSync(outputFile)) {
    await fs.promises.rm(outputFile);
  }
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    fs.readFile(file, async (err, data) => {
      if (err) throw err;
      try {
        const tokens = parseData(data);
        const content = processTokens(tokens);
        await fs.promises.appendFile(outputFile, content);
      } catch (error) {
        console.error(file);
        console.error(error);
      }
    });
  }
}

function processTokens(tokens) {
  let content = "";
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token.type) {
      case "code":
        content += `\n\`\`\`ts\n` + token.content + `\n\`\`\`\n`;
        break;
      case "markdown":
        content += token.content;
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

function getFileNames(rootPath) {
  let ret = [];
  let paths = fs.readdirSync(rootPath, { withFileTypes: true });
  for (const path of paths) {
    if (path.isDirectory()) {
      const folderPath = rootPath + "/" + path.name;
      let files = fs.readdirSync(folderPath);
      files = prependString(folderPath + "/", files);
      ret = [...ret, ...files];
    }
  }
  return ret;
}

function prependString(str = "", arr = []) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = str + arr[i];
  }
  return arr;
}
