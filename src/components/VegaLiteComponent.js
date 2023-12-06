import React, { useEffect, useRef } from 'react';
import embed from 'vega-embed';

const VegaLiteComponent = ({ spec, onViewData,toolTipRenderer }) => {
    var tooltipOptions = {
        formatTooltip: (value, sanitize) => {
            
            return toolTipRenderer(value);
        }
      };
 
  const ref = useRef();

  useEffect(() => {
    embed(ref.current, spec, { actions: 
      {export: true, 
        source: false, 
        compiled: false, 
        editor: false, 
        
      },
      tooltip: tooltipOptions })
      .then((result) => {

         // Create a custom menu item for exporting to CSV
         const exportToCSVAction = document.createElement('a');
            exportToCSVAction.className = 'vega-action vega-tooltip';
      
            exportToCSVAction.innerHTML = 'View data';


         exportToCSVAction.addEventListener('mousedown', async function (event) {
             event.preventDefault();
             onViewData();
         });

         // Append menu item to chart actions (hamburger menu)
         const vegaActions = document.querySelector('.vega-actions');
         if (vegaActions) {
             vegaActions.appendChild(exportToCSVAction);
         } else {
             console.log('Warning: CSV export functionality is not available, because no div with class=vega-actions was found to append export action to');
         }
        }
        );




  }, [spec]);

  return <div ref={ref} 
  className='w-full '
  
  />;
};

export default VegaLiteComponent;