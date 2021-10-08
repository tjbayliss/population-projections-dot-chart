// function call based on browser window resize.
window.onresize = windowResize;

/*





      NAME: windowResize 
      DESCRIPTION: function called when user resizes window. handles updating of content reliant on dimension of window
      ARGUMENTS TAKEN: none
      ARGUMENTS RETURNED: none
      CALLED FROM: none
      CALLS: alertSize()
  
      http://bl.ocks.org/johangithub/97a186c551e7f6587878
  */
function windowResize() {
  alertSize(); // function call to get current browser window dimensions

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;

  // console.log("aleph.windowWidth:",aleph.windowWidth)
  var windowSize = "";
  aleph.windowSize = "";

  // console.log( aleph.windowWidth,aleph.margin,aleph.margin.line);

  checkWindowSize();

  // if (aleph.windowWidth < 575) {
  //   windowSize = "vs";
  //   aleph.windowSize = "vs";
  // } else if (aleph.windowWidth < 568) {
  //   windowSize = "sm";
  //   aleph.windowSize = "sm";
  // } else if (aleph.windowWidth < 768) {
  //   windowSize = "md";
  //   aleph.windowSize = "md";
  // } else if (aleph.windowWidth < 992) {
  //   windowSize = "lg";
  //   aleph.windowSize = "lg";
  // } else if (aleph.windowWidth < 1200) {
  //   windowSize = "xl";
  //   aleph.windowSize = "xl";
  // } else {
  //   windowSize = "xl";
  //   aleph.windowSize = "xl";
  // } // end else ...

  // update dimensions of base container SVG panel to size of browser window
  d3.selectAll(".aleph-chart.aleph-line-chart")
    .attr("width", aleph.windowWidth)
    .attr("height", aleph.windowHeight);

  // recalculate chat width and height
  aleph.chartWidth =
    d3.selectAll(".aleph-container").style("width").replace("px", "") -
    aleph.margin.line[aleph.windowSize].left -
    aleph.margin.line[aleph.windowSize].right;
  aleph.chartHeight =
    aleph.windowHeight -
    aleph.margin.line[aleph.windowSize].top -
    aleph.margin.line[aleph.windowSize].bottom;

  svgWidth = $(".aleph-chart.aleph-dot-chart").width();
  svgHeight = $(".aleph-chart.aleph-dot-chart").height();

  /*
        
    DOT CHART
        
  */

  // update horizontal position of legend on dots chart
  d3.selectAll(".aleph-dots-legendBase-Group").attr(
    "transform",
    "translate(" +
      (svgWidth -
        aleph.dotMargin.right -
        Number(aleph.dot_legend_labels.length * aleph.swatchWidth)) +
      "," +
      (aleph.dotMargin.top - 2 * aleph.swatchHeight) +
      ")"
  );

  aleph.dots_xAxis
    .domain([
      0,
      /* aleph.xAxisMax[aleph.dotAxisType] */ Math.ceil(
        aleph.xAxisMax[aleph.dotAxisType] / 0.5
      ) * 0.5,
    ])
    .range([0, svgWidth - aleph.dotMargin.left - aleph.dotMargin.right]);

  // update x-axis delcation of dots chart x axis
  d3.selectAll(".axis.axis--x.dot-xAxis").call(d3.axisBottom(aleph.dots_xAxis));

  // update tick grid lines extending from y-axis ticks on axis across graph
  d3.selectAll(".axis.axis--y.dot-yAxis")
    .selectAll(".tick")
    .selectAll(".aleph-yAxisTicks")
    .attr("x2", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right);

  // update positioning x-axis title on dots chart
  d3.selectAll(".axis.axis--x.dot-xAxis")
    .selectAll(".aleph-xAxisTitle")
    .attr("x", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right - 25);

  d3.selectAll(".axis.axis--x.dot-xAxis")
    .selectAll(".aleph-axisChange")
    .attr("x", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right - 25);

  d3.selectAll(".aleph-dot-chart-region-circle").remove();
  d3.selectAll(".aleph-dot-chart-region-line").remove();

  d3.selectAll(".dot-region-group").attr("transform", function (d) {
    drawCircles(d.region, d.values);
    drawLine(d.region, d.values);
    return (
      "translate(" +
      0 +
      "," +
      Number(aleph.dotMargin.top + aleph.dots_yAxis(d.region)) +
      ")"
    );
  });

  /* NEW CODE FOR DOT PLOT */
  d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line").attr(
    "d",
    aleph.connectorline
  );

  d3.selectAll(".ageband-circle-" + (aleph.sortOrderIndex - 2)).moveToFront();

  return;
} // end function windowResize
