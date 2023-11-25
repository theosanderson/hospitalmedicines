import { useState, useEffect, useRef } from 'react';
import MedicationGraph from '../components/MedicationGraph';
import OdsTable from '../components/OdsTable';
import { ClipLoader } from 'react-spinners';
import Head from 'next/head';
import Script from 'next/script'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // loading state for spinner

  const [odsCode, setOdsCode] = useState(null);
  const [odsName, setOdsName] = useState(null);
  const [mode, setMode] = useState('Ingredients');  // defaulting to 'Formulations'

  const searchDebounceTime = 500; // 500ms debounce
  const searchTimeoutRef = useRef();

  const getId = (medication) => {

    if (mode == "Formulations") {
      return medication.vmp_snomed_code;
    } else {
      return medication.isid;
    }
  }

  const getLabel = (medication) => {
    if (mode == "Formulations") {
      return medication.vmp_product_name;
    } else {
      return medication.nm;
    }
  }

  useEffect(() => {
    if (searchTerm) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true); // set loading to true before making the API call

        const response = await fetch('/api/searchMedication', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ searchTerm, mode }),  // pass mode to the API
        });
        const data = await response.json();

        setMedications(data);
        setIsLoading(false); // set loading to false after getting the response

      }, searchDebounceTime);
    } else {
      setMedications([]); // Clear the medications if the search term is empty
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, mode]);

  return (
    <div className="container mx-auto p-4">
      <Head>
      
        <title>Secondary Care Prescription Data for England</title>
        
        </Head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HNN14GE23V" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-HNN14GE23V');
        `}
      </Script>
      <h1 className="text-2xl font-bold mb-3">Secondary Care Prescription Data for England</h1>
      <div className='flex flex-row'>
      <input 
        type="text" 
        value={searchTerm}
        onChange={e => {setSearchTerm(e.target.value);
         
        }}
        className="border p-2 rounded w-72 h-9"
        placeholder="Search for medication..."
      />
      <div className="ml-4 inline-block">
  <label className="mr-3 text-sm text-gray-500">
    <input 
      type="radio" 
      value="Formulations" 
      checked={mode === 'Formulations'} 
      onChange={e => setMode(e.target.value)} 
      className='mr-1'
    />
    Formulations
  </label>
  <label className="mr-3 text-sm text-gray-500">
    <input 
      type="radio" 
      value="Ingredients" 
      checked={mode === 'Ingredients'} 
      onChange={e => setMode(e.target.value)} 
      className='mr-1'
    />
    Ingredients (experimental)
  </label>
  
</div>
</div>


      {/* Show spinner if loading */}
      {isLoading && <ClipLoader color="#000000" />}
      
    {/* List medications */}
<div className="mt-4 text-sm  h-36 border overflow-y-scroll">
  {medications.map(med => (
    <div 
      key={getId(med)} 
      className={`cursor-pointer p-2 rounded ${selectedMedication && getId(selectedMedication) == getId(med) && getId(med)  ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
      onClick={() => {setSelectedMedication(med)
      
      setOdsCode(null)
      setOdsName(null)
      }
    }
    >
      {getLabel(med)}
    </div>
  ))}
</div>


      {/* Graph */}
      <div className="mt-8">
      <MedicationGraph medication={selectedMedication} odsCode={odsCode} odsName={odsName} mode={mode} />
<OdsTable medication={selectedMedication} odsCode={odsCode} setOdsCode={setOdsCode} setOdsName={setOdsName} mode={mode} />
      </div>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Data source: <a href="https://opendata.nhsbsa.net/dataset/secondary-care-medicines-data-indicative-price/" className='text-blue-500 underline'>NHSBSA</a>, available under Open Government License. <b>This is an early version of this app and may contain inaccuracies. Do not rely on it.</b>
         
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Made by Theo Sanderson. For more information see the <a href="https://github.com/theosanderson/hospitalprescriptions/" className='text-blue-500 underline'>GitHub repository</a>.
        </p>
        <p 
          className="text-sm text-gray-500 text-xs mt-1">
             If this app seems potentially useful, please support <a href='https://openprescribing.net/hospitals/' className='text-blue-500 underline'>OpenPrescribing</a> (an unaffiliated project) to implement this properly.
          </p>
    </div>
    </div>
  );
}
