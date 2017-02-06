export default class RobotFactory{
    constructor() {
        this._instance = null;
        this._config = null;
        this._profiles = null;
        this._resolved = {
            all: false,
            config: false,
            profiles: false
        };
        this.config = this.defferConfig();
        this.profiles = this.defferProfiles();

    }
    defferConfig() {
        return new Promise((resolve, reject) => {
            this._config = {
                resolve,
                reject
            };
            const rejectTimeout = () => {
                if (!this._resolved.config) {
                    reject(null);
                    throw new Error('ASYNC CONFIG: The config is taking to much to load.');
                }
            };

            //wait 45 secs before rejecting the promise
            setTimeout(rejectTimeout, 45000);
        });
    }

    defferProfiles() {
        return new Promise((resolve, reject) => {
            this._profiles = {
                resolve,
                reject
            };
            const rejectTimeout = () => {
                if (!this._resolved.profiles) {
                    reject(null);
                    throw new Error('ASYNC PROFILES: The profiles are taking to much to load.');
                }
            };

            //wait 45 secs before rejecting the promise
            setTimeout(rejectTimeout, 45000);
        });
    }
    setConfig(config) {
        //console.log('setConfig', config);
        this._resolved.config = true;
        this._config.resolve(config);
    }
    setProfiles(profiles) {
        //console.log('setProfiles', profiles);
        this._resolved.profiles = true;
        this._profiles.resolve(profiles);
    }
    getInstance(Robot) {
        if (!(this._instance instanceof Promise)) {
            this._instance = new Promise((resolve, reject) => {
                Promise
                    .all([this.config, this.profiles])
                    .then(([config, profiles]) => {
                        this._resolved.all = true;
                        return resolve(new Robot(config, profiles))
                    }).catch(console.log.bind(console));

                const rejectTimeout = () => {
                    if (!this._resolved.all) {
                        reject(null);
                        throw new Error('ASYNC ROBOT: The robot is taking to much time to initialize.');
                    }
                };

                //wait 45 secs before rejecting the promise
                setTimeout(rejectTimeout, 45000);
            });
        }
        return this._instance;
    }
}
