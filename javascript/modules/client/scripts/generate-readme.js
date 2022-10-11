const fs = require("fs");
const { argv } = require("process");
const path = argv[2];
const outputFile = argv[3];
const headerRegex = /(\/\* Header)(.|\n)*?(\*\/)/;
const codeRegex = /(\/\* Code \*\/)(.|\n)*?(\/\* - \*\/)/;
const resultRegex = /(\/\* Result)(.|\n)*?(\*\/)/;
const files = getFileNames(path);
for (const file of files) {
  fs.readFile(file, async (err, data) => {
    if (err) throw err;
    try {
      if (fs.existsSync(outputFile)) {
        await fs.promises.rm(outputFile);
      }
      const header = getText(
        data.toString(),
        headerRegex,
        ["/* Header", "*/"],
        true
      );
      const code = getText(
        data.toString(),
        codeRegex,
        ["/* Code */", "/* - */"],
        true
      );
      const result = getText(data.toString(), resultRegex, [], false);
      let readmeStr = header + `\n\`\`\`ts\n` + code + `\n\`\`\`\n`;
      if (result) {
        readmeStr = header + `\n\`\`\`ts\n` + code + result + `\n\`\`\`\n`;
      }
      await fs.promises.appendFile(outputFile, readmeStr);
    } catch (error) {
      console.error(file);
      console.error(error);
    }
  });
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
