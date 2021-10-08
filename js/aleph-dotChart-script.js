/*
  Project: Future Forces Population Projections interactive dashboard
  Filename: aleph-futureForces-dotChart-script.js
  Date built: December 2020 to April 2021
  Written By: James Bayliss (Data Vis Developer)
  Tech Stack: HTML5, CSS3, JS ES5/6, D3 (v5), JQuery 
*/

// defintion onf D3 tooltip
aleph.tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "aleph-toolTip-Div aleph-hide")
  .style("position", "absolute")
  .style("left", 50 + "px")
  .style("padding", "5px")
  .style("top", 50 + "px")
  /*   .style("height", aleph.toolTipDimensions.height + "px") */
  .style("width", aleph.toolTipDimensions.width + "px");

// append tooltip title label
// d3.selectAll(".aleph-toolTip-Div")
//   .append("label")
//   .attr("class", "aleph-toolTipTitle-label")
//   .style("position", "relative")
//   .style("display", "block")
//   .style("text-anchor", "middle")
//   .text("");

var valuesToPlotNew = [];

/*






  NAME: drawDotsChart 
  DESCRIPTION: function called to build intial framework for dots pop. proportions breakdown chart
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM:  changeChart()
  CALLS:  addDotLegend()
          setDotSliderTicks()
*/
function drawDotsChart() {
  console.log("\ndrawDotsChart");
  console.log(aleph.CLONEDnestedDotObject);

  // remove all .chosen selector lists to [re]build them on event of subsequent return to this page
  d3.selectAll(".aleph-dot-selector").remove();
  d3.selectAll(".aleph-dot-group").remove();

  // store window dimensions as aleph object varaiables
  aleph.windowWidth = vis.width;
  aleph.windowHeight = vis.height;
  svgWidth = $(".aleph-chart.aleph-dot-chart").width();
  svgHeight = $(".aleph-chart.aleph-dot-chart").height();

  // update width of base chart DIV.
  d3.selectAll(".aleph-chart.aleph-dot-chart").attr("width", aleph.windowWidth);

  // append new group element to base chart div to contain chart visuals
  d3.selectAll(".aleph-chart.aleph-dot-chart")
    .append("g")
    .attr("class", "aleph-dot-group")
    .attr("transform", function () {
      return (
        "translate(" +
        aleph.dotMargin.left +
        "," +
        (svgHeight - aleph.dotMargin.bottom) +
        ")"
      );
    });

  aleph.dots_xAxis = d3
    .scaleLinear()
    .domain([0, Math.ceil(aleph.xAxisMax[aleph.dotAxisType] / 0.5) * 0.5])
    .range([0, svgWidth - aleph.dotMargin.left - aleph.dotMargin.right]);

  d3.selectAll(".aleph-dot-group")
    .append("g")
    .attr("class", "aleph-dotChart-axis-group")
    .attr("transform", "translate(0,0)");

  // append g element to hold dot x-axis
  d3.selectAll(".aleph-dotChart-axis-group")
    .append("g")
    .attr("class", "axis axis--x dot-xAxis")
    .style("display", "inline")
    .attr("transform", "translate(" + 0 + "," + 0 + ")")
    .call(d3.axisBottom(aleph.dots_xAxis));

  // define append and draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var xticks = d3
    .selectAll(".axis.axis--x.dot-xAxis")
    .selectAll(".tick")
    .classed("x-axis-tick", true);
  xticks
    .append("svg:line")
    .attr("class", "aleph-xAxisTicks")
    .attr("y0", 0)
    .attr("y1", -svgHeight + aleph.dotMargin.top + aleph.dotMargin.bottom)
    .attr("x1", 0)
    .attr("x2", 0);

  // add axis main title label to x axis
  d3.selectAll(".axis.axis--x.dot-xAxis")
    .append("text")
    .attr("class", "aleph-xAxisTitle")
    .attr("x", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right - 25)
    .attr("y", 50)
    .text("Percentage of total " + aleph.dotAxisType + " population");

  d3.selectAll(".axis.axis--x.dot-xAxis")
    .append("svg:image")
    .attr("class", function (d, i) {
      if (aleph.dotAxisType == "UK") {
        return "aleph-axisChange expand";
      } else {
        return "aleph-axisChange contract";
      }
    })
    .attr("xlink:href", "image/expand.svg")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right - 25)
    .attr("y", 17.5)
    .on("click", function () {
      var oneBar = d3.selectAll(".aleph-axisChange");

      oneBar.classed("expand", !oneBar.classed("expand"));
      oneBar.classed("contract", !oneBar.classed("contract"));

      if (d3.select(this).classed("contract")) {
        aleph.dotAxisType = "REGION";
        d3.select(this).attr("xlink:href", "image/contract.svg");
        aleph.dots_xAxis.domain([
          0,
          Math.ceil(aleph.xAxisMax[aleph.dotAxisType] / 0.5) * 0.5,
        ]);
        d3.selectAll(".aleph-xAxisTitle").text(
          "Percentage of total REGION population"
        );
      } else {
        aleph.dotAxisType = "UK";
        d3.select(this).attr("xlink:href", "image/expand.svg");
        aleph.dots_xAxis.domain([
          0,
          Math.ceil(aleph.xAxisMax[aleph.dotAxisType] / 0.5) * 0.5,
        ]);
        d3.selectAll(".aleph-xAxisTitle").text(
          "Percentage of total UK population"
        );
      }

      aleph.CLONEDnestedDotObject.sort(function (x, y) {
        if (aleph.sortOrder != "Region") {
          return d3.descending(
            x.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType],
            y.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType]
          );
        } else {
          return d3.ascending(x.regionID, y.regionID);
        }
        // if (d3.selectAll(".aleph-axisChange").classed("contract")) {
        //   return d3.descending(
        //     (x.values[aleph.dotYear][aleph.sortOrder] /
        //       x.values[aleph.dotYear]["regionTotal"]) *
        //       100,
        //     (y.values[aleph.dotYear][aleph.sortOrder] /
        //       y.values[aleph.dotYear]["regionTotal"]) *
        //       100
        //   );
        // } else {
        //   return d3.descending(
        //     (x.values[aleph.dotYear][aleph.sortOrder] /
        //       aleph.dotYearTotals[aleph.dotYear]) *
        //       100,
        //     (y.values[aleph.dotYear][aleph.sortOrder] /
        //       aleph.dotYearTotals[aleph.dotYear]) *
        //       100
        //   );
        // }
      });

      // append g element to hold dot x-axis
      d3.selectAll(".axis.axis--x.dot-xAxis")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .call(d3.axisBottom(aleph.dots_xAxis));

      var xticks = d3
        .selectAll(".axis.axis--x.dot-xAxis")
        .selectAll(".tick")
        .classed("x-axis-tick", true);
      xticks
        .append("svg:line")
        .attr("class", "aleph-xAxisTicks")
        .attr("y0", 0)
        .attr("y1", -svgHeight + aleph.dotMargin.top + aleph.dotMargin.bottom)
        .attr("x1", 0)
        .attr("x2", 0);

      aleph.dots_yAxis
        .domain(
          aleph./* nestedDotObject */ CLONEDnestedDotObject.map(function (d) {
            return d.region;
          })
        )
        .copy();

      d3.selectAll(".dot-region-group")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .attr("transform", function (d) {
          return (
            "translate(" +
            0 +
            "," +
            Number(aleph.dotMargin.top + aleph.dots_yAxis(d.region)) +
            ")"
          );
        });

      d3.selectAll(".axis.axis--y.dot-yAxis")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .call(d3.axisLeft(aleph.dots_yAxis));

      d3.selectAll(".aleph-dot-chart-region-line")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .attr("x1", function (d) {
          if (d3.selectAll(".aleph-axisChange").classed("contract")) {
            return aleph.dots_xAxis((d.min / d.regionTotal) * 100);
          } else {
            return aleph.dots_xAxis(
              (d.min / aleph.dotYearTotals[aleph.dotYear]) * 100
            );
          }
        })
        .attr("x2", function (d, i) {
          if (d3.selectAll(".aleph-axisChange").classed("contract")) {
            return aleph.dots_xAxis((d.max / d.regionTotal) * 100);
          } else {
            return aleph.dots_xAxis(
              (d.max / aleph.dotYearTotals[aleph.dotYear]) * 100
            );
          }
        });

      d3.selectAll(".aleph-dot-chart-region-circle")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .attr("cx", function (d, i) {
          return aleph.dots_xAxis(d[0][aleph.dotAxisType]);
        });

      d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line")
        .transition()
        .duration(1250)
        .ease(d3.easeLinear)
        .style("opacity", function (d, i) {
          if (aleph.sortOrder == "Region") {
            return 0.0;
          } else {
            return 1.0;
          }
        })
        .style("stroke", function (d, i) {
          aleph.sortOrderIndex = aleph.allowedDotAgeBands.indexOf(
            aleph.sortOrder
          );
          return aleph.dotlegendColours[aleph.sortOrderIndex /*  - 2 */];
        })
        .attr("d", aleph.connectorline);

      return;
    }); // end on.click

  // draw tick grid lines extending from y-axis ticks on axis across scatter graph
  var yticks = d3
    .selectAll(".axis.axis--y.dot-yAxis")
    .selectAll(".tick")
    .classed("y-axis-tick", true);
  yticks
    .append("svg:line")
    .attr("class", "aleph-yAxisTicks")
    .attr("y0", 0)
    .attr("y1", 0)
    .attr("x1", 0)
    .attr("x2", svgWidth - aleph.dotMargin.left - aleph.dotMargin.right);

  // call function to append axis tick marks to slider
  setDotSliderTicks("#dots-slider");

  aleph.CLONEDnestedDotObject.sort(function (x, y) {
    if (!x.values[aleph.dotYear]["data"][aleph.sortOrder]) {
      aleph.sortOrder = "Region";
    }

    if (aleph.sortOrder != "Region") {
      return d3.descending(
        x.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType],
        y.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType]
      );
    } else {
      return d3.ascending(x.regionID, y.regionID);
    }
  }); // end sort ...

  aleph.dots_yAxis = d3
    .scaleBand()
    .rangeRound([0, svgHeight - aleph.dotMargin.top - aleph.dotMargin.bottom])
    .padding(0.0)
    .domain(
      aleph.CLONEDnestedDotObject.map(function (d) {
        return d.region;
      })
    )
    .copy();

  // append g element to hold dot y-axis
  d3.selectAll(".aleph-dotChart-axis-group")
    .append("g")
    .attr("class", "axis axis--y dot-yAxis")
    .attr(
      "transform",
      "translate(" +
      0 +
      "," +
      (-svgHeight + aleph.dotMargin.top + aleph.dotMargin.bottom) +
      ")"
    )
    .call(d3.axisLeft(aleph.dots_yAxis));

  d3.selectAll(".axis.axis--y.dot-yAxis")
    .selectAll(".tick")
    .classed("y-axis-tick", true)
    .selectAll("text")
    .on("mouseover", function (d, i) {
      // D3 v4
      // determine x and y coordinates of cursor pointer
      var x = d3.event.pageX;
      var y = d3.event.pageY;
      var region = d;

      aleph.chartDragX = x;
      aleph.chartDragY = y;
      d3.select(this).style("fill-opacity", 1.0);

      // // function called to define and build tooltip structure and content
      cursorCoords(x, y, region);
      return;
    })
    // .on("mousemove", function (d, i) {
    //   // call function to update coordinates and position of tooltip
    //   // D3 v4
    //   var x = d3.event.pageX;
    //   var y = d3.event.pageY;

    //   // function called to define and build tooltip structure and content
    //   cursorCoords(i, d, x, y, valuesToPlotNew, d);
    //   return;
    // })
    .on("mouseout", function () {
      d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", true);
      return;
    });

  d3.selectAll(".axis.axis--y.dot-yAxis")
    .append("text")
    .attr("class", "aleph-yAxisTitle")
    .attr("x", 0)
    .attr("y", -5)
    .text(aleph.axisMainTitles.dotChart.y);

  d3.selectAll(".aleph-dotChart-axis-group")
    .append("g")
    .attr("class", "dot-region-groups-group")
    .attr("transform", function (d) {
      return "translate(" + 0 + "," + (-svgHeight + aleph.dotMargin.top) + ")";
    });

  d3.selectAll(".dot-region-groups-group")
    .selectAll(".dot-region-group")
    .data(aleph.CLONEDnestedDotObject)
    .enter()
    .append("g")
    .attr("class", function (d) {
      return "dot-region-group " + CharacterToCharacter(d.region, " ", "-");
    })
    .attr("transform", function (d) {
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

  // Append path for plotted data line
  d3.selectAll(".dot-region-groups-group")
    .append("path")
    .datum(aleph.CLONEDnestedDotObject)
    .attr("class", "aleph-sortOrder-DataPoint-Connection-Line")
    .style("fill", function (d) {
      return "none";
    })
    .style("stroke", function (d, i) {
      aleph.sortOrderIndex = aleph.allowedDotAgeBands.indexOf(aleph.sortOrder);

      return aleph.dotlegendColours[aleph.sortOrderIndex /*  - 2 */];
    })
    .style("stroke-linecap", "round")
    .style("stroke-width", function () {
      return 5;
    })
    .style("opacity", function () {
      if (aleph.sortOrder == "Region") {
        return 0.0;
      } else {
        return 1.0;
      }
    })
    .attr("d", aleph.connectorline);

  // call function to append ticks to slider bar.
  setDotSliderTicks("#dots-slider");

  return;
} // end function drawDotsChart

function drawLine(region, regionValues) {
  var values = [regionValues[aleph.dotYear]];
  var formattedRegionStr = CharacterToCharacter(region, " ", "-");

  d3.selectAll(".dot-region-group." + formattedRegionStr)
    .selectAll(".aleph-dot-chart-region-line")
    .data(values)
    .enter()
    .append("line")
    .attr("class", function (d) {
      return "aleph-dot-chart-region-line";
    })
    .attr("x1", function (d) {
      if (d3.selectAll(".aleph-axisChange").classed("contract")) {
        return aleph.dots_xAxis((d.min / d.regionTotal) * 100);
      } else {
        return aleph.dots_xAxis(
          (d.min / aleph.dotYearTotals[aleph.dotYear]) * 100
        );
      }
    })
    .attr("x2", function (d, i) {
      if (d3.selectAll(".aleph-axisChange").classed("contract")) {
        return aleph.dots_xAxis((d.max / d.regionTotal) * 100);
      } else {
        return aleph.dots_xAxis(
          (d.max / aleph.dotYearTotals[aleph.dotYear]) * 100
        );
      }
    })
    .attr("y1", function (d, i) {
      return aleph.dots_yAxis.bandwidth() / 2;
    })
    .attr("y2", function (d, i) {
      return aleph.dots_yAxis.bandwidth() / 2;
    });

  // aleph.dots_xAxis.domain([0, aleph.xAxisMax]);
  // d3.selectAll(".axis.axis--x.dot-xAxis")
  //   .transition()
  //   .duration(0)
  //   .ease(d3.easeLinear)
  //   .call(d3.axisBottom(aleph.dots_xAxis));

  d3.selectAll(".aleph-dot-chart-region-circle").moveToFront();

  return;
} // end function drawLine

function drawCircles(region, regionYearValues) {
  var formattedRegionStr = CharacterToCharacter(region, " ", "-");
  // var values = regionYearValues[aleph.dotYear];
  var valuesNew = regionYearValues[aleph.dotYear].data;
  valuesToPlotNew = [];

  for (var element in valuesNew) {
    if (element != "index") {
      valuesToPlotNew.push([valuesNew[element]]);
    }
  }

  /*

  CIRCLES

  */

  d3.selectAll(".dot-region-group." + formattedRegionStr)
    .selectAll("circle")
    .data(valuesToPlotNew)
    .enter()
    .append("circle")
    .attr("class", function (d, i) {
      var ageBand = d[0].ageBand.replace("<", "under");

      return (
        "aleph-dot-chart-region-circle ageband-circle-" +
        i +
        " ageBandIndex-" +
        i +
        " AB-" +
        CharacterToCharacter(ageBand, " ", "-")
      );
    })
    .attr("cx", function (d, i) {
      if (
        $(
          ".aleph-dots-svg-legend-swatch-rect.aleph-dots-svg-legend-swatch-rect-" +
          i
        ).hasClass("aleph-semi-transparent")
      ) {
        d3.select(this).classed("aleph-fullTransparent", true);
      }
      return aleph.dots_xAxis(d[0][aleph.dotAxisType]);
    })
    .attr("cy", aleph.dots_yAxis.bandwidth() / 2)
    .attr("r", 12.5)
    .style("fill", function (d, i) {
      return aleph
        .dotlegendColours[aleph.allowedDotAgeBands.indexOf(d[0].ageBand)];
    })
    .style("stroke", function (d, i) {
      return aleph
        .dotlegendColours[aleph.allowedDotAgeBands.indexOf(d[0].ageBand)];
    });
  // .on("mouseover", function (d, i) {
  //   // D3 v4
  //   // determine x and y coordinates of cursor pointer
  //   var x = d3.event.pageX;
  //   var y = d3.event.pageY;

  //   aleph.chartDragX = x;
  //   aleph.chartDragY = y;

  //   d3.select(this).style("fill-opacity", 1.0);

  //   // // function called to define and build tooltip structure and content
  //   cursorCoords(x, y, region);
  //   return;
  // })
  // .on("mousemove", function (d, i) {
  //   // call function to update coordinates and position of tooltip
  //   // D3 v4
  //   var x = d3.event.pageX;
  //   var y = d3.event.pageY;

  //   // function called to define and build tooltip structure and content
  //   cursorCoords(x, y, region);
  //   return;
  // })
  // .on("mouseout", function () {
  //   d3.selectAll(".aleph-toolTip-Div").classed("aleph-hide", true);
  //   return;
  // });

  return;
} // end function drawCircles()

// https://stackoverflow.com/questions/3954438/how-to-remove-item-from-array-by-value
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

// var ary = ['three', 'seven', 'eleven'];

// ary.remove('seven')

/*





/*





  NAME: dot_playStop 
  DESCRIPTION: function called to impl;ment user request to start or stop time interval slider
  ARGUMENTS TAKEN: button - DOM information of button pressed
  ARGUMENTS RETURNED: none
  CALLED FROM: index.html
  CALLS:  transitionPyramidChart()
          updateInformationLabels()
          myDot_StopFunction()
*/
function dot_playStop(button) {
  // locally store DOM information for button pressed
  var value = button.value;

  // is slider is not currently auto-cycling throguh time series
  if (value == "play") {
    // update state to 'stop'
    button.value = "stop";

    // modify text label of button
    d3.select("#" + button.id).text("Stop");

    // declare settimeinterval var
    aleph.myPopProportionsSetInterval = setInterval(myTimer, aleph.setInterval);

    /*    
    NAME: myTimer 
    DESCRIPTION: function called action timer interval functionality
    ARGUMENTS TAKEN: none
    ARGUMENTS RETURNED:
    CALLED FROM: dot_playStop
    CALLS:  transitionPyramidChart()
            updateInformationLabels()
  */
    function myTimer() {
      //increment dot chart year counter by one.
      aleph.dotYearIndex++;

      // if slider has reached end of time interval slider represents ...
      if (aleph.dotYearIndex > aleph.years.length - 1) {
        // reset counter to 0 for next loop around (if not stopped by user)
        aleph.dotYearIndex = 0;
      }

      // detewrmine year dot chart is meant to represent
      aleph.dotYear = aleph.years[aleph.dotYearIndex];
      $("#dots-slider").slider("option", "value", aleph.dotYear);
      // transitionPyramidChart();
      // updateInformationLabels();
    }
  }
  // else user has requested to stop auto cycling around time interval.
  else {
    button.value = "play";
    d3.select("#" + button.id).text("Play");

    // call function to stop auto-cycling through of tiem series slider
    myDot_StopFunction();
  }
  return;
} // end function dot_playStop

/*





  NAME: myDot_StopFunction 
  DESCRIPTION: function called to stop time slider auto-cycling through time series
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: dot_playStop()
  CALLS: clearInterval()
*/
function myDot_StopFunction() {
  clearInterval(aleph.myPopProportionsSetInterval);
  return;
} // end function myDot_StopFunction

/*





  NAME: addDotSelectionLists 
  DESCRIPTION: function called to build .chosen style selection lists to page
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: onload
  CALLS:
*/
function addDotSelectionLists(src) {
  for (var list in aleph.selectionListConfigurations.dot) {
    var id = aleph.selectionListConfigurations.dot[list].id;
    var value = aleph.selectionListConfigurations.dot[list].value;
    var multiple = aleph.selectionListConfigurations.dot[list].multiple;
    var title = aleph.selectionListConfigurations.dot[list].title;
    var dataStyle = aleph.selectionListConfigurations.dot[list]["data-style"];
    var dataActionsBox =
      aleph.selectionListConfigurations.dot[list]["data-actions-box"];
    var dataWidth = aleph.selectionListConfigurations.dot[list]["data-width"];
    var dataDropupAuto =
      aleph.selectionListConfigurations.dot[list]["data-dropup-auto"];
    var dataHeader = aleph.selectionListConfigurations.dot[list]["data-header"];
    var defaults = aleph.selectionListConfigurations.dot[list]["defaults"];
    var container = aleph.selectionListConfigurations.dot[list]["container"];
    var selectedTextFormat =
      aleph.selectionListConfigurations.dot[list]["data-selected-text-format"];

    var valueIndexArray = [];
    aleph.selectionListToUse = [];
    aleph.sortCodes = {};

    // aleph.CLONEDnestedDotObject = JSON.parse(
    //   JSON.stringify(aleph.MASTERnestedDotObject)
    // );

    if (src == "onload") {
      aleph.selectionListToUse = aleph.selectionLists[list];
      aleph.sortCodes = aleph.codes[list];
    } /* reload*/ else {
      aleph.selectionListToUse = ["Region"].concat(aleph.allowedDotAgeBands);

      aleph.selectionListToUse.forEach(function (d, i) {
        aleph.sortCodes[i] = d;
      });
    }

    for (
      var i = 1;
      i < /* aleph.selectionLists[list] */ aleph.selectionListToUse.length + 1;
      i++
    ) {
      valueIndexArray.push(i);
    } // end for loop

    // build and manipulate data arrays to help populate array...
    var options = d3.zip(
      /* aleph.selectionLists[list] */ aleph.selectionListToUse,
      valueIndexArray,
      /* aleph.codes[list] */ aleph.sortCodes
    );

    // sort list element array
    aleph.options = options.sort(function (b, a) {
      return d3.descending(a[1], b[1]);
    });

    d3.selectAll("." + container)
      .append("select")
      .attr("class", "selectpicker form-control " + list)
      .attr("id", id)
      .attr("value", value)
      .attr("multiple", multiple)
      .attr("title", title)
      .attr("data-style", dataStyle)
      .attr("data-actions-box", dataActionsBox)
      .attr("data-width", dataWidth)
      .attr("data-dropup-auto", dataDropupAuto)
      .attr("data-header", dataHeader)
      .attr("data-selected-text-format", selectedTextFormat);

    d3.select("#" + id)
      .selectAll(".selectOptions." + list)
      .data(aleph.options)
      .enter()
      .append("option")
      .attr("selected", function (d) {
        if (d[0] == aleph.sortOrder) {
          return true;
        }
      })
      .attr("class", "selectOptions " + list)
      .attr("value", function (d) {
        return d[1];
      })
      .text(function (d) {
        return d[2];
      });

    $("#" + id).selectpicker({
      style: "btn-primary",
    });

    $("#" + id).on(
      "changed.bs.select",
      function (e, clickedIndex, isSelected, previousValue) {
        var list = this.id.replace("dot-selectpicker-", "");

        var sortOrderIndex = clickedIndex - 1;
        var sortOrder = aleph.selectionListToUse[sortOrderIndex];

        aleph.sortOrderIndex = aleph.allowedDotAgeBands.indexOf(sortOrder);
        aleph.sortOrder = sortOrder;

        if (clickedIndex != 1) {
          d3.selectAll(".aleph-dots-svg-legend-swatch-rect-indicator").style(
            "display",
            "none"
          );
          d3.selectAll(
            ".aleph-dots-svg-legend-swatch-rect-indicator-" + (clickedIndex - 2)
          ).style("display", "inline");

          aleph.CLONEDnestedDotObject.sort(function (x, y) {
            return d3.descending(
              x.values[aleph.dotYear]["data"][aleph.sortOrder][
              aleph.dotAxisType
              ],
              y.values[aleph.dotYear]["data"][aleph.sortOrder][
              aleph.dotAxisType
              ]
            );
          });
        } else {
          d3.selectAll(".aleph-dots-svg-legend-swatch-rect-indicator").style(
            "display",
            "none"
          );

          aleph.CLONEDnestedDotObject.sort(function (x, y) {
            return d3.ascending(x.regionID, y.regionID);
          });
        } // end else ....

        aleph.dots_yAxis
          .domain(
            aleph.CLONEDnestedDotObject.map(function (d) {
              return d.region;
            })
          )
          .copy();

        d3.selectAll(".dot-region-group")
          .transition()
          .duration(1250)
          .ease(d3.easeLinear)
          .attr("transform", function (d) {
            return (
              "translate(" +
              0 +
              "," +
              Number(aleph.dotMargin.top + aleph.dots_yAxis(d.region)) +
              ")"
            );
          });

        d3.selectAll(".axis.axis--y.dot-yAxis")
          .transition()
          .duration(1250)
          .ease(d3.easeLinear)
          .call(d3.axisLeft(aleph.dots_yAxis));

        d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line")
          .transition()
          .duration(1250)
          .ease(d3.easeLinear)
          .style("opacity", function (d, i) {
            if (aleph.sortOrder == "Region") {
              return 0.0;
            } else {
              return 1.0;
            }
          })
          .style("stroke", function (d, i) {
            aleph.sortOrderIndex = aleph.allowedDotAgeBands.indexOf(
              aleph.sortOrder
            );
            return aleph.dotlegendColours[aleph.sortOrderIndex /*  - 2 */];
          })
          .attr("d", aleph.connectorline);

        d3.selectAll(
          ".ageband-circle-" + aleph.sortOrderIndex /*  - 2 */
        ).moveToFront();
      }
    ); // end .on...
  } // end for loop ...

  return;
} // end function addDotSelectionLists

// define line generator for main data lines plotted on chart.
aleph.connectorline = d3
  .line()
  .x(function (d) {
    var perc = 0;

    if (aleph.sortOrder == "Region") {
      perc = 0;
    } else {
      perc =
        d.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType];
    }
    return aleph.dots_xAxis(perc);
  })
  .y(function (d) {
    return (
      aleph.dotMargin.top +
      aleph.dots_yAxis(d.region) +
      aleph.dots_yAxis.bandwidth() / 2
    );
  });

