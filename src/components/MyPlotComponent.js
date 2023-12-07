import React from 'react';
import * as Plot from '@observablehq/plot';
import * as d3 from "d3";
import { useMeasure } from "react-use";


const MyPlotComponent = ({ data, config, plotConfig, plotType }) => {
  //const [plotRef2, { width, height }] = useMeasure();
  const plotRef = React.useRef(null);


  

  React.useEffect(() => {
    // Check if data is available
    if (data && data.length > 0 ) {
      // Create the plot with the given config
      const plot = Plot.plot({
        
      //  width: width,
       // height: 200,
        
     
       marks: [
         plotType == 'bar' ? Plot.barY(data, config) : Plot.lineY(data, config),
            Plot.ruleY([0]),
           


         ],
        data: data, // Add data to the config,
        ...plotConfig
      });
      d3.select(plot)
  .selectAll("path")
  // React when the pointer hovers over the path.
  .on("pointerenter", function() {
    
    d3.select(plot).selectAll("path").attr("opacity", 0.2);
    // find element with aria label tip if it exists
    const tip = document.querySelector('[aria-label="tip"]');
    // find paths under the tip
    const paths = tip.querySelectorAll("path");
    // set opacity of paths to 1
    paths.forEach(path => {
      path.setAttribute("opacity", 1);
    });

    d3.select(this).attr("opacity", 1);
  });
// Reset the appearance when the pointer leaves the SVG
d3.select(plot).on("pointerleave", function() {
  d3.select(plot).selectAll("path").attr("opacity", 1);
});

      // Clear previous plot if any
      plotRef.current.innerHTML = '';
      // Append the new plot to our ref element
      plotRef.current.appendChild(plot);
    }
  }, [data, config]); // Redraw the plot when data or config changes

  return <div ref={plotRef} id="thePlot"></div>;
};

export default MyPlotComponent;
