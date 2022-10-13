const fs = require("fs");
const { argv } = require("process");

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
  const mdRegex = /(\/\* MARKDOWN)(.|\n)*?(\*\/)/;
  const files = getFileNames(path);
  if (fs.existsSync(outputFile)) {
    await fs.promises.rm(outputFile);
  }
  for (const file of files) {
    fs.readFile(file, async (err, data) => {
      if (err) throw err;
      try {
        const md = getText(
          data.toString(),
          mdRegex,
          ["/* MARKDOWN", "*/"],
          true
        );
        const code = data.toString().replace(mdRegex, "");
        let readmeStr = md;
        if (code && code !== "\n") {
          readmeStr = md + `\n\`\`\`ts\n` + code + `\n\`\`\`\n`;
        }
        await fs.promises.appendFile(outputFile, readmeStr);
      } catch (error) {
        console.error(file);
        console.error(error);
      }
    });
  }
}

function getText(
  data = "",
  regex = /(.|\n)*/,
  replaceArr = [],
  throwError = false
) {
  const match = data.toString().match(regex);
  if (!match) {
    if (throwError) {
      throw new Error("could not match string, invalid format");
    }
    console.warn("could not match string, skipping");
    return;
  }
  let res = match[0];
  for (let replaceItem of replaceArr) {
    res = res.replace(replaceItem, "");
  }
  return res;
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
