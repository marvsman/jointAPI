import {Authentication, PhilipsTVConfig, validate} from "./philipstv.js";
import {get, post} from "./requestHelpers.js";
import {ReturnSettingsType} from "./settings/types.js";
import {NodeId} from "./settings/const_node.js";

type AmbilightStyleType = {}

enum AmbilightStyles {
    FOLLOW_VIDEO = 'FOLLOW_VIDEO',
    FOLLOW_AUDIO = 'FOLLOW_AUDIO',
    FOLLOW_COLOR = 'FOLLOW_COLOR',
    OFF = 'OFF',
}

enum AmbilightColorMenuSetting {
    HOT_LAVA = 'HOT_LAVA',
    DEEP_WATER = 'DEEP_WATER',
    FRESH_NATURE = 'FRESH_NATURE',
    ISF = 'ISF',
    PTA_LOUNGE = 'PTA_LOUNGE',
}

enum AmbilightVideoMenuSetting {
    STANDARD = 'STANDARD',
    NATURAL = 'NATURAL',
    IMMERSIVE = 'IMMERSIVE',
    VIVID = 'VIVID',
    GAME = 'GAME',
    COMFORT = 'COMFORT',
    RELAX = 'RELAX',
    OFF = 'OFF',
}

enum AmbilightAudioMenuSetting {

}

type AmbilightConfiguration = {
    styleName: AmbilightStyles;
    isExpert: boolean;
    menuSetting?: AmbilightVideoMenuSetting | AmbilightColorMenuSetting | AmbilightAudioMenuSetting;
    stringValue?: string;
}

type AmbilightData = {
    value: number;
}


export class AmbilightState {
    private mac?: string;
    private auth: Authentication;
    private config: PhilipsTVConfig;
    private _baseUrl: string;
    private ip: string;
    public ambiState: AmbilightConfiguration & {
        power: boolean;
        brightness?: number;
    } | null = null;

    constructor(ip: string, auth: Authentication, config: PhilipsTVConfig, mac?: string) {
        console.log('SettingsState constructor', auth)
        if (!validate.ip.test(ip)) {
            throw 'IP is not an IP Address!';
        }
        this.ip = ip;

        this._baseUrl = 'https://' + ip + ':1926/' + String(config.apiVersion);

        if (mac && !validate.mac.test(mac)) {
            throw 'Provided MAC is not an MAC Address!';
        } else if (mac) {
            this.mac = mac;
        }

        this.auth = auth;
        this.config = config;

        const s = this.getCurrent()
        s.then((v) => {
            if (v) {
                this.ambiState = {
                    ...v,
                    power: v.styleName !== AmbilightStyles.OFF,
                }
            }
        }).catch((e) => {
            console.error('Error getting current state', e)
        })
    }


    async getCurrent(): Promise<AmbilightConfiguration | null> {
        try {
            console.debug('SettingsState getCurrent: request started')
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/currentconfiguration';
            const result = await get(url, undefined, this.auth);
            const p: AmbilightConfiguration = await JSON.parse(result);
            this.ambiState = {
                ...p,
                power: p.styleName !== AmbilightStyles.OFF,
            }
            return p;
            // const p: ReturnSettingsType<PictureSettingsData> = await JSON.parse(result);

        } catch (error: any) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }

    async setConfiguration(config: AmbilightConfiguration): Promise<any> {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/currentconfiguration';
            const req_body = {
                styleName: config.styleName,
                isExpert: config.isExpert,
                menuSetting: config.menuSetting,
            }
            const result = await get(url, JSON.stringify(req_body), this.auth);
            console.log('AMBI setConfiguration', result)
            return null
        } catch (error: any) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately

        }
    }


    async getBrightness(): Promise<number | null> {
        try {
            console.debug('SettingsState getCurrent: request started')
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/menuitems/settings/current';
            const request_body = {'nodes': [{'nodeid': NodeId.AmbilightBrightness}]};
            const result = await post(url, JSON.stringify(request_body), this.auth);
            const p: ReturnSettingsType<AmbilightData> = await JSON.parse(result);
            if (this.ambiState !== null) {
                this.ambiState = {
                    ...this.ambiState,
                    brightness: p.values[0].value.data.value,
                };
            }
            return p.values[0].value.data.value;
        } catch (error: any) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }

    async getPowerState(): Promise<boolean | null> {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/power';
            const result = await get(url, undefined, this.auth);
            const p = await JSON.parse(result);
            return p.power === 'On';
        } catch (error: any) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }

    async setPowerState(state: boolean): Promise<any> {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/ambilight/power';
            const req_body = {
                power: state ? 'On' : 'Off'
            }

            await post(url, JSON.stringify(req_body), this.auth);
            if (state) {
                return this.getCurrent()
            } else {
                this.ambiState = {
                    styleName: AmbilightStyles.OFF,
                    isExpert: false,
                    power: false,
                }
            }
            return null
        } catch (error: any) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }

    async setVideo(mode: AmbilightVideoMenuSetting): Promise<any> {
        if (mode === AmbilightVideoMenuSetting.OFF) {
            return this.setPowerState(false)
        }
        return this.setConfiguration({
            styleName: AmbilightStyles.FOLLOW_VIDEO,
            isExpert: false,
            menuSetting: mode,
        })
    }
}