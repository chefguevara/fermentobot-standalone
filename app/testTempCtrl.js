import TemperatureController from './temperatureController';
import profileStatus from './constants/profileStatus';
import moment from 'moment';
import mongoose from 'mongoose';
import five from 'johnny-five';
import Reading from './models/reading';

let board = new five.Board(),
    tempCtrl = new TemperatureController();


process.env['MONGOLAB_URI'] = 'mongodb://localhost/fermentobot';

mongoose.connect(process.env.MONGOLAB_URI);

board.on('ready', () => {
    let leds = {
            cooler: new five.Led(7),
            heater: new five.Led(8)
        },
        reading = new five.Sensor({
            pin: "A0",
            freq: 1500
        }),
        statusChange,
        lastRun = null;

    reading.on('change', () => {
        let temp = reading.scaleTo(14, 24),
            data = {
                time: new Date(),
                value: temp,
                appId: 'temp-controller-test',
                humidity: false
            };
        statusChange = tempCtrl.checkTemperature(temp, 18, 1.5, leds, lastRun, 1);
        console.log(`[${statusChange.status}] [heater: ${leds.heater.isOn}] [cooler: ${leds.cooler.isOn}]`);
        if (statusChange.status === profileStatus.COOLER_OFF) {
            lastRun = moment();
        }
        Reading.create(Object.assign({}, data, statusChange), (err) => {
            if (err) {
                console.log('eeeerrroooooooor', err);
                console.warn(err);
            }
        });
    });
});
