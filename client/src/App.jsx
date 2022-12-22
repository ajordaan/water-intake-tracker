import { useState, useEffect } from 'react'
import './App.css'
import WaterBottle from './WaterBottle'
import Scale from './Scale'
import { io } from "socket.io-client";
function App() {
  const socket = io.connect(':3000');
  const [bottleLifted, setBottleLifted] = useState(true);
  const [waterLevel, setWaterLevel] = useState(0)

  const liftBottle = () => setBottleLifted(true)
  const lowerBottle = () => setBottleLifted(false)

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('socket connected')
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      console.log('Recieved socket data from server')
      setLastPong(new Date().toISOString());
    });

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

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
    console.log('sent ping')
  }


  return (

    <div className="page-layout">
       <p>Connected: { '' + isConnected }</p>
    
      <div className='container'>
        <WaterBottle bottleLifted={bottleLifted} waterLevel={waterLevel}/>
        <Scale />
      </div>
    </div>
  )
}

export default App
