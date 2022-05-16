"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = void 0;
exports.createPage = createPage;

class Component {
  constructor() {
    this.state = {};
  }

  setState(state) {
    update(this.$scope.$component, state);
  }

  _init(scope) {
    this.$scope = scope;
  }

}

exports.Component = Component;

function update($component, state = {}) {
  $component.state = Object.assign($component.state, state);
  let data = $component.createData(state);
  data["$taroCompReady"] = true;
  $component.state = data;
  $component.$scope.setData(data);
}

function createPage(ComponentClass) {
  const componentInstance = new ComponentClass();
  const initData = componentInstance.state;
  const option = {
    data: initData,

    onLoad() {
      this.$component = new ComponentClass();

      this.$component._init(this);

      update(this.$component, this.$component.state);
    },

    onReady() {
      if (typeof this.$component.componentDidMount === "function") {
        this.$component.componentDidMount();
      }
    }

  };
  const events = ComponentClass["$$events"];

  if (events) {
    events.forEach(eventHandlerName => {
      if (option[eventHandlerName]) return;

      option[eventHandlerName] = function () {
        this.$component[eventHandlerName].call(this.$component);
      };
    });
  }

  return option;
}

module.exports = {
  createPage,
  Component
};