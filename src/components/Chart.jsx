import React, { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import '../App.css';
import { getOnlyTimeFromUnixTime} from '../utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);


const Chart = ({pwallet}) => {

  const [pldata, setPlData] = useState([]);
  
  useEffect(() =>{
    setPlData([...pldata, {time: pwallet[0]?.time_stamp , value : pwallet[0]?.profit_loss}]);
  },[pwallet])


  var valuedata = pldata?.map((item) => item?.value);
   valuedata = valuedata.filter((item, index) => index !=0);
  const color = valuedata.map((item) => item>0 ? 'rgba(53, 162, 235, 0.5)' : 'rgba(255, 99, 132, 0.5)');

  var timedata = pldata?.map((item) => getOnlyTimeFromUnixTime(item?.time));
  timedata = timedata.filter(item => item!== 'NaN:aN:aN');

  console.log(timedata);
  const data = {
    labels: timedata,
    datasets: [
        {
          label: ['Profit'],
          data: valuedata,
          backgroundColor: color,
          borderWidth: 0.2,
        }
    ]
}

//console.log("heyyyyyyyyyyyyyyyyy",pldata);
 
  return (
    <>
    <div className='heading'>
      Finance Chart
    </div>
    <div className='chart-container'>
      <Bar
        data={data}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Cryptocurrency prices"
            },
            legend: {
              display: true,
              position: "bottom"
           },
           zoom :{
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
            }
           }
          }
        }}
      />
    </div>
    </>
  )
}

export default Chart
