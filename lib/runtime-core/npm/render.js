"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactReconcilerInst = void 0;
exports.default = render;

var _reactReconciler = _interopRequireDefault(require("react-reconciler"));

var _hostConfig = _interopRequireDefault(require("./hostConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ReactReconcilerInst = (0, _reactReconciler.default)(_hostConfig.default);
exports.ReactReconcilerInst = ReactReconcilerInst;

function render(rootElement, container) {
  if (!container._rootContainer) {
    container._rootContainer = ReactReconcilerInst.createContainer(container, 0, false, null);
  }

  ReactReconcilerInst.updateContainer(rootElement, container._rootContainer, null, () => {});
}