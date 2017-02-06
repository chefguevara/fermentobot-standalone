import profileStatus from './constants/profileStatus';
import moment from 'moment';

export default class TemperatureController {
    constructor() {}

    checkTemperature(temperature, target, tolerance, relays, lastRun, wait) {
        let tempIsLow,
            tempIsHigh,
            status = {status: profileStatus.IN_RANGE};

        if (lastRun === null) { // startup, we need to wait in case the compressor just turn off
            return {status: profileStatus.COOLER_OFF};
        }

        if (relays && (!relays.heater.isOn && !relays.cooler.isOn) &&
            (((target - tolerance) < temperature) && (temperature < (target + tolerance)))) {
            return status;
        }

        tempIsHigh = this.checkForCooler(temperature, target, tolerance, relays.cooler.isOn);
        tempIsLow = this.checkForHeater(temperature, target, tolerance, relays.heater.isOn);

        if (tempIsHigh.status != profileStatus.IN_RANGE) {
            status = tempIsHigh;
            if (tempIsHigh.status === profileStatus.COOLER_OFF) {
                relays.cooler.off();
            }
            if (tempIsHigh.status === profileStatus.COOLER_ON) {
                if (!relays.cooler.isOn && (moment(lastRun).add(wait, 'minutes').isBefore(new Date()))) {
                    relays.cooler.on();
                } else {
                    status = {status: profileStatus.WAITING_FOR_COMPRESSOR};
                }
            }
        }

        if (tempIsLow.status != profileStatus.IN_RANGE) {
            status = tempIsLow;
            if (tempIsLow.status === profileStatus.HEATER_OFF) {
                relays.heater.off();
            }
            if (tempIsLow.status === profileStatus.HEATER_ON) {
                relays.heater.on();
            }
        }

        if (relays.heater.isOn && relays.cooler.isOn) {
            relays.cooler.off();
            relays.heater.off();
            // give some times to the relays to turn off
            setTimeout(() => {
                throw new Error("CHECK_TEMPERATURE: The cooler and heater were turned on simultaneously, check your temp ranges and your sensor readings.");
            }, 1500);
        }

        return status;
    }

    checkForCooler(temperature, target, tolerance, isOn) {
        let status = {status: profileStatus.IN_RANGE};
        // if the temperature is higher than my target plus offset and is not already cooling.
        if (temperature >= (target + tolerance) && !isOn) {
            // turn cooler on
            status = {status: profileStatus.COOLER_ON};
        }

        if (temperature >= (target + tolerance) && isOn) {
            // keep it cool
            status = {status: profileStatus.COOLING};
        }

        // if the temperature reaches our target and the cooler is on.
        if (temperature <= target && isOn) {
            // turn coler off
            status = {status: profileStatus.COOLER_OFF};
        }
        return status;
    }

    checkForHeater(temperature, target, tolerance, isOn) {
        let status = {status: profileStatus.IN_RANGE};
        // if the temperature is lower than my target minus offset and is not already heating.
        if (temperature <= (target - tolerance) && !isOn) {
            // turn heater on
            status = {status: profileStatus.HEATER_ON};
        }

        if (temperature <= (target - tolerance) && isOn) {
            // keep it warm
            status = {status: profileStatus.HEATING};
        }
        // if the temperature reaches our target and the heater is on.
        if (temperature >= target && isOn) {
            // turn heater off
            status = {status: profileStatus.HEATER_OFF};
        }
        return status;
    }
}