import {
    BlobReader,
    BlobWriter,
    TextReader,
    TextWriter,
    ZipReader,
    ZipWriter,
} from "https://deno.land/x/zipjs/index.js";

const START_YEAR = 1880;
const END_YEAR = 2022; // Based on available SSA data

var nameDict = {};
var nameFiles = [];

for (var year = START_YEAR; year <= END_YEAR; year++) {
    fetchYear(year).then((response) => {
        const [yearStr, year] = response;
        const yearData = yearStr.split('\r\n');
        yearData.forEach((nameStr) => {
            const [name, gender, freq] = nameStr.split(',');
            if (!nameDict[name])
                nameDict[name] = {};
            if (!nameDict[name][year])
                nameDict[name][year] = 0;
            nameDict[name][year] += Number(freq); // Merge genders
        });

        if (year == END_YEAR) {
            console.log("Completed: " + Object.keys(nameDict).length + " Names")
            
            // createList();
            // createZip();
        }
    });
}

async function createList() {
    const jsonFullData = JSON.stringify(Object.keys(nameDict));
    downloadFile(jsonFullData, 'names.json', 'text/plain');
}

async function createZip() {
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    Object.keys(nameDict).forEach(async (key, index) => {
        const jsonData = JSON.stringify(nameDict[key]);
        await zipWriter.add(key + ".json", new TextReader(jsonData));
        console.log(key, index / nameDict.length);
    });

    await zipWriter.close();

    const zipFileBlob = await zipFileWriter.getData();
    downloadFile(zipFileBlob, 'names.zip', 'application/zip');
}

function downloadFile(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

async function fetchYear(year) {
    const response = await fetch("./src/data/raw/yob" + year + ".txt");
    const txt = await response.text();
    return [txt, year];
}