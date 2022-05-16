/**
 * 
 * 
 * 这个编译过程主要由以下几步：

一、将模板经babel编译后拷贝到输出目录。

二、将每个文件编译成4种输出（json,js,wxml,wxss）到对应目录。

三、输出入口文件app.js与app.json

四、输出project.config.json
 */

import * as path from "path";
import * as fse from "fs-extra";
// const outputDir = path.resolve(__dirname, "../../dist");
// const inputRoot = path.join(path.resolve("."), "src");
import babel from "../common/babel"
import {buildSinglePage} from "../common/buildSinglePage"
import { config, outputDir, inputRoot } from './const';

/**
 * npm拷贝到输出目录
 */
async function copyNpmToWx() {
    const npmPath = path.resolve(__dirname,'./npm')
    const allFiles = await fse.readdirSync(npmPath)
    allFiles.forEach(async (fileName) => {
        const fileContent = fse.readFileSync(path.join(npmPath, fileName)).toString()
        const outputNpmPath = path.join(outputDir, `./npm/${fileName}`)
        let resCode = await babel(fileContent, outputNpmPath)
        fse.ensureDirSync(path.dirname(outputNpmPath))
        fse.writeFileSync(outputNpmPath, resCode.code)
    })
}
/**
 *  页面生成4种输出到输出目录
 */
async function buildPages() {
    config.pages.forEach(page => {
        buildSinglePage(page)
    })
}
/**
 *  输出入口文件app.js与app.json
 */
async function buildEntry() {
    fse.writeFileSync(path.join(outputDir, "./app.js"), `App({})`);
    const config = require(path.resolve(inputRoot, "app.config.js"));
    fse.writeFileSync(
        path.join(outputDir, "./app.json"),
        JSON.stringify(config, undefined, 2)
    );
}
/**
 *  输出project.config.json
 */
async function buildProjectConfig() {
  fse.writeFileSync(
    path.join(outputDir, "project.config.json"),
    `
{
    "miniprogramRoot": "./",
    "projectname": "app",
    "description": "app",
    "appid": "touristappid",
    "setting": {
        "urlCheck": true,
        "es6": false,
        "postcss": false,
        "minified": false
    },
    "compileType": "miniprogram"
}
    `
  );
}
/**
 *  检查目录等准备工作
 */
async function init() {
  fse.removeSync(outputDir);
  fse.ensureDirSync(outputDir);
}

async function main() {
  // 检查目录等准备工作
  await init();
  // npm拷贝到输出目录
  await copyNpmToWx();
  // 页面生成4种输出到输出目录
  await buildPages();
  // 输出入口文件app.js与app.json
  await buildEntry();
  // 输出project.config.json
  await buildProjectConfig();
}
main();
