
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _app = _interopRequireWildcard(require("../../npm/app.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class Index extends _app.Component {
  constructor() {
    super();
    this.state = {
      count: 0
    };
    this.onAddClick = this.onAddClick.bind(this);
    this.onReduceClick = this.onReduceClick.bind(this);
  }

  componentDidMount() {
    console.log('执行componentDidMount');
    this.setState({
      count: 1
    });
  }

  onAddClick() {
    this.setState({
      count: this.state.count + 1
    });
  }

  onReduceClick() {
    this.setState({
      count: this.state.count - 1
    });
  }

  createData() {
    this.__state = arguments[0];
    const text = this.state.count % 2 === 0 ? '偶数' : '奇数';
    Object.assign(this.__state, {
      text: text
    });
    return this.__state;
  }

}

exports.default = Index;

_defineProperty(Index, "$$events", ["onAddClick", "onReduceClick"]);    
Page(require('../../npm/app.js').createPage(Index))
    