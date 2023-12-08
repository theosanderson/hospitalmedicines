// components/MedicationGraph.js
import { useState, useEffect,useMemo } from 'react';

import { ClipLoader } from 'react-spinners';
import MyPlotComponent from './MyPlotComponent'; // Adjust the import path as needed

const routes =  {
  
    "697971008": "Arteriovenous fistula route",
    "432671000124106": "Arteriovenous graft route",
    "420254004": "Body cavity route",
    "54471007": "Buccal route",
    "417070009": "Caudal route",
    "418162004": "Colostomy route",
    "446105004": "Conjunctival route",
    "448598008": "Cutaneous route",
    "372449004": "Dental route",
    "447964005": "Digestive tract route",
    "372450004": "Endocervical route",
    "372451000": "Endosinusial route",
    "372452007": "Endotracheopulmonary route",
    "417985001": "Enteral route",
    "404820008": "Epidural route",
    "420163009": "Esophagostomy route",
    "372453002": "Extra-amniotic route",
    "714743009": "Extracorporeal route",
    "418743005": "Fistula route",
    "372454008": "Gastroenteral route",
    "418136008": "Gastro-intestinal stoma route",
    "127490009": "Gastrostomy route",
    "372457001": "Gingival route",
    "419954003": "Ileostomy route",
    "429817007": "Interstitial route",
    "419396008": "Intraabdominal route",
    "372458006": "Intraamniotic route",
    "58100008": "Intra-arterial route",
    "12130007": "Intra-articular route",
    "404819002": "Intrabiliary route",
    "419778001": "Intrabronchial route",
    "372459003": "Intrabursal route",
    "418821007": "Intracameral route",
    "372460008": "Intracardiac route",
    "418331006": "Intracartilaginous route",
    "372461007": "Intracavernous route",
    "446540005": "Intracerebral route",
    "420719007": "Intracerebroventricular route",
    "418892005": "Intracisternal route",
    "448492006": "Intracolonic route",
    "418608002": "Intracorneal route",
    "418287000": "Intracoronal route",
    "372463005": "Intracoronary route",
    "445769006": "Intracorpus cavernosum route",
    "418987007": "Intracranial route",
    "372464004": "Intradermal route",
    "372465003": "Intradiscal route",
    "417989007": "Intraductal route",
    "418887008": "Intraduodenal route",
    "445756007": "Intradural route",
    "446407004": "Intraepicardial route",
    "448077001": "Intraepidermal route",
    "445752009": "Intraesophageal route",
    "445768003": "Intragastric route",
    "445754005": "Intragingival route",
    "445941009": "Intrahepatic route",
    "447026006": "Intraileal route",
    "448491004": "Intrajejunal route",
    "372466002": "Intralesional route",
    "445913005": "Intralingual route",
    "37737002": "Intraluminal route",
    "372467006": "Intralymphatic route",
    "447121004": "Intramammary route",
    "60213007": "Intramedullary route",
    "445767008": "Intrameningeal route",
    "711378007": "Intramural route",
    "78421000": "Intramuscular route",
    "418133000": "Intramyometrial route",
    "711360002": "Intraneural route",
    "372468001": "Intraocular route",
    "417255000": "Intraosseous route",
    "419631009": "Intraovarian route",
    "445771006": "Intrapericardial route",
    "38239002": "Intraperitoneal route",
    "372469009": "Intrapleural route",
    "419810008": "Intraprostatic route",
    "420201002": "Intrapulmonary route",
    "419231003": "Intrasinal route",
    "418418000": "Intraspinal route",
    "372470005": "Intrasternal route",
    "418877009": "Intrasynovial route",
    "418586008": "Intratendinous route",
    "418947002": "Intratesticular route",
    "72607000": "Intrathecal route",
    "417950001": "Intrathoracic route",
    "404818005": "Intratracheal route",
    "447122006": "Intratumor route",
    "418091004": "Intratympanic route",
    "62226000": "Intrauterine route",
    "445755006": "Intravascular route",
    "418114005": "Intravenous central route",
    "419993007": "Intravenous peripheral route",
    "47625008": "Intravenous route",
    "420287000": "Intraventricular route - cardiac",
    "372471009": "Intravesical route",
    "418401004": "Intravitreal route",
    "127491008": "Jejunostomy route",
    "420185003": "Laryngeal route",
    "447081004": "Lower respiratory tract route",
    "420204005": "Mucous fistula route",
    "46713006": "Nasal route",
    "420218003": "Nasoduodenal route",
    "127492001": "Nasogastric route",
    "418730005": "Nasojejunal route",
    "54485002": "Ophthalmic route",
    "26643006": "Oral route",
    "418441008": "Orogastric route",
    "372473007": "Oromucosal route",
    "418664002": "Oropharyngeal route",
    "10547007": "Otic route",
    "418851001": "Paracervical route",
    "419165009": "Paravertebral route",
    "428191002": "Percutaneous route",
    "372474001": "Periarticular route",
    "418722009": "Peribulbar route",
    "447080003": "Peridural route",
    "372475000": "Perineural route",
    "447052000": "Periodontal route",
    "420047004": "Periosteal route",
    "419762003": "Peritendinous route",
    "418204005": "Periurethral route",
    "37161004": "Rectal route",
    "447694001": "Respiratory tract route",
    "418321004": "Retrobulbar route",
    "372476004": "Subconjunctival route",
    "34206005": "Subcutaneous route",
    "419601003": "Subgingival route",
    "1611000175109": "Sublesional route",
    "37839007": "Sublingual route",
    "419874009": "Submucosal route",
    "416174007": "Suborbital route",
    "419320008": "Subtendinous route",
    "419894000": "Surgical cavity route",
    "418813001": "Surgical drain route",
    "6064005": "Topical route",
    "419243002": "Transcervical route",
    "45890007": "Transdermal route",
    "446435000": "Transendocardial route",
    "404815008": "Transmucosal route",
    "446442000": "Transplacental route",
    "447229005": "Transtracheal route",
    "447227007": "Transtympanic route",
    "418511008": "Transurethral route",
    "419021003": "Tumor cavity route",
    "419684008": "Ureteral route",
    "90028008": "Urethral route",
    "420168000": "Urostomy route",
    "16857009": "Vaginal route",

    "9907001000001103" : "Line lock",

   
  }

