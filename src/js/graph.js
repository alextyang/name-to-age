import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const graphEl = document.getElementById('result');

var svg, x, y, points;

window.addEventListener('resize', function (event) {
    if (points != undefined)
        renderGraph(points);
}, true);

function clearGraph() {
    graphEl.innerHTML = '';
    svg = undefined;
    points = undefined;
}

export function renderGraph(inputData) {
    clearGraph();
    points = inputData;

    const margin = { top: 40, right: 20, bottom: 40, left: 20 },
        rect = graphEl.getBoundingClientRect(),
        width = rect.width,
        height = rect.height - 60;

    svg = d3.select("#result")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")


    x = d3.scaleLinear()
        .domain(d3.extent(points, function (d) { return d.age; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + (height + 36) + ")")
        .call(d3.axisTop(x));

    y = d3.scaleLinear()
        .domain([0, d3.max(points, function (d) { return +d.freq; })])
        .range([height, 0]);
    // svg.append("g")
    //     .call(d3.axisLeft(y));

    svg.append("path")
        .datum(points)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 0.4)
        .attr("d", d3.line()
            .x(function (d) { return x(d.age) })
            .y(function (d) { return y(d.freq) })
        )


}

function yearToAge(year) {
    const date = new Date();
    const currentYear = date.getFullYear() - (date.getMonth() < 6 ? 1 : 0);

    return currentYear - year;
}