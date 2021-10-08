/*
  Project: Future Forces Population Projections interactive dashboard
  Filename: aleph-genericProjectFunctions.js
  Date built: December 2020 to April 2021
  Written By: James Bayliss (Data Vis Developer)
  Tech Stack: HTML5, CSS3, JS ES5/6, D3 (v5), JQuery 
*/
console.log("aleph-futureForces-genericProjectFunctions-script.js");

vis = {}; // global object declaration for window size variables.

/*





  NAME: changeChart 
  DESCRIPTION: function called when user requst to load a new pop. projections chart style 
  ARGUMENTS TAKEN: button - DOM detail of button/image selected by user 
  ARGUMENTS RETURNED: none
  CALLED FROM: buildControls()
  CALLS:    drawLineChart()
            drawPyramidsChart()
            drawDotsChart()
*/
function changeChart(button) {
  // clear all content cotnained on main aleph-chart SVG panel ready for drawing next chart
  d3.selectAll(".aleph-chart > *").remove();

  // user slects a new charting option to display,
  // initially change class on all thumbnails to '-unselected'
  d3.selectAll(".aleph-chart-thumbnail")
    .classed("aleph-unselected-chart", true)
    .classed("aleph-selected-chart", false);

  // then change class on selected thumbnail to '-selected'
  d3.select("#" + button.id)
    .classed("aleph-unselected-chart", false)
    .classed("aleph-selected-chart", true);

  // if user wants to display pop. projection line chart.
  if (button.id == "line-chart-thumbnail") {
    aleph.currentChart = "line";

    // remove classnames from all div-containers.
    d3.selectAll(".div-container").classed("aleph-hide", true);

    // add classnames to required div-container.
    d3.selectAll(".div-container.line-chart").classed("aleph-hide", false);

    // call function to build and draw line chart
    drawLineChart();
  } /* END IF */ else if (button.id == "pyramid-chart-thumbnail") {
    aleph.currentChart = "pyramid";
    // remove classnames from all div-containers.
    d3.selectAll(".div-container").classed("aleph-hide", true);

    // add classnames to required div-container.
    d3.selectAll(".div-container.pyramid-chart").classed("aleph-hide", false);

    // call function to build and draw pop. pyramids chart
    initialisePyramidSelectionCriteriaObjects();
    drawPyramidsChart();
  } /* END ESLE IF */ else if (button.id == "dots-chart-thumbnail") {
    aleph.currentChart = "dots";
    // remove classnames from all div-containers.
    d3.selectAll(".div-container").classed("aleph-hide", true);

    // add classnames to required div-container.
    d3.selectAll(".div-container.dot-chart").classed("aleph-hide", false);

    // call function to build and draw pop. proportions dot chart
    drawDotsChart();
  }

  return;
} // end function changeChart();

/*





  NAME: alertSize 
  DESCRIPTION: function called to determine current broswr window size/dimensions when vis loads and window resizes
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM:  onload()
                windowResize()
  CALLS: none   
*/
function alertSize() {
  // initialise local variables.
  var myWidth = 0,
    myHeight = 0;

  if (typeof window.innerWidth == "number") {
    //Non-IE
    myWidth = window.innerWidth;
    myHeight = window.innerHeight;
  } else if (
    document.documentElement &&
    (document.documentElement.clientWidth ||
      document.documentElement.clientHeight)
  ) {
    //IE 6+ in 'standards compliant mode'
    myWidth = document.documentElement.clientWidth;
    myHeight = document.documentElement.clientHeight;
  } else if (
    document.body &&
    (document.body.clientWidth || document.body.clientHeight)
  ) {
    //IE 4 compatible
    myWidth = document.body.clientWidth;
    myHeight = document.body.clientHeight;
  }

  vis.width = myWidth;
  vis.height = myHeight;

  return;
} // end function alertSize

// http://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function () {
  return this.each(function () {
    var firstChild = this.parentNode.firstChild;
    if (firstChild) {
      this.parentNode.insertBefore(this, firstChild);
    }
  });
};

