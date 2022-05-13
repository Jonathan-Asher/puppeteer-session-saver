const puppeteer = require('puppeteer');
const fs = require('fs');

// async function run () {
//   const url = process.argv[2];
//   if (!url) {
//       throw "Please provide a URL as the first argument";
//   }
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url);
//   await uploadFileToPage(page);
//   await savePageToFile(page);
//   await page.screenshot({path: 'screenshot.png'});
//   browser.close();
// }

async function uploadFileToPage(page, filename = 'data') {
  var data = await fileToObject(filename);
  if(data.cookies)
    await page.setCookie(...data.cookies);
  await page.evaluate((data) => {
    if(data.sessionStorage)
      Object.entries(data.sessionStorage).forEach(([key,val]) => window.sessionStorage.setItem(key, val))
  }, data)
  await page.evaluate((data) => {
    if(data.localStorage)
      Object.entries(data.localStorage).forEach(([key,val]) => window.localStorage.setItem(key, val))
  }, data)
}

async function fileToObject(filename) {
  let obj;
  if(filename.indexOf('.') != -1)
    obj = JSON.parse(fs.readFileSync(filename));
  else
    obj = JSON.parse(fs.readFileSync(filename+'.json'));
  return obj;
}

async function savePageToFile(page, filename = 'data') {
  const sessionStorage = await page.evaluate(() => {
    var vals = {}
    Object.keys(window.sessionStorage).forEach(key => vals[key] = window.sessionStorage.getItem(key))
    return vals;
  })
  const localStorage = await page.evaluate(() => {
    var vals = {}
    Object.keys(window.localStorage).forEach(key => vals[key] = window.localStorage.getItem(key))
    return vals;
  })
  const result = {
    url: page.url(),
    cookies: await page.cookies(),
    sessionStorage,
    localStorage
  }
  objectToFile(result, filename);
}

async function objectToFile(obj, filename) {
  let data = JSON.stringify(obj);
  if(filename.indexOf('.') != -1)
    fs.writeFileSync(filename, data);
  else
    fs.writeFileSync(filename+'.json', data);
}

// run();

module.exports = {
  objectToFile,
  fileToObject,
  savePageToFile,
  uploadFileToPage
}