import htmlToCli from 'cli-html';
import extract from 'extract-zip';
import fs from 'fs';
import process from 'process';

isZipFileExist('./Data/books.zip')
    .then(doExtract)
    .then(readFileFromPath)
    .then(buildHTML)
    .then((htmlText) => console.log(htmlToCli(htmlText)))
    .catch(console.error)

function buildHTML(booksData) {
    return new Promise(function (resolve, reject) {
        try {
            resolve(booksData.map((item) => {
                return `
                    <div>
                        <h2>${item.name}</h1>
                        <b> Price is : ${item.price} </b>
                        <br>
                        <b> Description : </b>
                        <p> ${item.description} </p>
                    </div>
                `;
            }).join(''));
        } catch (error) {
            reject(error);
        }
    });
}

function readFileFromPath(path) {
    return new Promise(function (resolve, reject) {
        try {
            const data = fs.readFileSync(`${path}/books.json`);
            resolve(JSON.parse(data));
        } catch (error) {
            reject(error);
        }
    });
}

function doExtract(path) {
    return new Promise(function (resolve, reject) {
        const extractedPath = `${process.cwd()}/extracted/books`;

        extract(path, {
            dir: extractedPath
        })
        .then(() => resolve(extractedPath))
        .catch((err) => reject('could not extract file: '+err))
    });
}

function isZipFileExist(path) {
    return new Promise(function (resolve, reject) {
        const fileExist = fs.existsSync(path);
        if (fileExist) {
            resolve(path);
        } else {
            reject(`File with path ${path} is doesn't exists`);
        }
    })
}