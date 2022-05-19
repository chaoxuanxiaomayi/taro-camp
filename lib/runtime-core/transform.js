"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = tarnsform;

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var t = _interopRequireWildcard(require("@babel/types"));

var fse = _interopRequireWildcard(require("fs-extra"));

var npath = _interopRequireWildcard(require("path"));

var _npmResolve = require("../common/npmResolve");

var _generator = _interopRequireDefault(require("@babel/generator"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TARO_COMPONENTS_NAME = "@taro/components";

function tarnsform(options) {
  let code = options.code;
  const sourceDirPath = options.sourceDirPath;
  const relativeComponentsPath = options.relativeComponentsPath;
  const ast = (0, _npmResolve.parseCode)(code);
  let outTemplate = null;
  let style = null;
  let result = {};
  let className = "";
  (0, _traverse.default)(ast, {
    ClassDeclaration(path) {
      className = path.node.id.name;
    },

    JSXAttribute(path) {
      const node = path.node;
      const attributeName = node.name.name;

      if (attributeName === "className") {
        path.node.name.name = "class";
      }

      if (attributeName === "onClick") {
        path.node.name.name = "bindtap";
      }
    },

    ImportDeclaration(path) {
      const source = path.node.source.value;

      if (source === TARO_COMPONENTS_NAME) {
        path.node.source.value = relativeComponentsPath;
      }

      if (/css$/.test(source)) {
        let cssPath = npath.join(sourceDirPath, source);
        style = fse.readFileSync(cssPath).toString().replace(/px/g, "rpx");
      }
    }

  });
  outTemplate = `
<import src="/base.wxml"/>
<template is="TPL" data="{{root: root}}" />
    `;
  ast.program.body = ast.program.body.filter(item => !(t.isImportDeclaration(item) && /css$/.test(item.source.value)));
  code = (0, _generator.default)(ast).code;
  result.code = code;
  result.json = `
{
    "usingComponents": {}
}
    `;
  result.wxml = outTemplate;
  result.style = style;
  result.className = className;
  return result;
}