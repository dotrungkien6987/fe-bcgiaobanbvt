import * as React from 'react';

import { PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts/PieChart';

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
 function MyPieChartForMoney({data,colors,other,dataEx}) {
   // Ensure data is always an array
   data = Array.isArray(data) ? data : [];

  if(data.length >0) {
data  = data.map((dt,index)=>{
    
  let newlable =`${dt.label}:                 ${VND.format(dt.value)}`
  return {...dt,label:newlable,...colors[index]}
})
  } 
  if (dataEx) data = [...data,...dataEx]
  const total = data.map((item)=> Number(item.value)).reduce((a,b)=>a+b,0)
  const tongcong = {label:`Tổng cộng: ${VND.format(total)}`,value:0,color:'white'}
  data.push(tongcong);
  return (
    <PieChart
    // slotProps={{
    //   legend: {
    //     direction: 'row',
    //     position: { vertical: 'top', horizontal: 'middle' },
    //     padding: 0,
    //   },
    // }}
    series={[
      {
        
        data: data,
        highlightScope: { faded: "global", highlighted: "item" },
        faded: { innerRadius: 20, additionalRadius: -10 },
        cx:150,
        arcLabel:(params) => {
          const percent = params.value / total;
          if (percent===0){
            return ""
          }  else
          return `${(percent * 100).toFixed(0)}%`;
        },
        arcLabelMinAngle: 10,
      },
    ]}
    sx={{
      [`& .${pieArcClasses.faded}`]: {
        fill: "gray",
      },
      [`& .${pieArcLabelClasses.root}`]: {
        fill: 'white',
        // fontWeight: 'bold',
      },
    }}
    // height={300}
    {...other}
  />
  );
}
export default MyPieChartForMoney