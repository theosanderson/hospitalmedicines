import { useState, useEffect, useRef } from 'react';
import MedicationGraph from '../components/MedicationGraph';
import { ClipLoader } from 'react-spinners';
import Head from 'next/head';
import Script from 'next/script'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // loading state for spinner

  const searchDebounceTime = 500; // 500ms debounce
  const searchTimeoutRef = useRef();

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
          body: JSON.stringify({ searchTerm }),
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
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <Head>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-TDTSH11X4S" />
      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-TDTSH11X4S');
        `}
      </Script>
        <title>Secondary Care Prescription Data for England</title>
        
        </Head>
      <h1 className="text-2xl font-bold mb-3">Secondary Care Prescription Data for England</h1>
      <input 
        type="text" 
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="border p-2 rounded w-72"
        placeholder="Search for medication..."
      />

      {/* Show spinner if loading */}
      {isLoading && <ClipLoader color="#000000" />}
      
    {/* List medications */}
<div className="mt-4 text-sm overflow-scroll h-36 border">
  {medications.map(med => (
    <div 
      key={med.vmp_snomed_code} 
      className={`cursor-pointer p-2 rounded ${selectedMedication && selectedMedication.vmp_snomed_code === med.vmp_snomed_code ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}
      onClick={() => setSelectedMedication(med)}
    >
      {med.vmp_product_name}
    </div>
  ))}
</div>


      {/* Graph */}
      <div className="mt-8">
        <MedicationGraph medication={selectedMedication} />
      </div>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Data source: <a href="https://opendata.nhsbsa.net/dataset/secondary-care-medicines-data-indicative-price/" className='text-blue-500 underline'>NHSBSA</a>, available under Open Government License. This is an early version of this app and may contain inaccuracies. Do not rely on it.
        </p>
        <p className="text-sm text-gray-500">
          For more information see the <a href="https://github.com/theosanderson/hospitalprescriptions/" className='text-blue-500 underline'>GitHub repository</a>.
        </p>
    </div>
    </div>
  );
}
