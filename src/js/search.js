import { renderGraph } from "./graph.js";

const resultEl = document.getElementById('age');
const suggestionDiv = document.getElementById('suggestions');
const searchEl = document.getElementById('input-name');

var nameList = await fetchListOfNames();



for (const [key, value] of new URLSearchParams(window.location.search).entries()) {
    if (value && value.length > 0) {
        searchEl.value = value;
        searchName(value);
    }
}

searchEl.addEventListener("keyup", ({ key }) => {
    const value = searchEl.value;
    if (key === "Enter")
        searchName(value);
});

searchEl.addEventListener("input", (ev) => {
    const value = searchEl.value;
    clearSuggestions();
    suggestNames(value);
});


async function suggestNames(value) {
    value = sanitizeName(value);

    if (value.length < 2)
        return [];

    const suggestions = [];

    var index = 0;
    while (index < nameList.length) {
        if (nameList[index].indexOf(value) == 0)
            suggestions.push(nameList[index]);
        index++;
    }

    suggestions.sort((a, b) => {
        return a.length - b.length;
    });

    renderSuggestions(suggestions.slice(0, 5));
}

function acceptSuggestion(ev) {
    searchEl.value = ev.target.textContent;
    clearSuggestions();
    searchName(searchEl.value);
}

function clearSuggestions() {
    suggestionDiv.innerHTML = '';
}

function renderSuggestions(suggestions) {
    suggestions.forEach((suggestion) => {
        const p = document.createElement("p");
        p.appendChild(document.createTextNode(suggestion));
        p.addEventListener("click", acceptSuggestion);
        suggestionDiv.appendChild(p);
    })
}


async function searchName(name) {
    name = sanitizeName(name);

    const isValid = await isValidName(name);
    if (!isValid)
        return console.log("\n\n[Info] Not a known name.");
    console.log("\n\n[Info] Searching for " + name + ".");

    const nameData = await fetchNameData(name);
    console.log("[Info] Frequency data: " + Object.keys(nameData).length + " entries.");
    resultEl.textContent = yearToAge(calculateMode(nameData), true);



    renderGraph(formatNameData(nameData));

    searchEl.blur();
    saveQuery(name);
}

function saveQuery(name) {
    const url = new URL(window.location.href);
    url.searchParams.set('q', encodeURIComponent(name));
    window.history.pushState(null, '', url);
    // console.log(url.toString());
}

function yearToAge(year, debug) {
    const date = new Date();
    const currentYear = date.getFullYear() - (date.getMonth() < 6 ? 1 : 0);
    if (debug)
        console.log("[Info] Age: " + (currentYear - year) + ".  ( " + (date.getMonth() < 6 ? ("Assumes later bday") : ("Assumes earlier bday")) + " )");

    return currentYear - year;
}

function sanitizeName(value) {
    const trimmedStr = decodeURIComponent(value).trim();
    return trimmedStr.substring(0, 1).toUpperCase() + trimmedStr.substring(1).toLowerCase();
}

function calculateMode(nameData) {
    var maxYear = 0, maxFreq = 0, modeCount = 0;
    Object.keys(nameData).forEach((year) => {
        if (maxFreq < nameData[year])
            maxFreq = nameData[year];
    });

    Object.keys(nameData).forEach((year) => {
        if (maxFreq == nameData[year]) {
            maxYear += Number(year);
            modeCount++;
        }
    });

    console.log("[Info] Year: " + Math.round(maxYear / modeCount) + ".  ( " + modeCount + " points )");

    return Math.round(maxYear / modeCount);
}

function formatNameData(nameData) {
    return Object.keys(nameData).map((key) => {
        return { age: yearToAge(key), freq: nameData[key] };
    });
}

function calculateMean(nameData) {
    var weightedAvgAge = 0, sum = 0;
    Object.keys(nameData).forEach((year) => {
        weightedAvgAge += year * nameData[year];
        sum += nameData[year];
    });

    return Math.round(weightedAvgAge / sum);
}

async function fetchNameData(name) {
    const response = await fetch("./src/data/names/" + name + ".json");
    const json = await response.json();
    return json;
}

async function isValidName(name) {
    return nameList.includes(name);
}

async function fetchListOfNames() {
    const response = await fetch("./src/data/names.json");
    const json = await response.json();
    return json;
}