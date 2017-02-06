import deviceTypes from '../constants/deviceTypes';

const robotConf = {
/*    boardConf: {
        port: 'COM5'
    },*/
    sensors: [
        {
            name: 'hygrometer+thermometer',
            type: deviceTypes.I2C,
            isMultiDevice: true,
            address: 0x0A,
            bytes: 6,
            devices: [
                {
                    name: 'Humidity',
                    bytes: 2,
                    params: {
                        humidity: true
                    }
                },
                {
                    name: 'Ambient',
                    alias: 'C',
                    bytes: 2
                },
                {
                    name: 'Fermenter 1',
                    alias: 'C',
                    bytes: 2
                }
            ]
        }

    ],
    relays: [
        {
            name: 'Cooler',
            type: deviceTypes.RELAY,
            pin: 2
        },
        {
            name: 'Heater',
            type: deviceTypes.RELAY,
            pin: 3
        }
    ]
};

export default robotConf;
