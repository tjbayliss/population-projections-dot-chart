/*





  NAME: onload 
  DESCRIPTION: function called when user loads window. Called on initial opening of visualsation.
                Calls functions necessary to set-up initial view
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: body tag in index.html
  CALLS:  alertSize()
          loadData()
          addLineSelectionLists()
          addDotSelectionLists()
          buildControls()
  */
function onload() {
  alertSize(); // function call to get current browser window dimensions
  loadData(); // function call to load initial CSV data file
  addDotSelectionLists("onload"); // function call to add selection lists to dots chart vis
  addSVGtoSliders();

  // var pyramidLists = ["ethnicities", "regions"];

  // aleph.pyramids.forEach(function (d, i) {
  //   var side = d;

  //   pyramidLists.forEach(function (d, i) {
  //     var list = d;
  //     d3.selectAll("." + list + "-selections-" + side).text("All " + list);
  //   });
  // });

  // aleph.lineOnload = false;
  // aleph.pyramidOnload = false;

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;

  // update dimensions of base container SVG panel to size of browser window
  d3.selectAll(".aleph-chart.aleph-line-chart").attr(
    "width",
    aleph.windowWidth
  );

  return;
} // end function onload

/*
          
          
          
          

    NAME: addSVGtoSliders 
    DESCRIPTION: function called to  
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: onload
    CALLS:  
*/
function addSVGtoSliders() {
  d3.selectAll(".ui-slider-svg-cover").remove();

  // white-filled, grey bordered SVG rectangle covering for base slider DIV
  d3.selectAll(".ui-slider")
    .append("svg")
    .attr("class", "ui-slider-svg ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .append("rect")
    .attr("class", "ui-slider-svg-rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-range.ui-corner-all.ui-widget-header")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0);

  d3.selectAll(".ui-slider-handle")
    .append("svg")
    .attr("class", "ui-slider-svg-cover")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("rx", 0)
    .attr("ry", 0)
    .append("circle")
    .attr("class", "ui-slider-svg-circle")
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");

  d3.select("#pyramid-slider")
    .selectAll(".ui-slider-handle.ui-corner-all.ui-state-default.left")
    .style("left", "0.33%");

  return;
} // end function addSVGtoSliders

/*
          
          
          
          

    NAME: loadData 
    DESCRIPTION: function called to load CSV input data file(s).
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED: none
    CALLED FROM: none
    CALLS: drawLineChart()
*/
function loadData() {
  // store relevant file papth as local variable;

  // pyramid chart input files
  var inputDotDataFile = "data/data - dot.csv";
  var inputDotChartFieldsFile = "data/inputFieldnames - dot.csv";

  // store all input files as a Promise
  Promise.all([d3.csv(inputDotDataFile), d3.csv(inputDotChartFieldsFile)]).then(
    function (data) {
      // locally store data

      dotData = data[0];
      aleph.inputDotFieldnames_src = data[1];

      aleph.inputFieldnames = { dot: {} };

      aleph.inputDotFieldnames_src.forEach(function (d) {
        aleph.inputFieldnames.dot[d["codeFieldName"]] = d["dataFileFieldName"];
        aleph.DotNonYearFields.push(d["dataFileFieldName"]);
      }); // end forEach

      // stores all data ahas JSON element in global JSON object
      aleph.data = {
        dot: dotData,
      };

      // dynamically determine year extent of x axis from ingested data file.
      aleph.years = d3.keys(aleph.data.dot[0]).filter(function (d, i) {
        return aleph.DotNonYearFields.indexOf(d) == -1;
      });

      aleph.currentChart = "dots";
      // remove classnames from all div-containers.
      d3.selectAll(".div-container").classed("aleph-hide", true);

      // add classnames to required div-container.
      d3.selectAll(".div-container.dot-chart").classed("aleph-hide", false);

      // attached true region/area names to data
      aleph.data.dot.forEach(function (d, i) {
        d.regionName = aleph.regionsObject[d[aleph.inputFieldnames.dot.region]];
        d.ageBand = aleph.ageBandObject[d[aleph.inputFieldnames.dot.age]];
      });

      // call function build chart dynamic ageband-mergable legend
      addDotLegend();
      getMasterAndClonedData();

      // call function to build and draw pop. proportions dot chart
      drawDotsChart();
    }
  );

  return;
} // end function loadData();