/*





  NAME: numberWithCommas 
  DESCRIPTION: function called to add comma seperators to numebrs over/under +/-999
  ARGUMENTS TAKEN: x - number to modify string of
  ARGUMENTS RETURNED: formnatted string
  CALLED FROM:  drawPopulationLineOnChart()
                drawSparkLine()
  CALLS: none
*/
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} // end function numberWithCommas

/*





  NAME: buildControls 
  DESCRIPTION: function called to build controls panel on left margin of window 
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM:  onload()
  CALLS: none
*/
function buildControls() {
  // select base container DIV. append new base div intended for panel building
  d3.selectAll(".container-fluid")
    .append("div")
    .attr("class", "aleph-controls-base closed")
    .attr("id", "aleph-controls-base")
    .on("click", function () {
      if (d3.select(this).classed("closed")) {
        d3.select(this).classed("closed", false).classed("open", true);
      } else {
        d3.select(this).classed("closed", true).classed("open", false);
      }
      return;
    });

  // select new base div, append title label
  d3.selectAll(".aleph-controls-base")
    .append("label")
    .attr("class", "aleph-controls-base-label")
    .attr("id", "aleph-controls-base-label")
    .text("Chart Style");

  // append image for line chart
  // d3.selectAll(".aleph-controls-base")
  //   .append("img")
  //   .attr("class", "aleph-chart-thumbnail aleph-selected-chart")
  //   .attr("id", "line-chart-thumbnail")
  //   .attr("src", "image/line.png")
  //   .attr("value", "line")
  //   .on("click", function () {
  //     changeChart(this);
  //   });

  d3.selectAll(".aleph-controls-base")
    .append("img")
    /*     .attr("class", "aleph-chart-thumbnail aleph-selected-chart") */
    .attr("class", "aleph-chart-thumbnail")
    .attr("id", "line-chart-thumbnail")
    .attr("src", "image/line.svg")
    .attr("value", "line")
    .on("click", function () {
      changeChart(this);
    });
  /* 
    <img
    id="aleph-logo"
    value="aleph-logo"
    class="aleph-logo"
    src="image/AI-logo-text-light-bgTransparent-withTrim.svg"
  /> */

  // append image for pyramids chart
  d3.selectAll(".aleph-controls-base")
    .append("img")
    .attr("class", "aleph-chart-thumbnail aleph-unselected-chart")
    .attr("id", "pyramid-chart-thumbnail")
    .attr("src", "image/pyramid.svg")
    .attr("value", "pyramid")
    .on("click", function () {
      changeChart(this);
    });

  // append image for dots chart
  d3.selectAll(".aleph-controls-base")
    .append("img")
    .attr("class", "aleph-chart-thumbnail aleph-unselected-chart")
    .attr("id", "dots-chart-thumbnail")
    .attr("src", "image/dot.svg")
    .attr("value", "dots")
    .on("click", function () {
      changeChart(this);
    });

  return;
} // end function buildControls

function CharacterToCharacter(str, char1, char2) {
  return str.split(char1).join(char2);
} // end function CharacterToCharacter

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function checkWindowSize() {
  if (aleph.windowWidth < 568) {
    // windowSize = "vs";
    aleph.windowSize = "vs";
  } else if (aleph.windowWidth < 575) {
    // windowSize = "sm";
    aleph.windowSize = "sm";
  } else if (aleph.windowWidth < 768) {
    // windowSize = "md";
    aleph.windowSize = "md";
  } else if (aleph.windowWidth < 992) {
    // windowSize = "lg";
    aleph.windowSize = "lg";
  } else if (aleph.windowWidth < 1200) {
    // windowSize = "xl";
    aleph.windowSize = "xl";
  } else {
    // windowSize = "xl";
    aleph.windowSize = "sl";
  } // end else ...

  return;
} // end function checkWindowSize
