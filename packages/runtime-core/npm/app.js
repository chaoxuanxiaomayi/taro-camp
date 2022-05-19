// import ReactReconciler from "react-reconciler";
// console.log(ReactReconciler);

import Container from "./container";
import render from "./render";
import React from "react";

export const createPage = function createPageConfig(component) {
   const config = {
   	data: {
   		root: {
   			children: [],
   		},
   	},
   	onLoad() {
   		this.container = new Container(this, "root");
   		const pageElement = React.createElement(component, {
   			page: this,
   		});
   		render(pageElement, this.container);
   	},
   };

   return config;
};