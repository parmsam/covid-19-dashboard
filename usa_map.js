// set the dimensions and margins of the graph
var margin = {top: 0, right: 0, bottom: 0, left:0},
    width = 875;
    height = 600;

//following code based on http://bl.ocks.org/michellechandra/0b2ce4923dc9b5809922;
//using d3.v4 instead of v3 which tutorial above is based on


var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
            "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
var weekday = new Array(7);
weekday[0] = "Sun";
weekday[1] = "Mon";
weekday[2] = "Tue";
weekday[3] = "Wed";
weekday[4] = "Thu";
weekday[5] = "Fri";
weekday[6] = "Sat";




var today = new Date();
if(today.getMonth()+1 < 10){
var month = '0' + (today.getMonth()+1);
}
else var month = (today.getMonth()+1);

if ((today.getDate()-1)<10){
var yesterday = "0" + (today.getDate()-1);
}
else var yesterday = (today.getDate()-1);

var yesterday_date = month +'-'+ yesterday +'-'+ today.getFullYear();

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


// D3 Projection
var projection = d3.geoAlbersUsa()
            .translate([width/2, height/2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

var path = d3.geoPath().projection(projection);

// Define linear scale for output
var color = d3.scaleLinear()
			  .range(["blue"]);


var legendText = ["Incident Rate"];

//Create SVG element and append map to the SVG
var svg = d3.select("#my_dataviz_usa")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

// Append Div for tooltip to SVG
var div = d3.select("#my_dataviz_usa")
		    .append("div")
   		.attr("class", "tooltip")
   		.style("opacity", 0);

// JS wrap text function (wrapping function taken from https://stackoverflow.com/questions/24784302/wrapping-text-in-d3/24785497)
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0,
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

var csv_file_name = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/" +
yesterday_date +
".csv";

//test file csv
//var csv_file_name = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/08-08-2020.csv";

// Load in my states data!
d3.csv(csv_file_name,
function(data) {
  var sum_confirmed = d3.sum( data, function(d) { return +d['Confirmed']});
  var sum_deaths = d3.sum( data, function(d) { return +d['Deaths']});
  var sum_people_tested = d3.sum( data, function(d) { return +d['People_Tested']});

  svg.append("text")
		.text(numberWithCommas(sum_confirmed) + " U.S. Cases")
		.attr("x",margin.left + ((width + 100)/8))
		.attr("y", 560)
    .attr("fill","mediumblue");

  svg.append("text")
		.text(numberWithCommas(sum_deaths) + " U.S. Deaths")
		.attr("x",margin.left + ((width + 100)/3))
		.attr("y", 560)
    .attr("fill","crimson");


  svg.append("text")
		.text(numberWithCommas(sum_people_tested) + " U.S. Tests")
		.attr("x",margin.left + ((width + 100)/1.85))
		.attr("y", 560)
    .attr("fill","green");


  var max_incident_rate = d3.max( data, function(d) { return +d['Incident_Rate']});
  var color_scale = d3.scaleLinear().domain([0, max_incident_rate]).range(['cyan', 'darkblue']);

//color.domain([0,1]); // setting the range of the input data
// Load GeoJSON data and merge with states data
  d3.json("https://raw.githubusercontent.com/parmsam/covid-19-narrative-viz-indy/master/us-states.json",
  function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

    	// Grab State Name
    	var dataState = data[i].Province_State;

    	// Grab data value
    	var mystate = data[i].Province_State;
    	var confirmed	 = data[i].Confirmed	;
    	var deaths = data[i].Deaths;
    	var recovered = data[i].Recovered;
      var tested = data[i].People_Tested;
      var hospitalized = data[i].People_Hospitalized;

    	var incident_rate = data[i].Incident_Rate;
    	var mortality_rate = data[i].Mortality_Rate;
    	var test_rate = data[i].Testing_Rate;
    	var hospitalization_rate = data[i].Hospitalization_Rate;

      var last_update = d3.timeParse("%Y-%m-%d %H:%M:%S")(data[1].Last_Update);

    	// Find the corresponding state inside the GeoJSON
    	for (var j = 0; j < json.features.length; j++)  {
    		var jsonState = json.features[j].properties.name;

    		if (dataState == jsonState) {

    		// Copy the data value into the JSON
        json.features[j].properties.mystate = mystate;
        json.features[j].properties.confirmed = confirmed;
        json.features[j].properties.deaths = deaths;
        json.features[j].properties.recovered = recovered;
        json.features[j].properties.tested = tested;
        json.features[j].properties.hospitalized = hospitalized;

        json.features[j].properties.incident_rate = incident_rate;
        json.features[j].properties.mortality_rate = mortality_rate;
        json.features[j].properties.test_rate = test_rate;
        json.features[j].properties.hospitalization_rate = hospitalization_rate;

        json.features[j].properties.hospitalization_rate = hospitalization_rate;
        //json.features[j].properties.last_update = last_update;


    		// Stop looking through the JSON
    		break;
    		}
    	}
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
    	.data(json.features)
    	.enter()
    	.append("path")
    	.attr("d", path)
    	.style("stroke", "#fff")
    	.style("stroke-width", "1")
      .on("mouseover", function(d) {
             	div.transition()
               	   .duration(400)
                  .attr("data-html", "true")
                    .style("opacity", 0.9)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
              div.html("<b>" + d.properties.name + "</b>" + "<br>" +
                "Cases: " + numberWithCommas(d.properties.confirmed) +"<br>" +
                "Deaths: " + numberWithCommas(d.properties.deaths) +"<br>" +
                // "Hosp.: " + d.properties.hospitalized + "<br>" +
                 "Tests: " + numberWithCommas(d.properties.tested) + "<br><br>" +
                "Case Rate (per 100K): " + numberWithCommas(Math.round(d.properties.incident_rate)) + "<br>" +
                "Death Rate (per 100CCs): " + numberWithCommas(Math.round(d.properties.mortality_rate*100)/100) + "<br>"
                // "Hosp Rate (%): " + Math.round(d.properties.hospitalization_rate) + "<br>"
                 // "Testing Rate (per 100K): " + Math.round(d.properties.test_rate*10)/10 + "<br>"
              )
          	})

             // fade out tooltip on mouse out
             .on("mouseout", function(d) {
                 div.transition()
                    .duration(500)
                    .style("opacity", 0);
             })
    	.style("fill", function(d) {

    	// Get data value
    	//var value = d.properties.mystate;
    	var value = d.properties.incident_rate;

    	if (value) {
    	//If value exists…
    	// return color(value);
    	return color_scale(value);
    	} else {
    	//If value is undefined…
    	// return "rgb(213,222,217)";
      return color_scale(value);
    	}
    })
    ;

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("COVID-19 State Case Rates in USA as of " +
        weekday[(last_update).getDay()] + " " +
          monthShortNames[(last_update).getMonth()] + " " +
          (last_update).getDate()
        )
        .attr("font-weight","bold");


	});

  var w = 450, h = 50;

   var key = d3.select("#legend1")
     .append("svg")
     .attr("width", w)
     .attr("height", h);

   var legend = key.append("defs")
     .append("svg:linearGradient")
     .attr("id", "gradient")
     .attr("x1", "0%")
     .attr("y1", "100%")
     .attr("x2", "100%")
     .attr("y2", "100%")
     .attr("spreadMethod", "pad");

  // legend.append('text')
  //    .text('Legend Title');

   legend.append("stop")
     .attr("offset", "0%")
     .attr("stop-color", "cyan")
     .attr("stop-opacity", 1);

   legend.append("stop")
     .attr("offset", "100%")
     .attr("stop-color", "darkblue")
     .attr("stop-opacity", 1);

   key.append("rect")
     .attr("width", w)
     .attr("height", h - 30)
     .style("fill", "url(#gradient)")
     .attr("transform", "translate(20,10)");

   var y = d3.scaleLinear()
     .range([450, 0])
     .domain([max_incident_rate,0]);


   var yAxis = d3.axisBottom()
     .scale(y)
     .ticks(9);

   key.append("g")
     .attr("class", "y axis")
     .attr("transform", "translate(20,30)")
     .call(yAxis)
     .append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 0)
     .attr("dy", ".71em")
     .style("text-anchor", "end")
     .text("axis title");

});
