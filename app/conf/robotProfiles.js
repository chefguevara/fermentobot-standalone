const robotProfiles = [
    {
        name: 'Control de fermentado',
        sensor: 'Fermenter 1',
        relays: [
            {
                name: 'Cooler',
                type: 'cooler'
            },
            {
                name: 'Heater',
                type: 'heater'
            },
        ],
        tolerance: 1.5,
        wait: 1,
        logOnly: false
    },
    {
        name: 'Temperatura Ambiental',
        sensor: 'Ambient',
        logOnly: true
    },
    {
        name: 'Humedad Ambiental',
        sensor: 'Humidity',
        logOnly: true
    }
];

export default robotProfiles;
