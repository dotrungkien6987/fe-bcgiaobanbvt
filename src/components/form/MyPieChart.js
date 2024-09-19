import * as React from 'react';

import { PieChart, pieArcClasses, pieArcLabelClasses } from '@mui/x-charts/PieChart';

 function MyPieChart({data,colors,other}) {
  data =data.map((dt,index)=>{
    
    let newlable =`${dt.label}: ${dt.value}`
    return {...dt,label:newlable,...colors[index]}
  })
  
  const total = data.map((item)=> Number(item.value)).reduce((a,b)=>a+b,0)
  
  const tongcong = {label:`Tổng cộng: ${total}`,value:0,color:'white'}
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
        cx:120,
        
        arcLabel:(params) => {
          const percent = params.value / total;
          if (percent===0){
            return ""
          }  else
          return `${(percent * 100).toFixed(0)}%`;
        },
        arcLabelMinAngle: 10,
        // arcLabelRadius: 0.2, // Thêm thuộc tính này để điều chỉnh khoảng cách của nhãn
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
export default MyPieChart