# Arduino Water Intake Tracker
This is the code for automatically tracking water intake using a digital scale powered by an Arduino.
(Currently a work in progress.)

## How it works

An arduino is connected to a load cell to create a digital scale. The scale value is written to the serial USB port the Arduino is connected to. 
A Node JS server reads the serial USB port and interprets the values. 
A React web app then connects to the server via websockets to get realtime visualisation and tracking of the scale.
The app will show whether or not the bottle is placed on the scale and how much water is in the bottle.

## Install and usage instructions

* Clone this repo
* Install dependencies by running `yarn` in the server and client folders
* Remove any weight from your scale
* Connect your scale to a USB port that your server can read.
* Start the server and client by running `yarn start` and `yarn dev` in the server and client folders respectively
* Note: If your client is not running on http://localhost:5173 then you will need to update the Socket.io cors origin


## Limitations
Due to issues with my scale I had to make some compromises. These may or may not be resolved in the future :D
* Only one bottle size can be used at a time
* The bottle empty and full weights must be known ahead of time
* The bottle cannot be filled while on the scale, it must be completely removed.
* The scale will gradually drift over time, so running the server all day without re-calibrating will eventually cause inaccurate results

## Adjusting the scale readings
There are some options to tweak the scale readings
* `scaleOffset`: The value that should be subtracted from the scale reading to get an accurate reading.
  - Use 0 if your scale is perfectly calibrated
  - If your scale reads 100g without anything on it then the `scale_offset` will be 100.
  - If you do not specify an offset, then the first value the server reads will be used as the offset.
* `tolerance`: The margin of error allowed
  - With a tolerance of 20, and an empty bottle weight of 400g, then any value within 20g of 400g will be considered "equal" to 400g
*  `stabiliseScale`: Events will only run when an equal repeat reading has been received (takes `tolerance` into account).
   - STRONGLY RECCOMENDED unless your scale is already smoothing / averaging readings 
  
## TODO
* Add tare / recalibration function that is either automated or initiated from client
* Add water intake tracking and store results in a simple DB
* Reminders for when water bottle is empty / off scale / water intake not met
* Client sockets seems a bit wonky. Had to disable automatic reconnection for now
