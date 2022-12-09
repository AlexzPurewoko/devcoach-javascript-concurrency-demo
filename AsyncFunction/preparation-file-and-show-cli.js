import htmlToCli from 'cli-html';
import extract from 'extract-zip';
import fs from 'fs';
import process from 'process';


async function main() {
    try {
        const pathZip = './Data/books.zip';

        isZipFileExist(pathZip);
        const extractedPath = await doExtract(pathZip);
        const dataReaded = readFileFromPath(extractedPath);
        const buildedHTML = buildHTML(dataReaded);

        console.log(
            htmlToCli(buildedHTML)
        );
    } catch (error) {
        console.error(error);
    }
}

main();

function buildHTML(booksData) {
    return booksData.map((item) => {
                return `
                    <div>
                        <h2>${item.name}</h1>
                        <b> Price is : ${item.price} </b>
                        <br>
                        <b> Description : </b>
                        <p> ${item.description} </p>
                    </div>
                `;
            }).join('');
}

function readFileFromPath(path) {
    return JSON.parse(fs.readFileSync(`${path}/books.json`));
}

async function doExtract(path) {
    const extractedPath = `${process.cwd()}/extracted/books`;
    await extract(path, {
        dir: extractedPath
    });

    return extractedPath;
}

function isZipFileExist(path) {
    if (!fs.existsSync(path)) {
        throw new Error(`File with path ${path} is doesn't exists`);
    }
}