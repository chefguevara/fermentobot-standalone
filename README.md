# beerbotjs-node

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7

### Install and Run

1. Run `$ npm install` to install server dependencies.

2. Run the following lines:
    `$ sudo usermod -a -G dialout &lt;username&gt;`
    `$ sudo chmod a+rw /dev/ttyACM0`
    Where &lt;username&gt; is your linux user name, /dev/ttyACM0 is the detected device of your Arduino board, depending on your system it may change.
3. Configure the devices, profiles and environment variables.

4. Run `$ npm start`

### Configure your node to run locally (no conf from the server):
  - using example file: conf/devicesConf.js. Define the sensors your robot will have.
  - create the fermenter profiles on conf/robotProfiles.js pointing to the devices created previously.
  - make sure the following environment variables are properly set: 
    - HOST
    - PORT
    - APP_SECRET
    - APP_ID

## Testing

Running `$ npm test` will run the unit tests with karma.