/*





  NAME: addDotLegend 
  DESCRIPTION: function to add legend reference to vis page.
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: drawDotsChart
  CALLS: none   
*/
function addDotLegend() {
  // determine page size/dimensions
  svgWidth = $(".aleph-chart.aleph-dot-chart").width();
  svgHeight = $(".aleph-chart.aleph-dot-chart").height();

  /*
    ADDING AND IMPLEMENTING NEW CHART LEGEND; VERTICALLY ORIENTATED, INTERACTIVE AND DRAGGABLE
  */

  var newLegend = d3
    .select("body")
    .append("div")
    .attr("class", "aleph-newLegend-container");

  aleph.dotsLegend_new = d3
    .select(".aleph-newLegend-container")
    .selectAll(".containerDiv_dynamic")
    .data(aleph.dot_legend_labels)
    .enter()
    .append("div")
    .attr("class", function (d, i) {
      return (
        "containerDiv containerDiv_dynamic containerDiv-" +
        i +
        " aleph-dots-div-legend-swatch-rect-" +
        i
      );
    })
    .attr("id", function (d, i) {
      return "f" + i;
    })
    .attr("value", function (d, i) {
      return i;
    });

  aleph.dotsLegend_new
    .append("p")
    .attr("draggable", true)
    .attr("class", function (d, i) {
      return "ageBand-" + CharacterToCharacter(d, " ", "-");
    })
    .attr("id", function (d, i) {
      return "c" + i;
    })
    .attr("value", function (d, i) {
      return i;
    })
    .attr("data", function (d, i) {
      return i;
    })
    .text(function (d, i) {
      return d;
    });

  d3.selectAll(".aleph-newLegend-container")
    .append("div")
    .attr(
      "class",
      "containerDiv containerDiv_static DeselectAllAgeBandsDiv deselect"
    )
    .attr("id", "DeselectAllAgeBandsDiv")
    .text("De-select All Age Bands")
    .on("click", function () {
      d3.select(this)
        .classed("deselect", !d3.select(this).classed("deselect"))
        .classed("select", !d3.select(this).classed("select"))

        .text(function () {
          if ($(this).hasClass("deselect")) {
            d3.selectAll(".containerDiv.containerDiv_dynamic").classed(
              "aleph-semi-transparent",
              false
            );

            d3.selectAll(".aleph-dot-chart-region-circle").classed(
              "aleph-fullTransparent",
              false
            );

            aleph.nonDisplayedAgeBands = [];

            d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line").classed(
              "aleph-hide",
              false
            );

            return "De-select All Age Bands";
          } else {
            d3.selectAll(".containerDiv.containerDiv_dynamic").classed(
              "aleph-semi-transparent",
              true
            );

            d3.selectAll(".aleph-dot-chart-region-circle").classed(
              "aleph-fullTransparent",
              true
            );

            d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line").classed(
              "aleph-hide",
              true
            );

            // aleph.nonDisplayedAgeBands = ["<16", "16 and 17", "18 and 19", ""];

            return "Select All Age Bands";
          }
        });
      return;
    });

  d3.selectAll(".aleph-newLegend-container")
    .append("div")
    .attr("class", "containerDiv containerDiv_static viewAllDataDiv all")
    .attr("id", "viewAllDataDiv")
    .on("click", function () {
      d3.select(this)
        .classed("all", !d3.select(this).classed("all"))
        .classed("selected", !d3.select(this).classed("selected"));

      if ($(this).hasClass("all")) {
        d3.select(this).text("Display Selected Statistics");
      } else {
        d3.select(this).text("Display All Statistics");
      }

      return;
    })
    .text("Display Selected Statistics");

  document.addEventListener("drop", function (event) {
    drop(event);
  });

  document.addEventListener("dragover", function (event) {
    allowDrop(event);
  });

  document.addEventListener("dragstart", function (event) {
    drag(event);
  });

  document.addEventListener("dblclick", function (event) {
    doubleClickToSplit(event);
  });

  // document.addEventListener("click", function (event) {
  //   clickDiv(event);
  // });

  var elements = document.getElementsByClassName("containerDiv_dynamic");
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function (event) {
      clickDiv(event);
    });
  }

  // document.getElementsByClassName("containerDiv").addEventListener("click", function (event) {
  //   console.log("containerDiv")
  //   clickDiv(event);
  // });

  return;
} // end function addDotLegend

