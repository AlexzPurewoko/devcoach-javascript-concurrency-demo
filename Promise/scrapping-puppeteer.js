import puppeteer from "puppeteer";
import fs from 'fs';

const URL = 'https://books.toscrape.com';

puppeteer.launch({headless: false})
    .then(function (browser) {
        return browser.newPage()
            .then(executeInPage)
            .finally(() => browser.close())
    })
    .catch(console.error);

function executeInPage(page) {
    const retrievedData = [];

    return new Promise(function (resolve, reject) {
        page.goto(URL, {waitUntil: 'load'})
            .then(() => getBookURLList(page))
            .then((urls) => getBookDetail(page, urls, 0, retrievedData))
            .then((booksData) => saveBookDataToJson(booksData))
            .then(resolve)
            .catch(reject)
    });
}

// return Promise<array>
function getBookDetail(page, urls, index, outputs) {
    return new Promise(function (resolve, reject) {
        if (index >= urls.length) {
            resolve(outputs);
        }

        let data = {
            name: '',
            description: '',
            price: ''
        }

        page.goto(urls[index], {waitUntil: 'load'})

            // getting title
            .then(() => page.$('div.product_main > h1'))
            .then(function (elm) {
                return elm.getProperty('textContent');
            })
            .then(function (elmValue) {
                return elmValue.jsonValue();
            })
            .then(function (text) {
                data.name = text;
                return nextPromise();
            })

            // getting description
            .then(() => page.$('article.product_page > #product_description + p'))
            .then(function (elm) {
                return elm.getProperty('textContent');
            })
            .then(function (elmValue) {
                return elmValue.jsonValue();
            })
            .then(function (text) {
                data.description = text;
                return nextPromise();
            })

            // getting price
            .then(() => page.$('div.product_main > p.price_color'))
            .then(function (elm) {
                return elm.getProperty('textContent');
            })
            .then(function (elmValue) {
                return elmValue.jsonValue();
            })
            .then(function (text) {
                data.price = text;
                return nextPromise();
            })

            .then(function () {
                outputs.push(data);
                return nextPromise();
            })
            .then(() => getBookDetail(page, urls, ++index, outputs))
            .then(resolve)
            .catch(reject)
    })
}



function getBookURLList(page) {
    return new Promise(function (resolve, reject) {

        page.waitForSelector('article.product_pod')
            .then(function (page) {
                return page.evaluate(
                    () => Array.from(
                        document.querySelectorAll('article.product_pod > div.image_container > a'), 
                        (element) => element.getAttribute('href')
                    )
                );
            })
            .then(function (linkValues) {
                resolve(linkValues.map((item) => `${URL}/${item}`));
            })
            .catch(reject)
    });
}

function saveBookDataToJson(arrayOfBooks) {
    return new Promise(function (resolve, reject) {
        const jsonString = JSON.stringify(arrayOfBooks);
        if(!fs.existsSync('./Data')){
            fs.mkdirSync('./Data');
        }
        fs.writeFile('./Data/books.json', jsonString, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })

    })
}

function nextPromise() {
    return new Promise((resolve) => resolve());
}