"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPage = void 0;

var _container = _interopRequireDefault(require("./container"));

var _render = _interopRequireDefault(require("./render"));

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import ReactReconciler from "react-reconciler";
// console.log(ReactReconciler);
const createPage = function createPageConfig(component) {
  const config = {
    data: {
      root: {
        children: []
      }
    },

    onLoad() {
      this.container = new _container.default(this, "root");

      const pageElement = /*#__PURE__*/_react.default.createElement(component, {
        page: this
      });

      (0, _render.default)(pageElement, this.container);
    }

  };
  return config;
};

exports.createPage = createPage;