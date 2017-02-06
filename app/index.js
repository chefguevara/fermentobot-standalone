import Fermenter from './fermenter';
import RobotFactory from './robotFactory';

import mongoose from 'mongoose';

mongoose.connect(process.env.MONGOLAB_URI);

let robotFactory = new RobotFactory(),
    fermenter = robotFactory.getInstance(Fermenter);
