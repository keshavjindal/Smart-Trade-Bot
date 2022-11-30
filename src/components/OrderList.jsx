import React from 'react'
import axios from 'axios';
import { useEffect, useState } from 'react'
import {Table} from 'antd'
import 'antd/dist/antd.css';
// import type { ColumnsType } from 'antd/lib/table';
import '../App.css';
import { getRealTimeFromUnixTime } from '../utils';


const OrderList = () => {
 const [orders , setOrders] = useState([])

  //  function getRealTimeFromUnixTime(unixTime){
    
  //   let date = new Date(unixTime * 1000);
    
  //   // console.log(date.toDateString());

  //   let hours = date.getHours();
  //   let minutes = "0" + date.getMinutes();
  //   let seconds = "0" + date.getSeconds();

  //   let realTime = date.toDateString() + " " + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  //   return realTime
  // }

//  useEffect(() => {
//    axios.get("http://localhost:3000/allTransactions")
//    .then(res => res.data)
//    .then(data => {
      
//     for(let i=0; i<data.length; i++){
//       data[i].time_stamp = getRealTimeFromUnixTime(data[i].time_stamp)
//       data[i].trade_value = data[i].trade_value.toFixed(5)
//       data[i].trade_price = data[i].trade_price.toFixed(3)
//     }
//     setOrders(data)
//    })
//  } , [])

useEffect(() => {
  let ordersStream = new WebSocket("ws://localhost:3002/allTransactions")
  
  ordersStream.onmessage = function(event){
    // console.log(event.data)

    let allOrdersArr = JSON.parse(JSON.parse(event.data))

      for(let i=0; i<allOrdersArr.length; i++){
        allOrdersArr[i].time_stamp = getRealTimeFromUnixTime(allOrdersArr[i].time_stamp)
        allOrdersArr[i].trade_value = allOrdersArr[i].trade_value.toFixed(5)
        allOrdersArr[i].trade_price = allOrdersArr[i].trade_price.toFixed(3)
    }

    setOrders(allOrdersArr)
  }
} , [])

 console.log("ordersssssss", orders);

 const columns = [

   {
     title: 'Time',
     dataIndex: 'time_stamp',
     key: 'time_stamp',
     sorter: (a, b) => {
      return a.time_stamp>b.time_stamp;
    }
   },
   {
    title: 'Order Type',
    dataIndex: 'order_type',
    key: 'order_type',
    sorter: (a, b) => {
      return a.order_type<b.order_type;
    }
  },
  {
    title: 'Trade Amount',
    dataIndex: 'trade_amount',
    key: 'trade_amount'
  },
  {
    title: 'Trade Price',
    dataIndex: 'trade_price',
    key: 'trade_price'
  },
  {
     title: 'Trade Value',
     dataIndex: 'trade_value',
     key: 'trade_value'
   },
   {
      title: 'Profit/Loss',
      dataIndex: 'profit_loss',
      key: 'profit_loss',
      render: (num) => (
        <>
          <p className={`${num >0 ? "profit" : "loss"}`}>{num.toFixed(3)}</p>
        </>
      )
    }
]


  return (
   <>
    <div className='heading'>
      <header className='Order History'>
        <br></br>
       <Table
         dataSource= {orders}
         columns={columns}
        >
       </Table>
      </header>
   </div>
  
   </>
 )
}

export default OrderList


// import React from 'react'
// import axios from 'axios';
// import { useEffect, useState } from 'react'
// import '../App.css';

// const OrderList = () => {
 
//   const [orders , setOrders] = useState([])

//   function getRealTimeFromUnixTime(unixTime){
    
//     let date = new Date(unixTime * 1000);
    
//     let hours = date.getHours();
//     let minutes = "0" + date.getMinutes();
//     let seconds = "0" + date.getSeconds();

//     let realTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
//     return realTime
//   }

//   useEffect(() => {
//     axios.get("http://localhost:3000/allTransactions")
//     .then(res => res.data)
//     .then(data => setOrders(data))
//   } , [])
  
//   return (
//     <>
//     <div className='heading'>
//        Order History
//     </div>
    
//     <div>
//     <table>
//       <thead>
//   <tr>
//     <th>Time</th>
//     <th>Order Type</th>
//     <th>Trade Amount</th>
//     <th>Trade Price</th>
//     <th>Trade Value</th>
//     <th>Profit/Loss</th>
//   </tr>
//   </thead>
  
//   <tbody>
//   {/* <tr>
//     <td>1656515540</td>
//     <td> Buy </td>
//     <td>0.001</td>
//     <td>19000.8274</td>
//     <td>19.0008274</td>
//     <td>1.01</td>
//     <td>9910</td>
//   </tr> */}
// {
//   orders.map((order) => {
//     return (

//       <tr>
//   <td>{getRealTimeFromUnixTime(order.time_stamp)}</td>
//   <td>{order.order_type}</td>
//   <td>{order.trade_amount}</td>
//   <td>{order.trade_price.toFixed(3)}</td>
//   <td className='profit'>{order.trade_value.toFixed(5)}</td>
//   <td>{order.change}</td>
//   </tr>

//     )
//   })
// }

//   </tbody>
// </table>
//     </div>
    
//     </>
//   )
// }

// export default OrderList