/*





  NAME: setUpDotsSlider 
  DESCRIPTION: function called to  
  ARGUMENTS TAKEN:  
  ARGUMENTS RETURNED: none
  CALLED FROM: 
  CALLS: none
*/
function setUpDotsSlider() {
  // Setter
  $("#dots-slider").slider("option", "value", Number(aleph.years[0]));
  $("#dots-slider").slider("option", "min", Number(aleph.years[0]));
  $("#dots-slider").slider(
    "option",
    "max",
    Number(aleph.years[aleph.years.length - 1])
  );

  return;
} // end function setUpDotsSlider

/*





  NAME: pyramid-slider 
  DESCRIPTION: fucntion to construct time interval slider to change pyramid
  ARGUMENTS TAKEN: none
  ARGUMENTS RETURNED: none
  CALLED FROM: user interaction with slider (index.html)
  CALLS: transitionPyramidChart()
         updateInformationLabels()
*/
$(function () {
  $("#dots-slider").slider({
    value: 2019,
    min: 2019,
    max: 2040,
    step: 1,
    slide: function (event, ui) {
      aleph.dotYear = ui.value;
      aleph.dotYearIndex = aleph.years.indexOf(aleph.dotYear.toString());
      transitionDotsChart_toNewYear();
    },
  });
});

