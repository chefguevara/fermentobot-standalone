import EventEmitter from 'events';

export default class Sensor extends EventEmitter {
    constructor(device) {
        super();
        this.device = device;
        this.realValue = 0;
        if (this.device.params && this.device.params.length > 0) {
            let params = this.device.params;

            Object.keys(params).forEach(key => {
                //TODO: create blacklist to check key is not compromising security
                this[key] = params[key];
            });
        }

        this.on('reading', this.doReading)
    }

    doReading(data) {
        if (this.value !== data) {
            this.emit('change');
        }
        this.value = data;
        this.emit('data')
    }

    set value(value) {
        if (this.aliases && this.aliases.length > 0) {
            this.aliases.forEach(alias => {
                this[alias] = value;
            });
        }
        this.realValue = value;
    }

    get value() {
        return this.realValue;
    }
}
