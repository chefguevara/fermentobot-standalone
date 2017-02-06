import Fermenter from './fermenter';
import RobotFactory from './robotFactory';

import devicesConf from './conf/devicesConf';
import robotProfiles from './conf/robotProfiles';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGOLAB_URI);

let robotFactory = new RobotFactory(),
    fermenter;

robotFactory.setConfig(devicesConf);
robotFactory.setProfiles(robotProfiles);
fermenter = robotFactory.getInstance(Fermenter);
