import './WaterBottle.css'
function WaterBottle(props) {
  const MIN_HEIGHT = 11
  const MAX_HEIGHT = 300

  const computedHeight = (props.waterLevel / 100) * (MAX_HEIGHT - MIN_HEIGHT) + MIN_HEIGHT
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
          height: computedHeight
        }} ></div>
    </div>
    <div className="highlight"></div>
  </div>
</div>
  )
}

export default WaterBottle
