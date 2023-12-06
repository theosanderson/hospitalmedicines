import React from 'react';
import * as Plot from '@observablehq/plot';

const MyPlotComponent = ({ data, config, plotConfig }) => {
  // Create a ref to attach the plot
  const plotRef = React.useRef(null);

  React.useEffect(() => {
    // Check if data is available
    if (data && data.length > 0) {
      // Create the plot with the given config
      const plot = Plot.plot({
        marginLeft: 50,
        
     
       marks: [
         Plot.lineY(data, config),
            Plot.ruleY([0]),
           


         ],
        data: data, // Add data to the config,
        ...plotConfig
      });

      // Clear previous plot if any
      plotRef.current.innerHTML = '';
      // Append the new plot to our ref element
      plotRef.current.appendChild(plot);
    }
  }, [data, config]); // Redraw the plot when data or config changes

  return <div ref={plotRef}></div>;
};

export default MyPlotComponent;
