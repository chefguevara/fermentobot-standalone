import Fermenter from './fermenter';
import RobotFactory from './robotFactory';

import mongoose from 'mongoose';

const mongoConf = mongo = {
    uri: process.env.MONGOLAB_URI,
    options: {
        db: {
            safe: true
        }
    }
};

mongoose.connect(process.env.MONGOLAB_URI, mongoConf);

let robotFactory = new RobotFactory(),
    fermenter = robotFactory.getInstance(Fermenter);
