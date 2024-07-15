import fs from 'node:fs';
import { validate } from "./philipstv.js";
import { get, post } from "./requestHelpers.js";
export class SettingsState {
    constructor(ip, auth, config, mac) {
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
    }
    async getCurrent() {
        try {
            console.debug('SettingsState getCurrent: request started');
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/menuitems/settings/current';
            const request_body = { 'nodes': [{ 'nodeid': 2131230838 }] };
            const result = await post(url, JSON.stringify(request_body), this.auth);
            const p = await JSON.parse(result);
            console.debug('SettingsState getCurrent: got response', p.values[0].value.data.selected_item);
            return p.values[0].value.data.selected_item;
        }
        catch (error) {
            console.error('Error parsing JSON:', error);
            throw new Error(error);
            // Handle the error appropriately
        }
    }
    async setCurrent(value) {
        try {
            const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/menuitems/settings/update';
            const req_body = {
                values: [
                    {
                        value: {
                            Nodeid: 2131230838,
                            Controllable: true,
                            Available: true,
                            data: {
                                selected_item: value.toString(),
                            },
                        },
                    }
                ],
            };
            console.log('SettingsState setCurrent', req_body, 1);
            return await post(url, JSON.stringify(req_body), this.auth);
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async writeToFile(data) {
        try {
            fs.writeFileSync('./out.json', data); //'a+' is append mode
            console.log('File written successfully');
        }
        catch (err) {
            throw new Error(err);
        }
    }
    async getMenuItems() {
        const url = 'https://' + this.ip + ':1926/' + String(this.config.apiVersion) + '/menuitems/settings/structure';
        const result = await get(url, '', this.auth);
        const p = await JSON.parse(result);
        await this.writeToFile(p);
        return p;
    }
}
//# sourceMappingURL=settings.js.map