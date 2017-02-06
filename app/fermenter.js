import moment from 'moment';
import Robot from './robot';
import TemperatureController from './temperatureController';
import Reading from './models/reading';

import profileStatus from './constants/profileStatus';

export default class Fermenter extends Robot {
    constructor(config, profiles) {
        super();
        this.tempCtrl = new TemperatureController();
        this.setup(config)
            .getBoard()
            .then(board => {
                this.addProfiles(board, profiles);
                this.addScreen(board);
            });
    }

    addScreen(board) {
        this.screen = this.five.LCD({
            pins: [7, 8, 9, 10, 11, 12],
            backlight: 6,
            rows: 2,
            cols: 20
        });
        this.screen.clear().print("Fermentobot ON!");

        this.displayQueue = {};
        /*board.repl.inject({
            screen: this.screen
        });*/
        this.displayInit();
    }
    saveReading(data) {
        Reading.create(data, (err) => {
            if (err) {
                console.log('eeeerrroooooooor', err);
                console.warn(err);
            }
        });
    }
    displayInit() {
        let i = 0;
        setInterval(() => {
            let keys = Object.keys(this.displayQueue),
                key;
            if (keys.length === 0) {
                return;
            }
            if (i === keys.length) {
                i = 0;
            }
            key = keys[i];
            this.screen.clear().print(key);
            this.screen.cursor(1, 0);
            this.screen.print(this.displayQueue[key]);
            i++;
        }, 3000);
    }
    updateDisplayQueue(key, value) {
        this.displayQueue[key] = value;
    }
    addProfiles(board, profiles) {
        if (!profiles || profiles.length === 0) {
            throw new Error('ADD_PROFILES: There are no profiles to add.');
        }
        if (!board) {
            throw new Error('ADD_PROFILES: The board is not defined.');
        }
        profiles.forEach(profile => this.addProfile(profile));
    }
    addProfile({name: profileName, sensor: sensorName, relays: profileRelays = [], target = null, tolerance = null, wait = null, logOnly = true}) {
        if (!profileName) {
            throw new Error('ADD_PROFILE: A profile needs a name.');
        }
        if (!sensorName || !this.sensors[sensorName]) {
            throw new Error('ADD_PROFILE: A profile needs a valid sensor.');
        }
        let sensor = this.sensors[sensorName],
            relays = {},
            lastRun = null;

        if (!logOnly && profileRelays.length > 0) {
            profileRelays.forEach(relay => {
                relays[relay.type] = this.relays[relay.name]; //type: {cooler, heater, flow}
            });
        }

        sensor.on('data', () => {
            let reading = {
                time: new Date().getTime(),
                profile: profileName,
                appId: process.env.APP_ID,
                value: sensor.value
            };
            if (!logOnly) {
                let statusChange = this.tempCtrl.checkTemperature(reading.value, target, tolerance, relays, lastRun, wait);
                if (statusChange.status === profileStatus.COOLER_OFF) {
                    lastRun = moment();
                }

                //flow is hardcoded to work only with cooling stage right now.
                if ( relays.flow) {
                    if (statusChange.status === profileStatus.HEATER_ON) {
                        relays.flow.on();
                    } else if (statusChange.status === profileStatus.HEATER_OFF){
                        relays.flow.off();
                    }
                }
                reading.status = statusChange.status;
            } else {
                //check for special devices to perform log only actions. IE: an hygrometer for environment temperature.
                if (sensor.device && sensor.device.params && sensor.device.params.humidity) {
                    reading.humidity = true;
                }

            }
/*            console.log(`Reading from: ${sensorName} ${sensor.value}`);
            if (reading && reading.status) {
                console.log(`[${reading.status}]`);
            }*/
            this.updateDisplayQueue(sensorName, sensor.value);

            this.saveReading(reading);
        });
        console.log(`${sensorName} added`);
    }
}
