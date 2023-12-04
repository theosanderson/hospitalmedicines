import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';

const titleCase = (str) => {
  return str.toLowerCase().split(' ').map(function(word) {
    return word.replace(word[0], word[0].toUpperCase());
  }).join(' ').replaceAll('And', 'and').replaceAll('Of', 'of').replaceAll('Nhs', 'NHS');
};

const OdsTable = ({ medication, odsCode, setOdsCode, setOdsName, mode }) => {
    const [data, setData] = useState([]);
    const [empty, setEmpty] = useState(false);
    const [loading, setLoading] = useState(false);
    const medCode = !medication ? null : mode=='Formulations' ? medication.vmp_product_name : medication.isid;


    useEffect(() => {
        // update the ods name
        if (odsCode === null) {
            setOdsName(null);
        } else {
            const odsName = data.find(item => item.ods_code === odsCode).ods_name;
            setOdsName(odsName);
        }
    }, [odsCode, data]);
    const [filterQuery, setFilterQuery] = useState('');


  
    useEffect(() => {
      const fetchUsageData = async () => {
        setLoading(true);
        if (medication) {
          const response = await fetch(`/api/fetchODSusage?medicationCode=${medCode}&mode=${mode}`);
          let fetchedData = await response.json();
          setEmpty(fetchedData.length === 0);
          fetchedData = fetchedData.map(item => ({ ...item, ods_name: titleCase(item.ods_name) }));
          setData(fetchedData);
          setLoading(false);
        }
      };
      fetchUsageData();
    }, [medication]);

    if(!medication) {
      return null;
    }

    const filteredData = filterQuery.trim() ?  data.filter(item => 
        item.ods_name.toLowerCase().includes(filterQuery.toLowerCase())
      ) : data;

      // if odsCode is not in the filtered data, set it to null
        if (odsCode !== null && !filteredData.find(item => item.ods_code === odsCode)) {
            setOdsCode(null);
        }

    
    if (empty)  {
      return (
        null
      )
    }

    if (loading) {
      return (
        <div className="bg-white shadow rounded-md p-4 text-sm mx-auto overflow-y-scroll h-72 border mt-4" style={{width:"600px"}}>
          <div className="flex justify-center items-center">
            <ClipLoader color="#1D4ED8" />
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white shadow rounded-md p-4 text-sm mx-auto overflow-y-scroll h-72 border mt-4" style={{width:"600px"}}>
        
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-3 border-b font-medium text-left">ODS</th>
              <th className="py-2 px-3 border-b font-medium text-left">Trust
              <input 
            type="text" 
            placeholder="Filter by name" 
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="p-2 border rounded ml-2"
          />
          </th>
              <th className="py-2 px-3 border-b font-medium text-left">Total usage</th>
            </tr>
          </thead>
          <tbody>
            <tr className={`hover:bg-blue-100 cursor-pointer ${odsCode === null ? 'bg-blue-200' : ''}`} onClick={() => setOdsCode(null)}>
              <td className="py-2 px-3 border-b"></td>
              <td className="py-2 px-3 border-b"><i>All trusts</i></td>
              <td className="py-2 px-3 border-b"><i>{data.reduce((acc, item) => acc + item.total_usage, 0).toLocaleString()}</i></td>
            </tr>
            {filteredData.map(item => (
              <tr key={item.ods_code} className={`hover:bg-blue-100 cursor-pointer ${odsCode === item.ods_code ? 'bg-blue-200' : ''}`} onClick={() => setOdsCode(item.ods_code)}>
                <td className="py-2 px-3 border-b">{item.ods_code}</td>
                <td className="py-2 px-3 border-b">{item.ods_name}</td>
                <td className="py-2 px-3 border-b">{item.total_usage.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  
  export default OdsTable;