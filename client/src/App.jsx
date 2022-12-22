import { useState, useEffect } from 'react'
import './App.css'
import WaterBottle from './WaterBottle'
import Scale from './Scale'
import { io } from "socket.io-client";
import StatusBar from './StatusBar';
function App() {
  const socket = io.connect(':3000', { reconnection: false });
  const [bottleLifted, setBottleLifted] = useState(true);
  const [waterLevel, setWaterLevel] = useState(0)

  const liftBottle = () => setBottleLifted(true)
  const lowerBottle = () => setBottleLifted(false)

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('socket connected')

      socket.on('BOTTLE LOWERED', (data) => {
        console.log('bottle lowered')
        console.log({data} )
        lowerBottle()
        setWaterLevel(parseInt(data.waterLevel))
      });
      socket.on('BOTTLE LIFTED', () => {
        console.log('bottle lifted')
        liftBottle()
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);


  return (

    <div className="page-layout">
    
      <StatusBar isConnected={isConnected} />
      <div className='container'>
        <WaterBottle bottleLifted={bottleLifted} waterLevel={waterLevel}/>
        <Scale />
      </div>
    </div>
  )
}

export default App
