import React, { useState, useEffect, useRef } from 'react';
import MedicationGraph from '../components/MedicationGraph';
import OdsTable from '../components/OdsTable';
import { ClipLoader } from 'react-spinners';
import Head from 'next/head';
import Script from 'next/script'
import { useRouter } from 'next/router'; // Import useRouter

// memoize MedicationGraph
const MemoizedMedicationGraph = React.memo(MedicationGraph);

export default function Home() {
  const router = useRouter(); // Initialize useRouter
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // loading state for spinner
  const [breakdownBy, setBreakdownBy] = useState("none");

  const [plotType, setPlotType] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState('number');

  const [odsCode, setOdsCode] = useState(null);
  const [odsName, setOdsName] = useState(null);
  const [mode, setMode] = useState('Ingredients');  // defaulting to 'Formulations'

  const searchDebounceTime = 500; // 500ms debounce
  const searchTimeoutRef = useRef();

  const getId = (medication) => {

    if (mode == "Formulations") {
      return medication.nm;
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
    // Read values from URL on initial render
    if (router.query.searchTerm) {
      setSearchTerm(router.query.searchTerm);
    }
    if (router.query.selectedMedication) {
      setSelectedMedication(JSON.parse(router.query.selectedMedication));
    }
    if (router.query.mode) {
      setMode(router.query.mode);
    }

    if( router.query.breakdownBy){
      setBreakdownBy(router.query.breakdownBy);
    }

    if (router.query.plotType) {
      setPlotType(router.query.plotType);
    }

    if (router.query.odsCode) {
      setOdsCode(router.query.odsCode);
    }

    if (router.query.odsName) {
      setOdsName(router.query.odsName);
    }

    if (router.query.selectedMetric) {
      setSelectedMetric(router.query.selectedMetric);
    }

 



  }, [router.isReady]); // Only run once router is ready

  // Update URL when searchTerm, selectedMedication, or mode changes
  useEffect(() => {
    if(!searchTerm){
      return;
    }
    const query = {};

    if (searchTerm) {
      query.searchTerm = searchTerm;
    }

    if (selectedMedication) {
      query.selectedMedication = JSON.stringify(selectedMedication);
    }

    if (mode) {
      query.mode = mode;
    }

    if (breakdownBy) {
      query.breakdownBy = breakdownBy;
    }

    if (plotType) {
      query.plotType = plotType;
    }

    if (odsCode) {
      query.odsCode = odsCode;
    }

    if (odsName) {
      query.odsName = odsName;
    }

    if(selectedMetric){
      query.selectedMetric = selectedMetric
    }




    router.push({
      pathname: '/',
      query: query,
    }, undefined, { shallow: true });
  }, [searchTerm, selectedMedication, mode, breakdownBy, plotType, odsCode, odsName]);

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
      
        <title>Hospital Medicines Usage Data Explorer</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"></meta>
        </Head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-9VDTP1JGGF" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-9VDTP1JGGF');
        `}
      </Script>
      <h1 className="text-2xl font-bold mb-3">Hospital Medicines Usage Data Explorer</h1>
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
      <label className="mr-3 text-sm text-gray-600">
    <input 
      type="radio" 
      value="Ingredients" 
      checked={mode === 'Ingredients'} 
      onChange={e => 
        {
        setMode(e.target.value)
       setSelectedMedication(null)
        }
      
      } 
      className='mr-1'
    />
    Ingredient
  </label>
  <div className="inline-block">
  <label className="mr-3 text-sm text-gray-600">
    <input 
      type="radio" 
      value="Formulations" 
      checked={mode === 'Formulations'} 
      onChange={e => 
        {
          setMode(e.target.value)
         setSelectedMedication(null)
          }
        }
      className='mr-1'
    />
    Formulation
  </label>
  </div>
  
  
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
      <MemoizedMedicationGraph medication={selectedMedication}  odsCode={odsCode} odsName={odsName} mode={mode} 
      breakdownBy={breakdownBy} setBreakdownBy={setBreakdownBy} plotType={plotType} setPlotType={setPlotType} />
<OdsTable medication={selectedMedication} odsCode={odsCode} setOdsCode={setOdsCode} setOdsName={setOdsName} mode={mode} odsName={odsName} />
      </div>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Data source: <a href="https://opendata.nhsbsa.net/dataset/secondary-care-medicines-data-indicative-price/" className='text-blue-500 underline'>NHSBSA SCMD dataset</a>, covering hospital medicines usage in England, available under Open Government License. We do not guarantee the correctness of data: errors are possible both in the underlying data and in our processing.
         
        </p>
        <p className="text-sm text-gray-500 mt-1">
          For more information see the <a href="https://github.com/theosanderson/hospitalmedicines/" className='text-blue-500 underline'>GitHub repository</a> or the <a href="https://www.medrxiv.org/content/10.1101/2023.12.14.23299817v1"  className='text-blue-500 underline'>preprint</a>.
        </p>
        <p 
          className="text-sm text-gray-500 text-xs mt-1">
            See also: <a href="https://openprescribing.net/" className='text-blue-500 underline'>OpenPrescribing</a> for primary care data, and support their <a href='https://openprescribing.net/hospitals/' className='text-blue-500 underline'>hospitals</a> project.
          </p>
    </div>
    </div>
  );
}
