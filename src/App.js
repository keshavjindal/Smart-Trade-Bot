import React, { useState } from 'react'
import './App.css';
import Chart from './components/Chart';
import Inventory from './components/Inventory';
import OrderList from './components/OrderList';

function App() {
 
  const [pwallet ,setPwallet] = useState([]);


  return (
    <div className="App">
      <Inventory setPwallet={setPwallet}/>
      <OrderList />
      <Chart pwallet={pwallet} />
    </div>
  );
}

export default App;
