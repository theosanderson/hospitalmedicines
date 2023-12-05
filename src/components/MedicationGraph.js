// components/MedicationGraph.js
import { useState, useEffect,useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipLoader } from 'react-spinners';
const groupByOdsCode = (data) => {
  return data.reduce((acc, item) => {
    (acc[item.ods_code] = acc[item.ods_code] || []).push(item);
    return acc;
  }, {});
};

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ').replaceAll('And', 'and').replaceAll('Of', 'of').replaceAll('Nhs', 'NHS').replaceAll("NHS Trust","").replaceAll("NHS Foundation Trust","")
};



const listMonthsBetween = (min, max) => {
  let months = [];
  let currentYear = parseInt(min / 100);
  let currentMonth = min % 100;
  let maxYear = parseInt(max / 100);
  let maxMonth = max % 100;

  while(currentYear < maxYear || (currentYear === maxYear && currentMonth <= maxMonth)) {
      months.push(currentYear * 100 + currentMonth);

      currentMonth++;
      if (currentMonth > 12) {
          currentMonth = 1;
          currentYear++;
      }
  }

  return months;
}




const colors = [
  '#8884d8', // Lavender
  '#82ca9d', // Mint
  '#ffc658', // Light Orange
  '#a4de6c', // Lime Green
  '#d0ed57', // Yellow
  '#83a6ed', // Sky Blue
  '#8dd1e1', // Cyan
  '#ff7300', // Orange
  '#d83b80', // Magenta
  '#c44ec8', // Purple
  '#fa8e57', // Coral
  '#4d8fac', // Cerulean
  '#b10058', // Ruby
  '#f781bf', // Pink
  '#bebada', // Periwinkle
  '#fdb462', // Tangerine
  '#b3de69', // Pear
  '#fccde5', // Baby Pink
  '#d9d9d9', // Grey
  '#bc80bd'  // Orchid
];


