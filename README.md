# rpi4_nodejs_rgb_led_control
Nodejs server to open RGB LED control for testing.


Intended use's scope and steps:
1. use as a get started project on raspberry pi (headless)
2. on rpi, install git with "sudo apt install git"
3. clone this repo with "git clone https://github.com/swatchai/rpi4_nodejs_rgb_led_control.git"
4. then "cd rpi4_nodejs_rgb_led_control"
5. then run with "npm start"

You should see: Listening on port: 3000

On another computer or mobile phone, use web browser to open URI: http://xxx.xxx.x.xx:3000

The circuit of the hardware on the server side:
3 LED, red, green, and blue on proper GPIO pins must be connected.
See code in the relevant javascript file for the PIN numbers.
