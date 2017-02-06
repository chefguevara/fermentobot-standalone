import five from 'johnny-five';
import EventEmitter from 'events';

import Sensor from './miniSensor';
import deviceTypes from './constants/deviceTypes';

const AUTO_INIT_DEVICES = [
    'sensors',
    'relays'
];
export default class Robot extends EventEmitter {
    constructor() {
        super();
        this.five = five;
        this.board = null;
        this.sensors = {};
        this.relays = {};
    }
    getBoard() {
        return new Promise((resolve, reject) => {
            this.on('BOARD_READY', () => {
                resolve(this.board);
            });
            const rejectTimeout = () => {
                if (!this.board) {
                    reject(null);
                    throw new Error('BOARD: The board took to much time to initialize.');
                }
            };

            //wait 30 secs before rejecting the promise
            setTimeout(rejectTimeout, 30000);
        });
    }
    setup(config) {
        if (!config) {
            throw new Error('INIT: Cannot create a board without config');
        }
        if (this.board === null) {
            this.board = new this.five.Board(config.boardConf || undefined);
        }
        this.config = config;

        this.board.on('ready', () => {
            AUTO_INIT_DEVICES.forEach(deviceType => {
                const devices = config[deviceType];
                if (devices && devices.length > 0) {
                    devices.forEach(device => {
                        if (deviceTypes.I2C && device.isMultiDevice) {
                            this.addMultiDevice(device, deviceType);
                        } else {
                            this[deviceType][device.name] = this.addDevice(device);
                        }
                    });
                }
            });
            this.emit('BOARD_READY');
        });
        return this;
    }

    addDevice(device) {
        let deviceObj;
        switch(device.type) {
            case deviceTypes.ANALOG:
                deviceObj = this.analog(device);
                break;
            case deviceTypes.DIGITAL:
                deviceObj = this.digital(device);
                break;
            case deviceTypes.I2C:
                deviceObj = this.i2c_sensor(device);
                break;
            case deviceTypes.RELAY:
                deviceObj = this.relay(device);
                deviceObj.off();
                break;
            default:
                throw new Error('ADD_SENSOR: cannot create a sensor without type');
        }
        return deviceObj;
    }

    digital(config) {
        if (!config.pin) {
            throw new Error('SENSOR_DIGITAL_CONFIG: Cannot create a sensor without a Pin');
        }
        return new this.five.Sensor.Digital(config);
    }
    analog(config) {
        if (!config.pin) {
            throw new Error('SENSOR_ANALOG_CONFIG: Cannot create a sensor without a Pin');
        }
        return new this.five.Sensor(config);
    }
    addMultiDevice(config, deviceType) {
        if (!config.address) {
            throw new Error('MULTI_SENSOR_I2C_CONFIG: Cannot create an i2c sensor without an address');
        }
        if (!config.bytes) {
            throw new Error('MULTI_SENSOR_I2C_CONFIG: Cannot create an i2c sensor without the amount of bytes to read');
        }
        if (!config.devices || config.devices.length === 0) {
            throw new Error('MULTI_SENSOR_I2C_CONFIG: Cannot create a multi i2c sensor without any devices');
        }
        const {address: ADDRESS, bytes: BYTES, freq: FREQ = 30000} = config;
        let pseudoSensors = [];

        config.devices.forEach(device => {
            let sensor = new Sensor(device);
            pseudoSensors.push(sensor);
            this[deviceType][device.name] = sensor;
        });

        this.board.i2cConfig(ADDRESS);

        this.board.loop(FREQ, () => {
            this.board.i2cReadOnce(ADDRESS, BYTES, (bytes) => {
                let currentSensor = 0;
                for (let i = 0; i < bytes.length; i = i + 2) {
                    //todo: handle more than 2 bytes per reading/sensor
                    let reading = five.Fn.int16(bytes[i], bytes[i + 1])/100;
                    pseudoSensors[currentSensor].emit('reading', reading);
                    currentSensor++;
                }
            });
        });
    }

    i2c_sensor(config) {
        if (!config.address) {
            throw new Error('SENSOR_I2C_CONFIG: Cannot create an i2c sensor without an address');
        }
        if (!config.bytes) {
            throw new Error('SENSOR_I2C_CONFIG: Cannot create an i2c sensor without the amount of bytes to read');
        }
        //TODO do something with the shape to handle non multisensors device via i2c

        const {address: ADDRESS, bytes: BYTES, freq: FREQ = 1000} = config;

        let sensor = new Sensor(config);
        this.board.i2cConfig(ADDRESS);
        this.board.loop(FREQ, () => {
            this.board.i2cReadOnce(ADDRESS, BYTES, (bytes) => {
                let reading = [];
                for (let i = 0; i < bytes.length; i = i + 2) {
                    reading.push(five.Fn.int16(bytes[i], bytes[i + 1])/100);
                }
                sensor.emit('reading', reading);
            });
        });

        return sensor;
    }
    relay({pin, name}) {
        if (!pin) {
            throw new Error('RELAY_CONFIG: Cannot create a relay without a Pin');
        }
        return new this.five.Relay({pin, type: 'NC'});
    }
}
