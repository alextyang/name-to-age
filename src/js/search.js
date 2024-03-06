
const resultDiv = document.getElementById('result');

const searchEl = document.getElementById('input-name');
searchEl.addEventListener("keyup", ({ key }) => {
    if (key === "Enter")
        searchName(searchEl.value);
    else
        suggestNames(searchEl.value);
})

function searchName(name) {
    isValidName(name).then((isValid) => {
        if (!isValid)
            console.log("[Info] Not a known name.");
        console.log("[Info] Searching for " + name + ".");

        fetchNameData(name).then((nameData) => {
            resultDiv.textContent = yearToAge(calculateMode(nameData));
        });
    });
}

function yearToAge(year) {
    const date = new Date();
    const currentYear = date.getFullYear() - (date.getMonth() < 6 ? 1 : 0);

    return currentYear - year;
}

function calculateMode(nameData) {
    var maxYear, maxFreq = 0;
    Object.keys(nameData).forEach((year) => {
        if (maxFreq < nameData[year])
            maxYear = year;
    });

    return maxYear || -1;
}

function suggestNames(value) {

}

async function fetchNameData(name) {
    const response = await fetch("./src/data/names/" + name + ".json");
    const json = await response.json();
    return json;
}

async function isValidName(name) {
    const nameList = await fetchListOfNames();
    return nameList.includes(name);
}

async function fetchListOfNames() {
    const response = await fetch("./src/data/names.json");
    const json = await response.json();
    return json;
}