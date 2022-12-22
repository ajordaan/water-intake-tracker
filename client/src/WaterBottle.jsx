import './WaterBottle.css'
function WaterBottle(props) {
  const minPercentage = 4

  const height = props.waterLevel > minPercentage ? props.waterLevel : minPercentage
  return (
    <div className={`bottle ${props.bottleLifted ? 'bottle--lifted' : ''}`}>
      <div className="bottle_top">
        <div className="bottle_mouth">
          <div className="highlight"></div>
        </div>
      </div>
      <div className="bottle_neck">
        <div className="highlight"></div>
      </div>
      <div className="bottle_main">
        <div className="bottle_inner">
          <div className="water" style={{
            height: `${height}%`
          }} ></div>
        </div>
        <div className="highlight"></div>
      </div>
    </div>
  )
}

export default WaterBottle
