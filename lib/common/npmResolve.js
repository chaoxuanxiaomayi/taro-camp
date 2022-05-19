"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = npmResolve;
exports.parseCode = parseCode;

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var _generator = _interopRequireDefault(require("@babel/generator"));

var _parser = require("@babel/parser");

var _path = _interopRequireDefault(require("path"));

var fse = _interopRequireWildcard(require("fs-extra"));

var t = _interopRequireWildcard(require("@babel/types"));

var _const = require("../runtime-core/const");

var _babel = _interopRequireDefault(require("./babel"));

var _utils = _interopRequireDefault(require("./utils"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseCode(code, extname = "jsx") {
  const plugins = ["classProperties", "objectRestSpread", "optionalChaining", ["decorators", {
    decoratorsBeforeExport: true
  }], "classPrivateProperties", "doExpressions", "exportDefaultFrom", "exportNamespaceFrom", "throwExpressions"];

  if (extname === ".ts") {
    plugins.push("typescript");
  } else if (extname === ".tsx") {
    plugins.push("typescript");
    plugins.push("jsx");
  } else {
    plugins.push("flow");
    plugins.push("jsx");
  }

  return (0, _parser.parse)(code, {
    sourceType: "module",
    plugins
  });
}

const fileContent = new Map();

function judgeLibPath(relativePath) {
  if (relativePath.startsWith("/") || relativePath.startsWith(".")) {
    return false;
  }

  return true;
}

function getDirPath(path) {
  return _path.default.resolve(path, "../");
}

function getWxNpmPath(path) {
  const npmRelativePath = (0, _utils.default)(path.replace(_path.default.join(_path.default.resolve("."), "node_modules"), ""));
  return `/npm${npmRelativePath}`;
}

function resloveWxNpmPath(path) {
  return (0, _utils.default)(_path.default.join(_const.outputDir, getWxNpmPath(path)));
}

function getWxRelativePath(path, filePath) {
  const rpath = (0, _utils.default)(_path.default.relative(getDirPath(filePath), resloveWxNpmPath(path)));
  return judgeLibPath(rpath) ? `./${rpath}` : rpath;
}

function addJsFile(name) {
  if (/\.js$/.test(name)) {
    return name;
  } else return `${name}.js`;
}

async function copyNpmToWX(filePath, npmPath, isRoot = false) {
  // react-reconciler.development.js 文件太大，且没有用到，影响拷贝性能，可以过滤掉。
  if (fileContent.has(filePath) || filePath.indexOf("react-reconciler.development") > -1) {
    return;
  }

  const code = fse.readFileSync(filePath).toString();
  const ast = parseCode(code);
  (0, _traverse.default)(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, {
        name: "require"
      })) {
        const sourcePath = path.node.arguments[0].value;

        if (judgeLibPath(sourcePath)) {
          // 如果是nodemodule下的
          let npmPath = "";
          let mainPath = "";
          let packagejson;

          if (/\//.test(sourcePath)) {
            // 如果是包下的某个路径 取出来
            npmPath = _path.default.join(_path.default.resolve("."), "node_modules", sourcePath.split("/").shift());
            mainPath = _path.default.join(_path.default.resolve("."), "node_modules", addJsFile(sourcePath));
          } else {
            npmPath = _path.default.join(_path.default.resolve("."), "node_modules", sourcePath); // 查找pkg.json的main字段的路径

            packagejson = require(_path.default.join(npmPath, "package.json"));
            mainPath = _path.default.join(npmPath, packagejson.main || "index.js");
          }

          copyNpmToWX(mainPath, npmPath);
          path.node.arguments[0].value = getWxRelativePath(mainPath, resloveWxNpmPath(filePath));
        } else if (npmPath) {
          const _filePath = _path.default.resolve(npmPath, addJsFile(sourcePath));

          copyNpmToWX(_filePath, npmPath);
        }
      }
    }

  });
  fileContent.set(filePath, {
    code: (0, _generator.default)(ast).code
  });

  if (isRoot) {
    fileContent.forEach(async (value, filePath) => {
      const _filePath = resloveWxNpmPath(filePath);

      if (!fse.existsSync(_filePath) && !fse.existsSync(getDirPath(_filePath))) {
        fse.mkdirSync(getDirPath(_filePath), {
          recursive: true
        });
      }

      const resCode = await (0, _babel.default)(value.code, _filePath);
      fse.writeFileSync(_filePath, resCode.code);
    });
  }
}

function parseNpm(sourcePath, filePath) {
  const npmPath = _path.default.join(_path.default.resolve("."), "node_modules", sourcePath);

  const packagejson = require(_path.default.join(npmPath, "package.json"));

  const mainPath = _path.default.join(npmPath, packagejson.main);

  copyNpmToWX(mainPath, npmPath, true);
  return getWxRelativePath(mainPath, filePath);
}

async function npmResolve(code, filePath) {
  // 解析
  const ast = parseCode(code); // 遍历

  (0, _traverse.default)(ast, {
    CallExpression(path) {
      if (t.isIdentifier(path.node.callee, {
        name: "require"
      })) {
        const sourcePath = path.node.arguments[0].value;

        if (judgeLibPath(sourcePath)) {
          path.node.arguments[0].value = parseNpm(sourcePath, filePath);
        }
      }
    },

    ImportDeclaration(path) {
      const sourcePath = path.node.source.value;

      if (judgeLibPath(sourcePath)) {
        path.node.source.value = parseNpm(sourcePath, filePath);
      }
    },

    MemberExpression(path) {
      if (path.get("object").matchesPattern("process.env")) {
        const key = path.toComputedKey();

        if (t.isStringLiteral(key)) {
          if (key.value === "NODE_ENV") {
            path.replaceWith(t.valueToNode("production"));
          }
        }
      }
    }

  }); // 生成

  return (0, _generator.default)(ast).code;
}