function transitionDotsChart_toNewYear() {
  d3.selectAll(".aleph-dot-chart-region-circle").remove();
  d3.selectAll(".aleph-dot-chart-region-line").remove();

  aleph./* nestedDotObject */ CLONEDnestedDotObject.sort(function (x, y) {
    if (aleph.sortOrder != "Region") {
      return d3.descending(
        x.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType],
        y.values[aleph.dotYear]["data"][aleph.sortOrder][aleph.dotAxisType]
      );
    } else {
      return d3.ascending(x.regionID, y.regionID);
    }
  }); // end sort ...

  /* CONNECTOR LINE */
  aleph.dots_yAxis
    .domain(
      aleph./* nestedDotObject */ CLONEDnestedDotObject.map(function (d) {
        return d.region;
      })
    )
    .copy();

  d3.selectAll(".dot-region-group")
    .transition()
    .duration(1250)
    .ease(d3.easeLinear)
    .attr("transform", function (d) {
      return (
        "translate(" +
        0 +
        "," +
        Number(aleph.dotMargin.top + aleph.dots_yAxis(d.region)) +
        ")"
      );
    });

  /* CIRCLES */
  d3.selectAll(".dot-region-group").attr("transform", function (d, i) {
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

  d3.selectAll(".axis.axis--y.dot-yAxis").call(d3.axisLeft(aleph.dots_yAxis));

  if (aleph.sortOrder != "Region") {
    d3.selectAll(".aleph-sortOrder-DataPoint-Connection-Line")
      .style("opacity", function (d, i) {
        if (aleph.sortOrder == "Region") {
          return 0.0;
        } else {
          return 1.0;
        }
      })
      .style("stroke", function (d, i) {
        aleph.sortOrderIndex = aleph.allowedDotAgeBands.indexOf(
          aleph.sortOrder
        );
        return aleph.dotlegendColours[aleph.sortOrderIndex /*  - 2 */];
      })
      .attr("d", aleph.connectorline);
  }

  d3.selectAll(
    ".ageband-circle-" + aleph.sortOrderIndex /*  - 2 */
  ).moveToFront();

  return;
} // end function transitionDotsChart_toNewYear

/*





  NAME: setDotSliderTicks 
  DESCRIPTION:
  ARGUMENTS TAKEN: el - DOM reference name to slider to append ticks to.
  ARGUMENTS RETURNED: none
  CALLED FROM: buildPyramids()
  CALLS: none    
// https://www.sitepoint.com/community/t/custom-range-slider-with-ticks/319324
*/
function setDotSliderTicks(el) {
  // initialise reelvant slider variables in function.
  var $slider = $(el);

  var max = $slider.slider("option", "max");
  var min = $slider.slider("option", "min");
  var range = max - min;
  var step = $slider.slider("option", "step");
  var spacing = 100 / ((max - min) / step);

  // remove previuous ticks and labels before redrawing
  $slider.find(".ui-slider-tick-mark").remove();
  $slider.find(".ui-slider-tick-label").remove();

  // loop through number of ticks calculated to add
  for (var i = 0; i <= (max - min) / step; i++) {
    // append tick span DOM item
    $('<span class="ui-slider-tick-mark"></span>')
      .css("left", spacing * i - 0.0 + "%")
      .appendTo($slider);

    // append tick label span DOM item
    $('<span class="ui-slider-tick-label"></span>')
      .text(aleph.years[i])
      .css("top", function () {
        return "-5px";
      })
      .css("left", function () {
        if (i == 0) {
          return spacing * i - 7.5 + "%";
        } else if (i == range) {
          return spacing * i + 1.5 + "%";
        } else {
          return "none";
        }
      })
      .css("display", function () {
        if (i == 0 || i == range) {
          return "inline";
        } else {
          return "none";
        }
      })
      .appendTo($slider);
  }

  d3.selectAll(".ui-slider-svg").moveToFront();

  return;
} // end function setDotSliderTicks

/*  




    NAME: cursorCoords 
    DESCRIPTION: function called determine dynamically by the current positioning of the cursor, and thus where to display toolip on event rectangle interaction
    ARGUMENTS TAKEN:  x - cursor x coordinate on browser
                      y - cursor y coordinate on browser
    ARGUMENTS RETURNED: none
    CALLED FROM: mouse move interaction in submitLineSelection
    CALLS: numberWithCommas
    USEFUL: // https://stackoverflow.com/questions/16770763/mouse-position-in-d3
*/
function cursorCoords(x, y, region) {
  d3.selectAll(".toolTip-content-to-Remove").remove();

  var valuesToPlotNew_v2;

  aleph.CLONEDnestedDotObject.forEach(function (d, i) {
    if (region == d.region) {
      valuesToPlotNew_v2 = d.values[aleph.dotYear].data;
    }
  });

  // console.log(region);
  // console.log(aleph.CLONEDnestedDotObject);
  // console.log(valuesToPlotNew_v2)
  // console.log(valuesToPlotNew)

  var dataToPresent = [];
  for (var el in valuesToPlotNew_v2) {
    // console.log(el, valuesToPlotNew_v2[el])
    dataToPresent.push(valuesToPlotNew_v2[el]);
  }
  // console.log(dataToPresent);

  dataToPresent.sort(function (x, y) {
    // console.log(x,y)
    return d3.ascending(x.index, y.index);
  });

  // console.log(dataToPresent)

  // valuesToPlotNew.sort(function (x, y) {
  //   return d3.ascending(x[0].index, y[0].index);
  // });

  // update global chart width and height dimensions
  aleph.chartWidth = svgWidth;
  aleph.chartHeight = svgHeight;

  // modify class definiton of tooltip 'g' element and current offset position based on mouse cursor position
  d3.selectAll(".aleph-toolTip-Div")
    .moveToFront()
    .classed("aleph-hide", false)
    .style("left", function () {
      if (x < aleph.chartWidth / 2) {
        return x + 15 + "px"; // left half
      } else {
        return x - aleph.toolTipDimensions.width - 15 + "px"; // right half
      }
    })
    .style("top", function () {
      if (y < aleph.chartHeight / 2) {
        return y + 15 + "px"; // top half
      } else {
        var ttHeight = d3
          .selectAll(".aleph-toolTip-Div")
          .style("height")
          .replace("px", "");

        return y - aleph.toolTipDimensions.height + 15 + "px"; // bottom half
      }
    });

  // append tooltip title label
  d3.selectAll(".aleph-toolTip-Div")
    .append("label")
    .attr("class", "aleph-toolTipTitle-label  toolTip-content-to-Remove")
    .style("position", "relative")
    .style("display", "block")
    .style("text-anchor", "middle")
    .html(region + " (" + aleph.dotYear + ")");

  d3.selectAll(".aleph-toolTip-Div")
    .append("table")
    .attr("class", "tooltip-table toolTip-content-to-Remove")
    .style("width", "100%")
    .style("height", "100%");

  d3.selectAll(".tooltip-table").append("tr").attr("class", "table-header-row");

  var headers = [
    "Marker",
    "Age Band",
    "# in Age Band",
    "% in Region*",
    "% in UK*",
  ];

  headers.forEach(function (d, i) {
    d3.selectAll(".table-header-row")
      .append("td")
      .attr("class", "table-header-row-header-cell header-cell-" + i)
      .style("width", "auto");

    d3.selectAll(".table-header-row-header-cell.header-cell-" + i)
      .append("label")
      .attr(
        "class",
        "table-header-row-header-cell-label header-cell-label-" + i
      )
      .text(headers[i]);
  });

  console.log(aleph.nonDisplayedAgeBands);
  console.log(dataToPresent);

  /* valuesToPlotNew */ dataToPresent.forEach(function (d, i) {
    var rowData = d;

    if (
      (aleph.nonDisplayedAgeBands.indexOf(rowData.ageBand) == -1 &&
        $("#viewAllDataDiv").hasClass("selected")) ||
      ($("#viewAllDataDiv").hasClass("all") && $("#DeselectAllAgeBandsDiv").hasClass("deselect"))
    ) {
      var rowNumber = i;
      d3.selectAll(".tooltip-table")
        .append("tr")
        .attr(
          "class",
          "tooltip-table-row toolTip-content-to-Remove tooltip-table-row-" +
          rowNumber
        )
        .style("width", "100%");

      for (
        var columnNumber = 0;
        columnNumber < headers.length;
        columnNumber++
      ) {
        d3.selectAll(".tooltip-table-row-" + rowNumber)
          .append("td")
          .attr("class", function () {
            return "table-dataCell table-dataCell-" + columnNumber;
          });

        if (columnNumber == 0) {
          d3.selectAll(".tooltip-table-row-" + rowNumber)
            .selectAll(".table-dataCell-" + columnNumber)
            .append("div")
            .attr("class", "table-marker table-marker-" + rowNumber)
            .style("background-color", function () {
              return aleph
                .dotlegendColours[aleph.allowedDotAgeBands.indexOf(d.ageBand)];
            });
        } else {
          d3.selectAll(".tooltip-table-row-" + rowNumber)
            .selectAll(".table-dataCell-" + columnNumber)
            .append("label")
            .attr(
              "class",
              "table-cell-text-content table-cell-text-content-" + columnNumber
            )
            .text(function () {
              if (columnNumber == 1) {
                return rowData.ageBand;
              } else if (columnNumber == 2) {
                return numberWithCommas(rowData.count);
              } else if (columnNumber == 3) {
                return rowData.REGION.toFixed(1);
              } else if (columnNumber == 4) {
                return rowData.UK.toFixed(1);
              }
            });
        }
      }
    } else {
      // console.log("(", i, ")  DO NOT display:", rowData);
    }
  });

  d3.selectAll(".aleph-toolTip-Div")
    .append("label")
    .attr("class", "aleph-tooltip-footer toolTip-content-to-Remove")
    .text("* Column may not total 100% due to rounding.");

  d3.selectAll(".aleph-toolTip-Div").moveToFront();

  return;
} // end function cursorCoords

function sortParas(targetDiv) {
  var theContainer = $(targetDiv); // You could use body if all the rows are children of body
  var theRows = $(targetDiv).children();

  theRows = theRows.sort(function (a, b) {
    var aKBPS = a.attributes.value.value;
    var bKBPS = b.attributes.value.value;

    return aKBPS < bKBPS ? -1 : aKBPS < bKBPS ? 1 : 0;
  });
  theContainer.append(theRows);
  return;
}

// https://stackoverflow.com/questions/24276442/merging-2-div-content-on-drag-and-drop-of-div-on-one-another-using-jquery
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
  aleph.source = event.target.className;
  aleph.sourceValue = d3.select("#" + ev.target.id).attr("value");
}