function formatDate(tick) {
  
  const year = Math.floor(tick / 100);
  const month = tick % 100;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${monthNames[month - 1]} ${year}`;
}

function MedicationGraph({ medication, odsCode, odsName, mode }) {
  const [breakdownByTrust, setBreakdownByTrust] = useState(false);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to toggle modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Function to format data for display in textarea
 // Function to format data for display in textarea as TSV
const getFormattedData = () => {
  if (usageData.length === 0) {
    return '';
  }

  // Extract keys for headers
  const headers = Object.keys(usageData[0]);
  const headerRow = headers.join('\t');

  // Map each data row to a TSV format

  // Map each data row to a TSV format
  const dataRows = usageData.map(item => {
    return headers.map(header => {
      // Check if the value is numeric and greater than 1
      const value = item[header];
      if (typeof value === 'number' && value > 1) {
        // Round to 3 decimal places
        return parseFloat(value.toFixed(3));
      }
      return value;
    }).join('\t');
  });

  // Combine header and rows
  return [headerRow, ...dataRows].join('\n');
};

  const [selectedMetric, setSelectedMetric] = useState('number');

  const [usageData, setUsageData] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [uniqueODSCodes, setUniqueODSCodes] = useState([]);

  const offset= Math.max(...usageData.map(item => formatYAxis((
    selectedMetric === 'number' ? item.total_usage : item.total_cost
  ))).map(label => label.length)) * 6;

  const medCode = !medication ? null : mode=='Formulations' ? medication.vmp_product_name : medication.isid;
  const [ODSlookup, setODSlookup] = useState({});

  useEffect(() => {
    setLoading(true);
    const fetchUsageData = async () => {
      
      if (medication) {
        const response = await fetch(`/api/fetchUsage?medicationCode=${medCode}&mode=${mode}&type=${selectedMetric}${
          odsCode ? `&odsCode=${odsCode}` : ''
        }${
          breakdownByTrust ? `&breakdownByODS=true` : ''
        }`);
        let data = await response.json();

        // If breakdownByTrust is true, the response will be an object with a `data` and `lookup` property
        if (breakdownByTrust) {
          // Extract the lookup table
          const lookup = data.lookup;

          // Extract the data
          data = data.data;
          // resutructure the data - code to key and title case name to value and truncate to 20 chars
          const lookupTable = {}
          lookup.forEach(item => {
            lookupTable[item.code] = titleCase(item.name);
          });


          setODSlookup(lookupTable);

          console.log("lookup",lookup);
        }
        setEmpty(data.length === 0);
        
        // uncapitalise the unit
        data = data.map(item => ({ ...item, unit_name: item.unit_name.toLowerCase() }));

        const minDateMonth = Math.min(...data.map(item => item.year_month));
        const maxDateMonth = Math.max(...data.map(item => item.year_month));
        
        const allMonths = listMonthsBetween(minDateMonth, maxDateMonth);

        // add any months that are missing, with 0 usage
        allMonths.forEach(month => {
          if (!data.find(item => item.year_month === month)) {
            console.log('adding', month);
            data.push({
              year_month: month,
              total_usage: 0,
              total_cost: 0,
              unit_name: data[0].unit_name
            });
            // sort by year_month
            data.sort((a, b) => a.year_month - b.year_month);
            
          }
        });

        setUsageData(data);


        
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [medication, selectedMetric, odsCode,breakdownByTrust]);


  


  const uniqueUnits = [...new Set(usageData.map(item => item.unit_name))];

  // if the selected unit is not in the list, set it to the first one with useEffect
  useEffect(() => {
    if (uniqueUnits.length > 0 && !uniqueUnits.includes(uniqueUnits[selectedUnitIndex])) {
      setSelectedUnitIndex(0);
    }
  }, [uniqueUnits]);

  const filteredUsageData = useMemo(() => {
    if(mode=="Formulations"){
      return usageData;
    }
    return usageData.filter(item => item.unit_name === uniqueUnits[selectedUnitIndex]);
  }, [usageData, selectedUnitIndex]);
  useEffect(() => {
    if(mode=="Ingredients"){
      setSelectedMetric("number");
    }
  }, [mode])

  const dataForGraph = useMemo(() => {
    if (!breakdownByTrust) {
      return filteredUsageData;
    }
  
    // First, group data by `year_month`
    const groupedByMonth = filteredUsageData.reduce((acc, item) => {
      if (!acc[item.year_month]) {
        acc[item.year_month] = {};
      }
      acc[item.year_month][`${item.ods_code}_total_usage`] = item.total_usage;
      acc[item.year_month][`${item.ods_code}_total_cost`] = item.total_cost;
      return acc;
    }, {});

    // we need to add zero values for any missing ODS codes
    const allODSCodes = Object.keys(groupedByMonth).reduce((acc, month) => {
      const monthData = groupedByMonth[month];
      Object.keys(monthData).forEach(key => {
        if (!acc.includes(key)) {
          acc.push(key);
        }
      });
      return acc;
    }, []);

    allODSCodes.forEach(odsCode => {
      Object.keys(groupedByMonth).forEach(month => {
        if (!groupedByMonth[month][odsCode]) {
          groupedByMonth[month][odsCode] = 0;
        }
      });
    });


  
    // Then, transform this object into an array format suitable for the graph
    return Object.keys(groupedByMonth).map(month => ({
      year_month: month,
      ...groupedByMonth[month]
    }));
  }, [filteredUsageData, breakdownByTrust]);

  const uniqueODS = useMemo(() => {
    return [...new Set(usageData.map(item => item.ods_code))];
  }, [usageData]);


  const numUnits = uniqueUnits.length;

  function formatYAxis(tick) {
    return selectedMetric === 'number' ? tick ? tick.toLocaleString() : "" : `£${
      tick ? tick.toLocaleString() : ''}`;
  }
  function CustomTooltip({ active, payload, label }) {
   
    if (active && payload && payload.length) {
      // Sort the payload in descending order based on the value
      let sortedPayload = payload.sort((a, b) => b.value - a.value);
      // top 10
      sortedPayload = sortedPayload.slice(0, 6);


  
      const formattedDate = formatDate(label);
  
      // Function to truncate string with ellipsis
      const truncateString = (str, num) => {
        if (str.length > num) {
          return str.slice(0, num) + '...';
        }
        return str;
      };
  
      return (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid #ccc', padding: '10px', fontSize: '12px',
      
        width: '200px', display: 'flex', flexDirection: 'column'

        }}>
          <p className='font-semibold'>{formattedDate}</p>
          <table style={{ width: '100%' }}>
            <tbody>
              {sortedPayload.map((item, index) => {
                let dataLabel = truncateString(item.name, 20);
                let dataValue = item.value.toLocaleString();
                let unit = selectedMetric === 'number' ? uniqueUnits[selectedUnitIndex] : '';
                
                return (
                  <tr key={index}>
                    <td style={{ color: item.color, paddingRight: '10px' }}>{breakdownByTrust ? ODSlookup[dataLabel] : dataLabel}</td>
                    <td className='font-semibold'>{dataValue}{unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  
    return null;
  }
  

  if (!medication) return null;
  // if mode is ingredient, type must be number. useeffect to ensire



  return (
    <div style={{ width: '600px' }} className='mx-auto'>
      <div className='float-right'>
      <button onClick={
        () => {
          setIsModalOpen(true);
        }

      } className="border text-sm border-gray-300 rounded-md px-2 py-1 m-2 hover:bg-gray-100">
        Show data
      </button>
      </div>
      <div>
      <h2 className="text-xl font-bold ">{mode == "Formulations" ? medication.vmp_product_name:
      medication.nm}{
      loading &&
      <></>
      
}</h2>
<h2 className="text-lg mb-1">
  {odsName && <span className="text-gray-600">{odsName}</span>}
</h2>
</div>
      <div className="flex justify-end items-center">
        {mode=="Ingredients" && uniqueUnits.length > 1 && 
          uniqueUnits.map((unit, i) => (
            <>
            <input 
              type="radio" 
              value="number" 
              className="mr-2"
              checked={selectedMetric === 'number' && selectedUnitIndex === i}
              onChange={() => {setSelectedMetric('number')
              setSelectedUnitIndex(i)
              }
              }
            />
            <label className="mr-4">{unit}</label>
            </>
          ))
        }


        {
          mode=="Formulations" &&
  <label className="flex items-center text-sm text-gray-500 mr-4">

   
    <input 
      type="radio" 
      value="number" 
      className="mr-2"
      checked={selectedMetric === 'number'} 
      onChange={() => setSelectedMetric('number')} 
    />
    { mode == "Formulations" ? (<>
      Number of {(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]+'s'}</>
    ) : (
      <> Amount ({(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]})
      
        </>
    )
    
    }
  </label>
}


  {mode == "Formulations" &&
  <label className="flex items-center text-sm text-gray-500 mr-6">
    <input 
      type="radio" 
      value="cost" 
      className="mr-2"
      checked={selectedMetric === 'cost'} 
      onChange={() => setSelectedMetric('cost')} 
    />
    Indicative cost
  </label>
}
</div>

{
loading ? (
  <div className="flex justify-center items-center mt-8">
    <ClipLoader color="#1D4ED8" />
  </div>
) :

empty ? (
  <div className="text-center text-gray-500 mt-8">
    No data found {mode != "Formulations" && <><br />You might want to try selecting a different form of the compound.</>}
  </div>
) : (

    <LineChart  width={600} height={300} data={dataForGraph} margin={{ top: 5, right: 60, left: 
    offset > 60 ? 140:60, bottom: 5 }}>
     <XAxis dataKey="year_month" tickFormatter={formatDate}  label={{ fill: "#000000" }}
 />
  
      <YAxis  
tickFormatter={formatYAxis}  label={{ fill: "#000000" ,value: selectedMetric === 'number' ? (
        mode == "Formulations" ? `Number of ${(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]+'s'}` : `Amount (${(numUnits > 1 || !uniqueUnits[0]) ? 'units)' : uniqueUnits[0]+')'}`
      ) : 'Indicative cost', angle: -90, position: 'outsideLeft', dx:(-10-
        // get the longest tick label and multiply by 8 to get the offset
        offset
      )
      }}
      domain={[0,"auto"]}
      allowDataOverflow={true}
      />
      <CartesianGrid strokeDasharray="3 3" />
      
     
     
  {breakdownByTrust ? (
    uniqueODS.map((odsCode, idx) => (
      <Line
        isAnimationActive={false}
        key={odsCode}
        type="monotone"
        dataKey={selectedMetric === 'number' ? `${odsCode}_total_usage` : `${odsCode}_total_cost`}
        stroke={colors[idx % colors.length]}
        activeDot={{ r: 8 }}
        name={odsCode}
      />
    ))
  ) : (
    <Line 
      isAnimationActive={false}
      type="monotone"
      dataKey={selectedMetric === 'number' ? 'total_usage' : 'total_cost'}
      stroke={colors[0]}
      activeDot={{ r: 8 }}
    />
  )}
  <Tooltip  content={<CustomTooltip />} />

    </LineChart>

)}


      {/* Button to show modal */}
     

      {/* Modal using Daisy UI */}
      {isModalOpen && (
       <>
      <dialog open className="modal">
        <div className="modal-box">
        <form method="dialog">
      {/* if there is a button in form, it will close the modal */}

      <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        onClick={toggleModal}
      >✕</button>
    </form>
          <div className="modal-header">
            <div className="text-lg font-bold">Usage Data</div>
          </div>
          <div className="modal-body">
            <textarea
              className="w-full border p-2"
              rows="10"
              value={getFormattedData()}
              readOnly
              
            />
          </div>
        </div>
      </dialog>
       </>
      )}
         { !odsCode &&
      <div
      className='text-right text-gray-500 my-3'
      >
      
      

       <input 
       type="checkbox"
        className="mr-2"
        checked={breakdownByTrust}
        onChange={() => setBreakdownByTrust(!breakdownByTrust)}
      />
   
       
      <label className="mr-4 ">Break down graph by trust</label>


      </div>
      }
    </div>
  );
}

export default MedicationGraph;