const titleCase = (str) => {
  if (!str) return '';
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




function MedicationGraph({ medication, odsCode, odsName, mode }) {
  console.log(mode, "mode")
  console.log(medication, "medication")
  const [breakdownByTrust, setBreakdownByTrust] = useState(false);
  const [breakdownByRoute, setBreakdownByRoute] = useState(false);
  const [plotType, setPlotType] = useState('bar');
  const strokeOrFill = plotType === 'bar' ? 'fill' : 'stroke';
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to toggle modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // breakdownbyroute can only be true if mode is ingredient
  useEffect(() => {
    if(mode=="Formulations"){
      setBreakdownByRoute(false);
    }
  }, [mode])
  const [usageData, setUsageData] = useState([]);
  const [ODSlookup, setODSlookup] = useState({});


  // Function to format data for display in textarea
 // Function to format data for display in textarea as TSV
const formattedData = useMemo(() => {
  const newData = usageData.map(item => ({ ...item, Route: routes[item.routecd] || item.routecd })).map(item => ({ ...item, Trust: ODSlookup[item.ods_code] || item.ods_code }))
  if (newData.length === 0) {
    return '';
  }

  // Extract keys for headers
  const headers = Object.keys(newData[0]);
  const headerRow = headers.join('\t');

  // Map each data row to a TSV format

  // Map each data row to a TSV format
  const dataRows = newData.map(item => {
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
}, [usageData, ODSlookup]);

  const [selectedMetric, setSelectedMetric] = useState('number');
  console.log(selectedMetric, "selectedMetric")


  
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  const offset= Math.max(...usageData.map(item => formatYAxis((
    selectedMetric === 'number' ? item.total_usage : item.total_cost
  ))).map(label => label.length)) * 6;

  const medCode = !medication ? null : mode=='Formulations' ? medication.vmp_product_name : medication.isid;

  useEffect(() => {
    setLoading(true);
    const fetchUsageData = async () => {
      
      if (medication) {
        const response = await fetch(`/api/fetchUsage?medicationCode=${medCode}&mode=${mode}&type=${selectedMetric}${
          odsCode ? `&odsCode=${odsCode}` : ''
        }${
          breakdownByTrust ? `&breakdownByODS=true` : ''
        }${
          breakdownByRoute ? `&breakdownByRoute=true` : ''
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

        
        }
        setEmpty(data.length === 0);
        
        // uncapitalise the unit
        data = data.map(item => ({ ...item, unit_name: item.unit_name.toLowerCase() }));

        const minDateMonth = Math.min(...data.map(item => item.year_month));
        const maxDateMonth = Math.max(...data.map(item => item.year_month));

        
        
        const allMonths = listMonthsBetween(minDateMonth, maxDateMonth);
        const allODSCodes = [...new Set(data.map(item => item.ods_code))];

        // add any months that are missing, with 0 usage
        allODSCodes.forEach(odsCode => {
        allMonths.forEach(month => {
          if (!data.find(item => item.year_month === month && item.ods_code === odsCode)) {
         
            data.push({
              year_month: month,
              total_usage: 0,
              total_cost: 0,
              unit_name: data[0].unit_name,
              ods_code: odsCode
            });
            // sort by year_month
            data.sort((a, b) => a.year_month - b.year_month);
            
          }
        });
      });

        setUsageData(data);


        
        setLoading(false);
      }
    };

    fetchUsageData();
  }, [medication, selectedMetric, odsCode,breakdownByTrust, breakdownByRoute]);


  


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



  const numUnits = uniqueUnits.length;

  function formatYAxis(tick) {
    return selectedMetric === 'number' ? tick ? tick.toLocaleString() : "" : `£${
      tick ? tick.toLocaleString() : ''}`;
  }
  

  if (!medication) return null;
  // if mode is ingredient, type must be number. useeffect to ensire



  return (
    <div style={{ maxWidth: '640px' }}
     className='mx-auto'>
   
   

      <div className='float-right'>
      <div className="dropdown dropdown-bottom">
  <div tabIndex={0} role="button" className="border text-sm border-gray-300 rounded-md px-2 py-1 m-2 hover:bg-gray-100">Export</div>
  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-52">
    <li
    onClick={
      () => {
        setIsModalOpen(true);
      }
    }
    
    ><a> Show data</a></li>
    <li
    onClick={() => {
      // Get the SVG element from within div with id "thePlot"
      const svg = document.querySelector('#thePlot svg');
      if (!svg) {
        console.error('SVG element not found');
        return;
      }
    
      // Serialize the SVG to a string
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
    
      // Construct the filename, ensuring to handle undefined medication properties
      const medicationId = medication?.isid ?? 'unknown';
      const medicationName = medication?.nm ?? 'unknown';
      const filename = `${medicationId}_${medicationName}_${mode}.svg`;
    
      // Create a blob from the SVG source
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
    
      // Create a temporary link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link); // Append to body to ensure visibility
      link.click();
    
      // Clean up: revoke the URL and remove the link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }}



    
    ><a>Download SVG</a></li>
  </ul>
</div>
     
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

  <MyPlotComponent 
  plotType={plotType}
  
  data={
    // convert "202202" to a real date( mid-month)
    
    filteredUsageData.map(item => ({ ...item, year_month: new Date(Math.floor(item.year_month / 100), item.year_month % 100 - 1, 15) })).// map ods code to name
    //filter out negative
    filter(item => (selectedMetric=="cost" ? item.total_cost : item.total_usage) >= 0).//map route cd
    map(item => ({ ...item, Route: routes[item.routecd] || item.routecd })).map(item => ({ ...item, Trust: ODSlookup[item.ods_code] || item.ods_code }))
  
  } config={{ curve: plotType=="smoothline" ?  'catmull-rom' : 'linear',
    
    x: 'year_month', y: selectedMetric === 'number' ? 'total_usage' : 'total_cost', 
  [strokeOrFill]: breakdownByTrust? 'Trust' : (
    breakdownByRoute ? 'Route' : undefined
  )//, marker:true
  
  , tip:{
    
    format: {
      [strokeOrFill]: true,
      x: (x) => x.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      y: (y) => selectedMetric === 'number' ? y.toLocaleString()+ 
      (mode=="Ingredients" ? ""+uniqueUnits[selectedUnitIndex] : " " + uniqueUnits[0] + "s")
      
      : `£${y.toLocaleString()}`,
      
     
    }
  }
  ,
  ...((breakdownByTrust | breakdownByRoute)? {}: {[strokeOrFill]: "#6093eb"}),
  
  }} 
  plotConfig={{
    marginLeft: offset>50 ? 100 : 50,
  
 
    x:{
      label: "Date",
      interval: "month",
    },
    y:{
      label: selectedMetric === 'number' ? (
        mode == "Formulations" ? `Number of ${(numUnits > 1 || !uniqueUnits[0]) ? 'units' : uniqueUnits[0]+'s'}` : `Amount (${(numUnits > 1 || !uniqueUnits[0]) ? 'units)' : uniqueUnits[0]+')'}`
      ) : 'Indicative cost',
      grid:true,
      tickFormat: formatYAxis,
        
    }
  }}
  
  
  />

)}


      {/* Button to show modal */}
     

      {/* Modal using Daisy UI */}
      {isModalOpen && (
       <>
      <dialog open className="modal">
        <div className="modal-box bg-white">

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
              value={formattedData}
              readOnly
              
            />
          </div>
        </div>
      </dialog>
       </>
      )}
        
      <div
      className='flex justify-between text-gray-800 my-3 text-sm mb-7'>
      
 
<div><label className="mr-1 ">Graph type:</label>
      <select
        className="border rounded p-1"
        value={plotType}
        onChange={e => setPlotType(e.target.value)}
      >
        <option value="smoothline">Smooth line</option>
        <option value="straightline">Straight line</option>
        <option value="bar">Bar</option>
      </select>

        </div>


<div> Color by:
  { !odsCode &&
    <>
      <select 
        className="mr-2 ml-2 border rounded p-1"
        value={breakdownByTrust ? "Trust" : (mode === "Ingredients" && breakdownByRoute) ? "Route of administration" : "None"}
        onChange={(e) => {
          if (e.target.value === "Trust") {
            setBreakdownByTrust(true);
            setBreakdownByRoute(false);
          } else if (e.target.value === "Route of administration") {
            setBreakdownByTrust(false);
            setBreakdownByRoute(true);
          } else {
            setBreakdownByTrust(false);
            setBreakdownByRoute(false);
          }
        }}
      >
        <option value="None">None</option>
        <option value="Trust">Trust</option>
        {mode === "Ingredients" && <option value="Route of administration">Route of administration</option>}
      </select>
    </>
  }
</div>

      </div>
      


      
    </div>
  );
}

export default MedicationGraph;