function drop(ev) {
  ev.preventDefault();

  var data = ev.dataTransfer.getData("Text");
  var target =
    "." +
    $("#" + ev.target.id)
      .parent()[0]
      .className.split(" ")
      .join(".");

  aleph.target = d3.select("#" + ev.target.id)._groups[0][0].className;
  aleph.targetValue = d3.select("#" + ev.target.id).attr("value");

  // code to prevent drop if  legend ageband selected to drop into is not adjacent to selected, dragging ageband.
  // check to see if adjacent ageBands have been selected for merging.
  // if yes,
  if (
    aleph.sourceValue != parseInt(Number(aleph.targetValue) + 1) &&
    aleph.sourceValue != parseInt(Number(aleph.targetValue) - 1)
  ) {
    return;
  } else {
  }

  // append new text to newly costructed DIV
  $("#" + ev.target.id)
    .parent()
    .append($("#" + data));

  sortParas(target);
  recalculateAgeBands();

  return;
} // end function drop()

function doubleClickToSplit(ev) {
  ev.preventDefault();

  var clickedContainer = $("#" + ev.target.id).parent()[0].id;

  var clickedContainerLabels = d3.select("#" + clickedContainer).selectAll("p")
    ._groups[0];

  // for each label in clicked container.
  clickedContainerLabels.forEach(function (d, i) {
    var ID = d.id;
    var value = d3.select("#" + ID).attr("value");
    var data = d3.select("#" + ID).attr("data");

    var ID_text_paragraph = d3.select("#" + ID)._groups[0][0].innerText;
    var new_parentContainer_ID = ID.replace("c", "f");

    // remove unwanted/needed container
    d3.select("#" + ID).remove();

    d3.select("#" + new_parentContainer_ID)
      .append("p")
      .attr("draggable", true)
      .attr("class", "ageBand-" + CharacterToCharacter(d.innerText, " ", "-"))
      .attr("id", ID)
      .attr("value", value)
      .attr("data", data)
      .text(ID_text_paragraph);

    d3.select("#" + new_parentContainer_ID).classed("aleph-hide", false);
  });

  // call function to recalucate new pop. agebands
  recalculateAgeBands();

  return;
} // end function doubleClickToSplit

