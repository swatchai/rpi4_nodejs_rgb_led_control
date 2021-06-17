// Mar17, 2021
// By Swatchai Kriengkraipet
// Last edit: June 14, 2021
// Status: OK
// Port number: 8089, defines as USE_PORT
// To see ip, run
// hostname -I
//or ifconfig wlan0

/*
  Libraries: onoff.Gpio, fs.readFile, socket.io
*/

// Use "onoff" module to handle LEDs
const Gpio = require('onoff').Gpio; //require onoff to control GPIO

// Dont use `Gpio` below, it requires `sudo` to enable functionality
//It supports variable density of each LED
//const Gpio = require('pigpio').Gpio; //include pigpio to interact with the GPIO

const USE_PORT = 8089; //can use multiple when have n servers/io

// 3 pins near each others are used
const RED_PIN = 26;
const GRN_PIN = 6;
const BLU_PIN = 5;

const LEDPin_R = new Gpio(RED_PIN, 'out'); //declare GPIO? an output
const LEDPin_G = new Gpio(GRN_PIN, 'out');
const LEDPin_B = new Gpio(BLU_PIN, 'out');

function resetLED () {
	//turn all LEDs off
	LEDPin_R.writeSync(0);
	LEDPin_G.writeSync(0);
	LEDPin_B.writeSync(0);
}
function all_LED_On () {
	//turn all LEDs on
	LEDPin_R.writeSync(1);
	LEDPin_G.writeSync(1);
	LEDPin_B.writeSync(1);
}

// Turn on LEDs, then, off.
all_LED_On();
setTimeout(resetLED, 500);

// Use "fs" for files handling
const fs = require('fs'); //require filesystem to read html files

const server1 = require('http').createServer(function handler(req, res) { //create server
  fs.readFile(__dirname + '/index_webserver.html', function (err, data) { //read html file
    if (err) {
      res.writeHead(500);
      return res.end('Error loading socket.io.html');
    }
    res.writeHead(200);
    res.end(data); //send web page to client
  });
});

// read counter.txt
/*
fs.readFile(__dirname + '/counter.txt', function (err, count_data) {
  if (err) {
    console.log("Err read counter.txt");
  }
  else {
    console.log("Counter:", count_data);
  }
}) 
*/

// Use "socket.io" library to do web apps
// Can use 'IO_1', 'IO_2',... when have multiple clients
const IO_1 = require('socket.io')(server1) //require socket.io module and pass the `server1` object

// For client/user
//Sample URI, the actual will be different
// 192.168.1,47:8089
//Use this command to get URI to open control web page
// $ hostname -I

// For the server:
// Set port number of server1
server1.listen( USE_PORT ); //listen to port USE_PORT

//global vars, funs here
// no var

function blinkLED( LedObj ) {     //function to start blinking
  if (LedObj.readSync() === 0) {  //check the pin state, if the state is 0 (or off)
	LedObj.writeSync(1);      //set pin state to 1 (turn LED on)
  } 
  else {
	LedObj.writeSync(0);      //set pin state to 0 (turn LED off)
  }
}

function endBlink( LedObj, blinkIntv ) {  //function to stop blinking
	//Use individual interval objs
	clearInterval(blinkIntv);     // Stop blink intervals
	LedObj.writeSync(0);          // Turn LED off
	//LedObj.unexport();          // Unexport GPIO to free resources
}

// ----- `socket.io` operation -----
// set `connection` and, within its scope, `socket` events
// socket: handles the states sent from client's side
// this attaches `socket.io` to a plain Node.JS HTTP server
// signature: io = require('socket.io')(server);

IO_1.on('connection', client1 => { // WebSocket Connection
  var btnStateRed = 0;   //(red, pin2)variable to store button state
  var btnStateGreen = 0; //(green, pin3)
  var btnStateBlue = 0;  //(blue, pin5)
  //token names used in client web-page for RGB led project
  const RLED_STATE = 'state1';
  const GLED_STATE = 'state2';
  const BLED_STATE = 'state3';

  //rooms
  //rooms are a server-only concept; clients have no access
  console.log(client1.rooms); // Set { <socket.id> }
  client1.join("room_01");
  console.log(client1.rooms); // Set { <socket.id>, "room1" }

  // `client1.on` task: listen to the event (from client1's actions)
  client1.on(RLED_STATE, data1 => { //get button state from client1
    btnStateRed = data1;
    const cur_st = LEDPin_R.readSync();  //current state
    if (btnStateRed <= 1) {
	    if (btnStateRed != LEDPin_R.readSync()) { //Change LED state if button state is changed
	      LEDPin_R.writeSync(btnStateRed); //toggle LED on or off
	    }
    }
    else {
	//blink, data1>1
	let blinkInterval = setInterval(() => {blinkLED( LEDPin_R );
		}, 250);
	setTimeout(() => {
		  endBlink( LEDPin_R, blinkInterval );
		}, 2000);
    }

  });
  // GREEN_LED
  client1.on(GLED_STATE, data2 => {
    btnStateGreen = data2;
    const cur_st = LEDPin_G.readSync();
    if (btnStateGreen <= 1) {
	    if (btnStateGreen != cur_st) {
	      LEDPin_G.writeSync( btnStateGreen );
	    }
    }
    else {
	//blink, data2>1
	let blinkInterval = setInterval(() => {blinkLED( LEDPin_G );
		}, 250);  //start blink
	setTimeout(() => {
		  endBlink( LEDPin_G, blinkInterval );
		}, 2000);
    }
  });
  // BLUE_LED
  client1.on(BLED_STATE, data3 => {
    btnStateBlue = data3;                //request value
    const cur_st = LEDPin_B.readSync();  //current value
    if (btnStateBlue <= 1) {
	    if (btnStateBlue != cur_st) {
	      LEDPin_B.writeSync( btnStateBlue ); //set as request
	    }
    }
    else {
	//blink, data3>1
	let blinkInterval = setInterval(() => {blinkLED( LEDPin_B );
		}, 250);
	setTimeout(() => {
		  endBlink( LEDPin_B, blinkInterval );
		}, 2000); //stop blinking after few sec.
    }

  });
  // When 'disconnect'
  // client1.on('disconnect', () => { /* \u2026 */ });

}); /* End-of-On_connection */

// Graceful exit routine
// when user press `control+c` on the server's term.
process.on('SIGINT', function () { //on ctrl+c
	LEDPin_R.writeSync(0);
	LEDPin_G.writeSync(0);
	LEDPin_B.writeSync(0);
	process.exit(); //exit completely
});
/* EOF */
