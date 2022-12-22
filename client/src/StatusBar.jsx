import './StatusBar.css'
function StatusBar(props) {
 
  return (
    <div className='status'>
      <div className={`indicator-dot indicator-dot--${props.isConnected ? 'connected' : 'disconnected'} `}></div>
      <p>{`${props.isConnected ? 'Connected' : 'Disconnected'}`}</p>
    </div>
  )
}

export default StatusBar