function clickDiv(ev) {
  ev.preventDefault();

  var ID = ev.target.id.replace("c", "f");
  var containerValue = document.getElementById(ID).getAttribute("value");
  var containerAgeBandValue = "";

  // show/hide select ageBand data dots ..
  var this_ageBand = d3.select("#" + ID);
  // this_ageBand.classed(
  //   "aleph-semi-transparent",
  //   !this_ageBand.classed("aleph-semi-transparent")
  // );

  // var this_ageBandCircles = d3.selectAll(".ageband-circle-" + containerValue);

  // this_ageBandCircles.classed(
  //   "aleph-fullTransparent",
  //   !this_ageBandCircles.classed("aleph-fullTransparent")
  // );

  // console.log("\nclickDiv");
  // console.log(
  //   "ID:",
  //   ID,
  //   "containerValue:",
  //   containerValue,
  //   "this_ageBand:",
  //   this_ageBand
  // );

  // console.log(this_ageBand._groups[0]);
  var childNodes = this_ageBand._groups[0][0].childNodes;
  var firstChildNode = this_ageBand._groups[0][0].firstElementChild.innerText;
  var lastChildNode = this_ageBand._groups[0][0].lastElementChild.innerText;

  // console.log(firstChildNode);
  // console.log(lastChildNode);

  var start = firstChildNode.substring(0, 3);
  var len = firstChildNode.length;
  var end = lastChildNode.substr(len - 2, 2);

  var modifiedNewAgeBandCategory = start
    .concat(" to ")
    .concat(end)
    .split("  ")
    .join(" ")
    .replace("to er", "and over");

  var formattedAgeBand = modifiedNewAgeBandCategory;
  // console.log("formattedAgeBand", formattedAgeBand);

  var numberChildNodes = childNodes.length;
  // console.log("pre check:", numberChildNodes, childNodes);

  if (numberChildNodes == 0) {
    // console.log("0 do not consider:", numberChildNodes, childNodes);
  } else if (numberChildNodes == 1) {
    // console.log("1 consider:", numberChildNodes, childNodes);

    this_ageBand.classed(
      "aleph-semi-transparent",
      !this_ageBand.classed("aleph-semi-transparent")
    );

    if (this_ageBand.classed("aleph-semi-transparent")) {
      // console.log("1 if:", this_ageBand.classed("aleph-semi-transparent"));
      aleph.nonDisplayedAgeBands.push(/* formattedAgeBand */ firstChildNode);
    } else {
      // console.log("1 else:", this_ageBand.classed("aleph-semi-transparent"));
      var index = aleph.nonDisplayedAgeBands.indexOf(
        /* formattedAgeBand */ firstChildNode
      );
      aleph.nonDisplayedAgeBands.splice(index, 1);
    }
    // console.log(aleph.nonDisplayedAgeBands);

    var this_ageBandCircles_new = d3.selectAll(
      ".AB-" +
      CharacterToCharacter(firstChildNode.replace("<", "under"), " ", "-")
    );
    this_ageBandCircles_new.classed(
      "aleph-fullTransparent",
      !this_ageBandCircles_new.classed("aleph-fullTransparent")
    );
  } else if (numberChildNodes > 1) {
    // console.log(">1 consider:", numberChildNodes, childNodes);

    var start = firstChildNode.substring(0, 3);
    var len = lastChildNode.length;
    var end = lastChildNode.substr(len - 2, 2);

    aleph.modifiedNewAgeBandCategory = start
      .concat(" to ")
      .concat(end)
      .split("  ")
      .join(" ")
      .replace("to er", "and over");

    formattedAgeBand = aleph.modifiedNewAgeBandCategory;
    // console.log("formattedAgeBand:", formattedAgeBand);

    this_ageBand.classed(
      "aleph-semi-transparent",
      !this_ageBand.classed("aleph-semi-transparent")
    );

    if (this_ageBand.classed("aleph-semi-transparent")) {
      // console.log(">1 if:", this_ageBand.classed("aleph-semi-transparent"));
      aleph.nonDisplayedAgeBands.push(formattedAgeBand);
    } else {
      // console.log(">1 else:", this_ageBand.classed("aleph-semi-transparent"));
      var index = aleph.nonDisplayedAgeBands.indexOf(formattedAgeBand);
      aleph.nonDisplayedAgeBands.splice(index, 1);
    }
    // console.log(aleph.nonDisplayedAgeBands);

    var this_ageBandCircles_new = d3.selectAll(
      ".AB-" +
      CharacterToCharacter(formattedAgeBand.replace("<", "under"), " ", "-")
    );

    this_ageBandCircles_new.classed(
      "aleph-fullTransparent",
      !this_ageBandCircles_new.classed("aleph-fullTransparent")
    );
  } else {
    // console.log("else do not consider:", numberChildNodes, childNodes);
  }

  // console.log("formattedAgeBand:", formattedAgeBand);
  console.log(aleph.nonDisplayedAgeBands);

  return;
}

