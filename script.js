
var jsonData = [
    { "name": "Engineering", "detractors": 10, "passives": 0, "promoters": 90 },
    { "name": "support", "detractors": 40, "passives": 30, "promoters": 30 },
    { "name": "marketing", "detractors": 1, "passives": 10, "promoters": 89 },
    { "name": "hr", "detractors": 23, "passives": 57, "promoters": 20 },
    { "name": "net ops", "detractors": 7, "passives": 3, "promoters": 90 },
    { "name": "finance", "detractors": 78, "passives": 12, "promoters": 20 },
    { "name": "g&a", "detractors": 10, "passives": 20, "promoters": 70 },
    { "name": "medical", "detractors": 17, "passives": 23, "promoters": 60 },
    { "name": "civil", "detractors": 41, "passives": 37, "promoters": 22 }
];
//#CF727D, #E4DE9E, #57BFE3
// dark Text - #c9c9c9
// Normal Text Color - #6b6761
// Line colors - #eff0ef

var minWidth = 330;
var maxWidth = 600;

var container = {
    width: 330,
    height: 240,
    maxWidth: 600
};
var margin = {
    top: 0,
    right: 20,
    bottom: 30,
    left: 95
};


render();
function render() {

    var viewPort = updateDimensions(d3.select('.chartWrapper').style("width"));
    var data = viewPort === 'small' ? jsonData.slice(0, 3) : jsonData;
    var width = container.width - (margin.left + margin.right);
    var height = container.height - margin.top - margin.bottom;

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .3);

    var x = d3.scale.linear()
        .rangeRound([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(10)
        .tickPadding(8)
        .tickFormat(d3.format(",%"))
        .orient("bottom");
    if (viewPort === 'small') {
        xAxis.ticks(2);
    }

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    var color = d3.scale.ordinal()
        .range(["#CF727D", "#E4DE9E", "#57BFE3"]);

    var svg = d3.select('.chartWrapper').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var yLabels = d3.keys(data[0]).filter(function (key) { return key !== "name"; });
    var seriesName = data.map(function (d) { return d.name; });
    var centerIndex = Math.floor(yLabels.length / 2);
    color.domain(yLabels);

    data.forEach(function (series) {
        series.total = d3.sum(yLabels.map(function (name) {
            return +series[name];
        }));

        yLabels.forEach(function (name) {
            series['relative' + name] = (series.total !== 0 ? +series[name] / series.total : 0);
        });

        var x0 = -1 * d3.sum(yLabels.map(function (name, i) {
            return i < centerIndex ? +series['relative' + name] : 0;
        }));

        if (yLabels.length & 1) x0 += -1 * series['relative' + yLabels[centerIndex]] / 2;
        var idx = 0;

        series.boxes = yLabels.map(function (name) {
            return { name: name, x0: x0, x1: x0 += series['relative' + name], total: series.total, absolute: series[name] };
        });
        series.npss = [{ x0: series.boxes[series.boxes.length - 1]['x1'], x1: 40, nps: (series['promoters'] - series['detractors']) }];
    });

    var min = -.9000; //d3.min(data, function (d) { return d.boxes["0"].x0; });
    var max = d3.max(data, function (d) { return d.boxes[d.boxes.length - 1].x1; });
    x.domain([min, max]).nice();
    y.domain(seriesName);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var rows = svg.selectAll(".series")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function (d) { return "translate(0," + y(d.name) + ")"; })
        .on("mouseover", function (d) {
        })
        .on("mouseout", function (d) {
        })


    var bars = rows.selectAll("rect")
        .data(function (d) { return d.boxes })
        .enter().append("g");

    bars.append("rect")
        .attr("height", y.rangeBand())
        .attr("x", function (d) { return x(d.x0); })
        .attr("width", function (d) {
            return x(d.x1) - x(d.x0) || 0;
        })
        .style("fill", function (d) { return color(d.name); });

    //Create NPS rect    
    var npsBox = rows.selectAll(".bar")
        .data(function (d) {
            console.log(d.npss)
            return d.npss
        })
        .enter()
        .append("g")
        .attr('class', 'NPS');

    npsBox.append("rect")
        .attr("height", y.rangeBand())
        .attr("x", function (d) { return x(d.x0); })
        .attr("width", function (d) {
            return 40;
        })
        .style("fill", function (d) { return '#fff'; });

    npsBox.append("text")
        .attr("x", function (d) { return x(d.x0) + 15; })
        .attr("y", y.rangeBand() / 2)
        .text(function (d) { return d.nps; })
        .attr("dy", "0.5em")
        .style("fill", "#6b6761")
        .style("font-size", ".8rem")
        .style("font-weight", "900")
        .attr("text-anchor", "middle");

    bars
        .append("text")
        .attr("x", function (d) { return (x(d.x0) + x(d.x1)) / 2; })
        .attr("y", y.rangeBand() / 2)
        .attr("dy", "0.5em")
        .attr("dx", "0.5em")
        .attr('class', function (d) {
            return d.name == 'passives' ? 'hide' : '';
        })
        .text(function (d) { return (d.absolute !== 0 && (d.x1 - d.x0) > 0.04 ? d.absolute : "") + '%'; })
        .style("fill", "#fff")
        .style("font-size", ".7rem")
        .attr("text-anchor", "middle");

    d3.selectAll("g.y.axis g.tick text")
        .attr('class', 'yAxis-label')
        .attr("x", -20);

    d3.selectAll("g.x.axis g.tick text")
        .attr('class', 'xAxis-label');
}

function updateDimensions(width) {
    width = parseInt(width);
    container.width = width <= maxWidth ? width : maxWidth;
    margin.top = 0;
    margin.right = 20;
    margin.left = 95;
    margin.bottom = 30;
    return width <= maxWidth ? 'small' : 'large';
}
