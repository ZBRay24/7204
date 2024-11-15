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
    // Add legend
    const legend = svgChart.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${chartWidth - 150}, 20)`);

    // Add legend items
    const legendData = [
        { color: "blue", label: "Child Dependency" },
        { color: "green", label: "Elderly Dependency" }
    ];

    legendData.forEach((item, i) => {
        const legendItem = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);

        legendItem.append("line")
            .attr("x1", 0)
            .attr("x2", 20)
            .attr("stroke", item.color)
            .attr("stroke-width", 1.5);

        legendItem.append("text")
            .attr("x", 25)
            .attr("y", 5)
            .text(item.label)
            .style("font-size", "12px");
    });

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
}

// Function to hide tooltip
function hideTooltip() {
    d3.select("#tooltip").transition().duration(500).style("opacity", 0);
}

// Existing constants and setup

// Add these color schemes and zone data
const developmentColors = {
    'Developed City': '#1f77b4',
    'Developing City': '#ff7f0e',
    'Undeveloped City': '#2ca02c'
};

const agingColors = {
    'low aging pressure zones': '#8dd3c7',
    'medium aging pressure zones': '#fb8072',
    'high aging pressure zones': '#80b1d3'
};

const zoneData = {
    'Developed City': ['Beijing', 'Shanghai', 'Guangdong', 'Jiangsu', 'Zhejiang', 'Shandong', 'Fujian'],
    'Developing City': ['Sichuan', 'Hubei', 'Hunan', 'Anhui', 'Hebei', 'Liaoning', 'Jilin', 'Heilongjiang', 'Shaanxi', 'Jiangxi', 'Shanxi', 'Henan', 'Guangxi', 'Inner Mongolia'],
    'Undeveloped City': ['Gansu', 'Qinghai', 'Ningxia', 'Hainan', 'Guizhou', 'Yunnan', 'Tibet', 'Xinjiang'],
    'low aging pressure zones': ['Tianjin', 'Hebei', 'Shanxi', 'Liaoning', 'Jilin', 'Heilongjiang', 'Shanghai', 'Jiangsu', 'Shandong', 'Henan', 'Hubei', 'Hunan', 'Chongqing', 'Sichuan'],
    'medium aging pressure zones': ['Fujian', 'Guangdong', 'Hainan', 'Tibet', 'Qinghai', 'Ningxia', 'Xinjiang'],
    'high aging pressure zones': ['Beijing', 'Inner Mongolia', 'Zhejiang', 'Anhui', 'Jiangxi', 'Guangxi', 'Guizhou', 'Yunnan', 'Shaanxi', 'Gansu']
};

// Modify the map rendering code
d3.json("cn.json").then(geoData => {
    svg.selectAll("path")
    .data(geoData.features)
    .enter().append("path")
    .attr("d", path)
    .attr("fill", function(d) {
        return getZoneColor(d.properties.name);
    })
    .attr("stroke", "white")
    .on("mouseover", function(event, d) {
        // Store original color
        const originalColor = d3.select(this).attr("fill");
        // Brighten the color
        d3.select(this)
            .attr("fill", d3.color(originalColor).brighter(0.5));
        showTooltip(event, d);
        createDualLineChart(d.properties.name);
    })
    .on("mouseout", function(event, d) {
        // Restore original color
        d3.select(this)
            .attr("fill", getZoneColor(d.properties.name));
        hideTooltip();
    });
});

function getZoneColor(province) {
    const selectedValue = parseInt(document.getElementById("chartSelector").value);
    if (selectedValue >= 1 && selectedValue <= 3) {
        for (const [zone, provinces] of Object.entries(zoneData)) {
            if (provinces.includes(province) && developmentColors[zone]) {
                return developmentColors[zone];
            }
        }
    } else if (selectedValue >= 4 && selectedValue <= 7) {
        for (const [zone, provinces] of Object.entries(zoneData)) {
            if (provinces.includes(province) && agingColors[zone]) {
                return agingColors[zone];
            }
        }
    }
    return "lightgrey";  // Default color
}

function updateLegend() {
    const legend = d3.select("#legend");
    legend.html("");
    const selectedValue = document.getElementById("chartSelector").value;
    let currentColors = selectedValue >= 1 && selectedValue <= 3 ? developmentColors : agingColors;
    
    Object.entries(currentColors).forEach(([key, value]) => {
        const item = legend.append("div").attr("class", "legend-item");
        item.append("div")
            .attr("class", "legend-color")
            .style("background-color", value);
        item.append("span").text(key);
    });
}

document.getElementById("chartSelector").addEventListener("change", function() {
    const selectedValue = this.value;
    updateMapColors();
    updateLegend();
    updateImage(selectedValue);
});

function updateMapColors() {
    svg.selectAll("path")
        .attr("fill", function(d) {
            return getZoneColor(d.properties.name);
        });
}

document.getElementById("chartSelector").addEventListener("change", function() {
    const selectedValue = this.value;
    const chartContainer = document.getElementById("chart");

    // 清空之前的内容
    chartContainer.innerHTML = "";

    if (selectedValue) {
        // 创建图片元素
        const img = document.createElement("img");
        img.src = `${selectedValue}.png`; // 假设你的图片文件命名为 1.png, 2.png 等
        img.alt = "Chart"; // 图片的替代文本

        // 设置图片大小以适应页面
        img.style.width = "108%"; // 设置图片的宽度为 100%
        img.style.height = "auto"; // 设置图片的高度为自动，以保持宽高比

        // 将图片添加到图表容器中
        chartContainer.appendChild(img);

        // 调整图片大小以适应页面
        adjustImageSize(img);
        window.addEventListener("resize", function() {
            adjustImageSize(img);
        });
    }
});