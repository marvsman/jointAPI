import { validate } from "./philipstv.js";
import { get, post } from "./requestHelpers.js";
import { NodeId } from "./settings/const_node.js";
var AmbilightStyles;
(function (AmbilightStyles) {
    AmbilightStyles["FOLLOW_VIDEO"] = "FOLLOW_VIDEO";
    AmbilightStyles["FOLLOW_AUDIO"] = "FOLLOW_AUDIO";
    AmbilightStyles["FOLLOW_COLOR"] = "FOLLOW_COLOR";
    AmbilightStyles["OFF"] = "OFF";
})(AmbilightStyles || (AmbilightStyles = {}));
var AmbilightColorMenuSetting;
(function (AmbilightColorMenuSetting) {
    AmbilightColorMenuSetting["HOT_LAVA"] = "HOT_LAVA";
    AmbilightColorMenuSetting["DEEP_WATER"] = "DEEP_WATER";
    AmbilightColorMenuSetting["FRESH_NATURE"] = "FRESH_NATURE";
    AmbilightColorMenuSetting["ISF"] = "ISF";
    AmbilightColorMenuSetting["PTA_LOUNGE"] = "PTA_LOUNGE";
})(AmbilightColorMenuSetting || (AmbilightColorMenuSetting = {}));
var AmbilightVideoMenuSetting;
(function (AmbilightVideoMenuSetting) {
    AmbilightVideoMenuSetting["STANDARD"] = "STANDARD";
    AmbilightVideoMenuSetting["NATURAL"] = "NATURAL";
    AmbilightVideoMenuSetting["IMMERSIVE"] = "IMMERSIVE";
    AmbilightVideoMenuSetting["VIVID"] = "VIVID";
    AmbilightVideoMenuSetting["GAME"] = "GAME";
    AmbilightVideoMenuSetting["COMFORT"] = "COMFORT";
    AmbilightVideoMenuSetting["RELAX"] = "RELAX";
    AmbilightVideoMenuSetting["OFF"] = "OFF";
})(AmbilightVideoMenuSetting || (AmbilightVideoMenuSetting = {}));
var AmbilightAudioMenuSetting;
(function (AmbilightAudioMenuSetting) {
})(AmbilightAudioMenuSetting || (AmbilightAudioMenuSetting = {}));
export class AmbilightState {
    constructor(ip, auth, config, mac) {
        this.ambiState = null;
        console.log('SettingsState constructor', auth);
        if (!validate.ip.test(ip)) {
            throw 'IP is not an IP Address!';
        }
        this.ip = ip;
        this._baseUrl = 'https://' + ip + ':1926/' + String(config.apiVersion);
        if (mac && !validate.mac.test(mac)) {
            throw 'Provided MAC is not an MAC Address!';
        }
        else if (mac) {
            this.mac = mac;
        }
        this.auth = auth;
        this.config = config;
        const s = this.getCurrent();
        s.then((v) => {
            if (v) {
                this.ambiState = {
                    ...v,
                    power: v.styleName !== AmbilightStyles.OFF,
                };
            }
        }).catch((e) => {
            console.error('Error getting current state', e);
        });
    }
    async getCurrent() {
        try {
            console.debug('SettingsState getCurrent: request started');
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/currentconfiguration';
            const result = await get(url, undefined, this.auth);
            const p = await JSON.parse(result);
            this.ambiState = {
                ...p,
                power: p.styleName !== AmbilightStyles.OFF,
            };
            return p;
            // const p: ReturnSettingsType<PictureSettingsData> = await JSON.parse(result);
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async setConfiguration(config) {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/currentconfiguration';
            const req_body = {
                styleName: config.styleName,
                isExpert: config.isExpert,
                menuSetting: config.menuSetting,
            };
            const result = await get(url, JSON.stringify(req_body), this.auth);
            console.log('AMBI setConfiguration', result);
            return null;
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async getBrightness() {
        try {
            console.debug('SettingsState getCurrent: request started');
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/menuitems/settings/current';
            const request_body = { 'nodes': [{ 'nodeid': NodeId.AmbilightBrightness }] };
            const result = await post(url, JSON.stringify(request_body), this.auth);
            const p = await JSON.parse(result);
            if (this.ambiState !== null) {
                this.ambiState = {
                    ...this.ambiState,
                    brightness: p.values[0].value.data.value,
                };
            }
            return p.values[0].value.data.value;
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async getPowerState() {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/power';
            const result = await get(url, undefined, this.auth);
            const p = await JSON.parse(result);
            return p.power === 'On';
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async setPowerState(state) {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/power';
            const req_body = {
                power: state ? 'On' : 'Off'
            };
            await post(url, JSON.stringify(req_body), this.auth);
            if (state) {
                return this.getCurrent();
            }
            else {
                this.ambiState = {
                    styleName: AmbilightStyles.OFF,
                    isExpert: false,
                    power: false,
                };
            }
            return null;
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async setVideo(mode) {
        if (mode === AmbilightVideoMenuSetting.OFF) {
            return this.setPowerState(false);
        }
        return this.setConfiguration({
            styleName: AmbilightStyles.FOLLOW_VIDEO,
            isExpert: false,
            menuSetting: mode,
        });
    }
}
//# sourceMappingURL=ambilight.js.map