function recalculateAgeBands() {
  // reset colour array to update with new container colours.
  aleph.dotlegendColours = [];
  aleph.allowedDotAgeBands = [];
  aleph.CLONEDnestedDotObject = [];
  aleph.xAxisMax = { REGION: -Infinity, UK: -Infinity };

  // reset array to contain each individual oroginal age band to remove after combining
  aleph.ALL_ageBands_toDELETE = [];

  // clone MASTER data JSON object ready for processing ...
  aleph.CLONEDnestedDotObject = JSON.parse(
    JSON.stringify(aleph.MASTERnestedDotObject)
  );

  var containers = d3.selectAll(".containerDiv.containerDiv_dynamic")._groups[0];

  // for each main container to consider ...
  containers.forEach(function (d, i) {
    // locally store container information and ID
    var container = d;
    var containerID = container.id;
    var formattedAgeBand = "";

    // grab container fill colour
    var containerFillColor = d3
      .select("#" + containerID)
      .style("background-color");

    // store childen of currently considered container
    var childNodes = container.childNodes;

    // hide or show main container divs depending on if they have lael content
    if (!childNodes.length) {
      d3.select("#" + container.id).classed("aleph-hide", true);
    } else {
      d3.select("#" + container.id).classed("aleph-hide", false);

      aleph.ageBands_toConsider = [];

      childNodes.forEach(function (d, i) {
        var child = d;
        formattedAgeBand = CharacterToCharacter(
          d3.select(child).attr("class"),
          "-",
          " "
        ).replace("ageBand ", "");

        aleph.ageBands_toConsider.push(formattedAgeBand);
      }); // end childNodes forEach

      // construct new ageband JSON object element ...
      if (container.childNodes.length > 1) {
        var start = aleph.ageBands_toConsider[0].substring(0, 3);

        var len =
          aleph.ageBands_toConsider[aleph.ageBands_toConsider.length - 1]
            .length;

        var end = aleph.ageBands_toConsider[
          aleph.ageBands_toConsider.length - 1
        ].substr(len - 2, 2);

        aleph.modifiedNewAgeBandCategory = start
          .concat(" to ")
          .concat(end)
          .split("  ")
          .join(" ")
          .replace("to er", "and over");

        formattedAgeBand = aleph.modifiedNewAgeBandCategory;
      } else {
        aleph.modifiedNewAgeBandCategory = aleph.ageBands_toConsider[0];
      }

      // (1) if new ageband population needs to be calculated ...
      if (aleph.ageBands_toConsider.length > 1) {
        // for each region in data ...
        aleph.CLONEDnestedDotObject.forEach(function (d, i) {
          var regionData = d;
          var regionValues = regionData.values;

          // for each year in region ...
          for (var year in regionValues) {
            regionValues[year][aleph.modifiedNewAgeBandCategory] = 0;

            regionValues[year].min = Infinity;
            regionValues[year].max = -Infinity;
            var sumPop = 0;

            // for each key in region year values...
            for (var JSONkey in regionValues[year]) {
              if (aleph.ageBands_toConsider.indexOf(JSONkey) != -1) {
                // cumulatively add up the relevant individual agebands ...
                sumPop = sumPop + regionValues[year][JSONkey];
              } // end if ...
            } // end for loop ...

            regionValues[year][aleph.modifiedNewAgeBandCategory] = sumPop;
            regionValues[year]["data"][aleph.modifiedNewAgeBandCategory] = {
              count: sumPop,
              UK: (sumPop / aleph.dotYearTotals[year]) * 100,
              REGION: (sumPop / regionValues[year].regionTotal) * 100,
              regionName: regionValues[year].Region,
              ageBand: aleph.modifiedNewAgeBandCategory,
            };
          }
        }); // forEach

        aleph.ALL_ageBands_toDELETE = aleph.ALL_ageBands_toDELETE.concat(
          aleph.ageBands_toConsider
        );
      } // end if (1)

      aleph.dotlegendColours.push(containerFillColor);
      aleph.allowedDotAgeBands.push(formattedAgeBand);
      // }
    } // end else (1)
  }); // end containers forEach

  aleph.CLONEDnestedDotObject.forEach(function (d, i) {
    var regionValues = d.values;
    // for each year in region ...
    for (var year in regionValues) {
      // for each key in region year values...
      for (var JSONkey in regionValues[year]) {
        if (aleph.ALL_ageBands_toDELETE.indexOf(JSONkey) != -1) {
          delete regionValues[year][JSONkey];
          delete regionValues[year]["data"][JSONkey];
        } else {
          if (
            JSONkey != "regionTotal" &&
            JSONkey != "Region" &&
            JSONkey != "min" &&
            JSONkey != "max"
          ) {
            if (JSONkey != "data") {
              regionValues[year]["data"][JSONkey].index =
                aleph.allowedDotAgeBands.indexOf(JSONkey);

              regionValues[year]["data"][JSONkey].UK =
                (regionValues[year]["data"][JSONkey].count /
                  aleph.dotYearTotals[year]) *
                100;

              regionValues[year]["data"][JSONkey].REGION =
                (regionValues[year]["data"][JSONkey].count /
                  regionValues[year].regionTotal) *
                100;

              if (
                regionValues[year]["data"][JSONkey]["UK"] > aleph.xAxisMax["UK"]
              ) {
                aleph.xAxisMax["UK"] =
                  regionValues[year]["data"][JSONkey]["UK"];
              }
              if (
                regionValues[year]["data"][JSONkey]["REGION"] >
                aleph.xAxisMax["REGION"]
              ) {
                aleph.xAxisMax["REGION"] =
                  regionValues[year]["data"][JSONkey]["REGION"];
              }
            }

            // THIS MAY NEED TO BE UPDATED TO REFERENCE JSON elements in .data ....
            if (regionValues[year][JSONkey] < regionValues[year].min) {
              regionValues[year].min = regionValues[year][JSONkey];
            }
            if (regionValues[year][JSONkey] > regionValues[year].max) {
              regionValues[year].max = regionValues[year][JSONkey];
            }
          }
        }
      } // end for loop ...
    }
  }); // end forEach

  d3.selectAll(".bootstrap-select.sortOrder").remove();
  addDotSelectionLists("reload");

  // console.log(aleph.allowedDotAgeBands);

  // call function to [re]draw dot plot chart
  drawDotsChart();

  return;
} // end function recalculateAgeBands

