export { SettingsState,  } from './settings.js';
export { PhilipsTV, PhilipsTVConfig, Authentication } from './philipstv.js';
export { AmbilightState } from './ambilight.js';

// import {Authentication, PhilipsTV, PhilipsTVConfig} from "./philipstv.js";
//
//
// console.log('Hello, world!');
//
// type config = {
//     ipAddress: string;
//     auth:Authentication;
//     config?: PhilipsTVConfig;
// }
//
// const tvConfig: config = {
//     ipAddress: '192.168.0.32',
//     auth: {
//         user: process.env.API_USER || 'user',
//         pass: process.env.API_PASS || 'password',
//         sendImmediately: false,
//     },
// }
//
// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
//
// const tv = new PhilipsTV(tvConfig.ipAddress, undefined, tvConfig.auth, tvConfig.config);
//
// if (!tv.ambilight) {
//     console.log('No settings found');
//     process.exit(1);
// }
// console.log(tv.ambilight.getBrightness());
