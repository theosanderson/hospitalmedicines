// components/MedicationGraph.js
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ClipLoader } from 'react-spinners';


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

  const medCode = !medication ? null : mode=='Formulations' ? medication.vmp_snomed_code : medication.isid;

  useEffect(() => {
    setLoading(true);
    const fetchUsageData = async () => {
      if (medication) {
        const response = await fetch(`/api/fetchUsage?medicationCode=${medCode}&mode=${mode}&type=${selectedMetric}${
          odsCode ? `&odsCode=${odsCode}` : ''
        }`);
        let data = await response.json();
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
  }, [medication, selectedMetric, odsCode]);

  const uniqueUnits = [...new Set(usageData.map(item => item.unit_name))];
  const numUnits = uniqueUnits.length;

  function formatYAxis(tick) {
    return selectedMetric === 'number' ? tick.toLocaleString() : `£${tick.toLocaleString()}`;
  }


function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    const year = Math.floor(data.year_month / 100);
    const month = data.year_month % 100;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formattedDate = `${monthNames[month - 1]} ${year}`;
    
    return (
      <div style={{ backgroundColor: 'white', border: '1px solid #ccc', padding: '10px' }}>
        <p>{formattedDate}</p>
        {payload.map(item => (
          <p key={item.name} style={{ color: item.color }}>
            {numUnits>1 && <>{item.name}: </>}
            {selectedMetric=='number' && <>{item.value.toLocaleString()} {numUnits > 1 ? 'units' : uniqueUnits[0] + (mode=="Formulations" ? 's': '')}</> }
            {selectedMetric=='cost' && <>&pound;{item.value.toLocaleString()}</> }
          </p>
        ))}
      </div>
    );
  }

  return null;
}


  if (!medication) return null;


  return (
    <div style={{ width: '600px' }} className='mx-auto'>
      <div className='float-right'>
      <button onClick={
        () => {
          setIsModalOpen(true);
        }

      } className="border text-sm border-gray-300 rounded-md px-2 py-1 m-2 hover:bg-gray-100">
        Show Data
      </button>
      </div>
      <h2 className="text-xl font-bold ">{mode == "Formulations" ? medication.vmp_product_name:
      medication.nm}{
      loading &&
      <></>
      
}</h2>
<h2 className="text-lg ">
  {odsName && <span className="text-gray-600">{odsName}</span>}
</h2>
      <div className="flex justify-end items-center">
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
      <> Amount ({(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]}) </>
    )
    
    }
  </label>
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

    <LineChart  width={600} height={300} data={usageData} margin={{ top: 5, right: 60, left: 60, bottom: 5 }}>
     <XAxis dataKey="year_month" tickFormatter={formatDate} 
label={{ fill: "black" }} />
  
  />
      <YAxis  label={{ fill: "black" }}
tickFormatter={formatYAxis}  label={{ value: selectedMetric === 'number' ? (
        mode == "Formulations" ? `Number of ${(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]+'s'}` : `Amount (${(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]+')'}`
      ) : 'Indicative cost', angle: -90, position: 'outsideLeft', dx:-70 }} 
      domain={[0,"auto"]}
      allowDataOverflow={true}
      />
      <CartesianGrid strokeDasharray="3 3" />
      
      {numUnits > 1 &&
        <Legend />
}
      {
  uniqueUnits.map((unit,i) => (
    <Line 
      isAnimationActive={false}
      key={unit}
      type="monotone"
      dataKey={d => 
        d.unit_name === unit ? 
          ( selectedMetric === 'number' ? d.total_usage : d.total_cost) 
          : null
      }
      stroke={colors[i]}
      activeDot={{ r: 8 }}
      name={unit} // this will be used in the legend
    />
  ))
}
<Tooltip content={<CustomTooltip />} />
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
    </div>
  );
}

export default MedicationGraph;
