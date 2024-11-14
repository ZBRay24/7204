// Set up the SVG canvas dimensions
const width = 1200;
const height = 800;

// Create an SVG element and append it to the body
const svg = d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Define a projection and path generator
const projection = d3.geoMercator()
    .center([104, 37])
    .scale(850)
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load the dependency ratio data
let provinceData; // Declare a variable to hold the province data

d3.csv("dependency_ratio_data.csv").then(data => {
    // Process the data and create line charts
    provinceData = d3.group(data, d => d.Province); // Store the grouped data

    // Load the GeoJSON data
    d3.json("cn.json").then(geoData => {
        // Draw the map
        svg.selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "lightgrey")
            .attr("stroke", "white")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange");
                showTooltip(event, d);
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("fill", "lightgrey");
                hideTooltip();
            });
    });
});

// Function to create a dual line chart for a given province
function createDualLineChart(province) {
    const data = provinceData.get(province);
    if (!data) return; // 如果没有数据，直接返回

    const margin = {top: 20, right: 30, bottom: 50, left: 60}; // 增加边距
    const chartWidth = 600 - margin.left - margin.right;
    const chartHeight = 400 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Year))
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(+d['Child Dependency Ratio (%)'], +d['Elderly Dependency Ratio (%)']))])
        .range([chartHeight, 0]);

    const lineChild = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d['Child Dependency Ratio (%)']));

    const lineElderly = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d['Elderly Dependency Ratio (%)']));

    const svgChart = d3.select("#tooltip").append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svgChart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", lineChild);

    svgChart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", lineElderly);

    svgChart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    svgChart.append("g")
        .call(d3.axisLeft(y));

    // 添加 x 轴标签
    svgChart.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 5) // 调整 y 位置，使其紧跟在 x 轴后面
    .attr("text-anchor", "middle")
    .text("Year");

// 添加 y 轴标签
    svgChart.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -margin.left + 15) // 调整 y 位置，使其在 y 轴上方
    .attr("text-anchor", "middle")
    .text("Dependency Ratio (%)");
}
// Function to show tooltip
function showTooltip(event, d) {
    const tooltip = d3.select("#tooltip");
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(`Province: ${d.properties.name}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    
    // Remove any existing charts
    tooltip.selectAll("svg").remove();
    
    // Create a new chart for the hovered province
    createDualLineChart(d.properties.name);
}

// Function to hide tooltip
function hideTooltip() {
    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
}
function createDualLineChart(province) {
    const data = provinceData.get(province);
    if (!data) return; // 如果没有数据，直接返回

    const margin = {top: 20, right: 30, bottom: 30, left: 40};
    const chartWidth = 400 - margin.left - margin.right;
    const chartHeight = 200 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Year))
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(+d['Child Dependency Ratio (%)'], +d['Elderly Dependency Ratio (%)']))])
        .range([chartHeight, 0]);

    const lineChild = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d['Child Dependency Ratio (%)']));

    const lineElderly = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d['Elderly Dependency Ratio (%)']));

    const svgChart = d3.select("#tooltip").append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    svgChart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("d", lineChild);

    svgChart.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", lineElderly);

    svgChart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    svgChart.append("g")
        .call(d3.axisLeft(y));

    // 添加图例
    const legend = svgChart.append("g")
        .attr("transform", `translate(${chartWidth - 150}, 10)`); // 调整位置

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "blue");
    legend.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text("Child Dependency Ratio");

    legend.append("rect")
        .attr("y", 20)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "green");
    legend.append("text")
        .attr("x", 15)
        .attr("y", 30)
        .text("Elderly Dependency Ratio");
}