function getMasterAndClonedData() {
  aleph.MASTERnestedDotObject = [];
  aleph.CLONEDnestedDotObject = [];
  aleph.nestedDotObject = [];

  aleph.data.nestedDot = d3
    .nest()
    .key(function (d) {
      return d.regionName;
    })
    .key(function (d) {
      return d.ageBand;
    })
    .entries(aleph.data.dot);

  aleph.years.forEach(function (d) {
    aleph.dotYearTotals[d] = 0;
  });

  aleph.data.nestedDot.forEach(function (d, i) {
    var key = d.key;
    var regionValues = d.values;
    var yearValueObj = {};

    aleph.years.forEach(function (d, i) {
      var year = d;

      yearValueObj[year] = {};
      yearValueObj[year].Region = key;
      yearValueObj[year].min = Infinity;
      yearValueObj[year].max = -Infinity;
      yearValueObj[year].regionTotal = 0;
      yearValueObj[year].data = {};

      regionValues.forEach(function (d, i) {
        var ageBand = d.key;
        var agebandValues = d.values[0];
        yearValueObj[year].data[ageBand] = { count: 0, UK: 0, REGION: 0 };

        yearValueObj[year][ageBand] = +agebandValues[year];

        aleph.dotYearTotals[year] =
          aleph.dotYearTotals[year] + +agebandValues[year];

        if (+agebandValues[year] < yearValueObj[year].min) {
          yearValueObj[year].min = +agebandValues[year];
        }
        if (+agebandValues[year] > yearValueObj[year].max) {
          yearValueObj[year].max = +agebandValues[year];
        }

        yearValueObj[year].regionTotal =
          yearValueObj[year].regionTotal + +agebandValues[year];

        yearValueObj[year].data[ageBand].count = yearValueObj[year][ageBand];
        yearValueObj[year].data[ageBand].UK = 0;
        yearValueObj[year].data[ageBand].REGION = 0;

        yearValueObj[year].data[ageBand].regionName = yearValueObj[year].Region;
        yearValueObj[year].data[ageBand].ageBand = ageBand;
        yearValueObj[year].data[ageBand].index = i;

        yearValueObj[year].data[ageBand].display = true;
      });
    });

    aleph.MASTERnestedDotObject.push({
      region: key,
      regionID: aleph.regionsArray.indexOf(key),
      values: yearValueObj,
    });
  });

  aleph.MASTERnestedDotObject.forEach(function (d, i) {
    var regionValues = d.values;

    for (var year in regionValues) {
      var data = regionValues[year].data;

      for (var item in data) {
        data[item].UK = (data[item].count / aleph.dotYearTotals[year]) * 100;
        data[item].REGION =
          (data[item].count / regionValues[year].regionTotal) * 100;

        // check to find and update x axis max percentage value domain if necessary...
        if (data[item]["UK"] > aleph.xAxisMax["UK"]) {
          aleph.xAxisMax["UK"] = data[item]["UK"];
        }

        if (data[item]["REGION"] > aleph.xAxisMax["REGION"]) {
          aleph.xAxisMax["REGION"] = data[item]["REGION"];
        }
      }
    }
  });

  aleph.CLONEDnestedDotObject = JSON.parse(
    JSON.stringify(aleph.MASTERnestedDotObject)
  );

  return;
} // end function getMasterAndClonedData
