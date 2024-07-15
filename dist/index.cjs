"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AmbilightState: () => AmbilightState,
  PhilipsTV: () => PhilipsTV,
  SettingsState: () => SettingsState
});
module.exports = __toCommonJS(src_exports);

// src/settings.ts
var import_node_fs = __toESM(require("fs"), 1);

// src/philipstv.ts
var import_wake_on_lan = __toESM(require("wake_on_lan"), 1);

// src/requestHelpers.ts
var import_request = __toESM(require("request"), 1);
async function doRequest(method, url, body = "", auth) {
  return new Promise((resolve, reject) => {
    const payload = {
      url,
      method,
      body,
      rejectUnauthorized: false,
      timeout: 5e3,
      forever: true,
      followAllRedirects: true
    };
    if (auth) {
      payload.auth = auth;
    }
    try {
      (0, import_request.default)(payload, (error, res, body2) => {
        console.log("doRequest", res.body);
        if (!error && res.statusCode === 200) {
          resolve(body2);
        } else if (error) {
          reject(error);
        } else {
          reject(res);
        }
      });
    } catch {
      reject("Request module failure");
    }
  });
}
async function get(url, body = "", auth) {
  return doRequest("GET", url, body, auth);
}
async function post(url, body = "", auth) {
  return doRequest("POST", url, body, auth);
}

// src/cmds/auth.ts
var import_crypto = __toESM(require("crypto"), 1);
var secret_key = "JCqdN5AcnAHgJYseUn7ER5k3qgtemfUvMRghQpTfTZq7Cvv8EPQPqfz6dDxPQPSu4gKFPWkJGw32zyASgJkHwCjU";
function prepareAuthenticationRequestPayload(timestamp, pin, apiUser, apiPass) {
  const hash = import_crypto.default.createHmac("sha1", Buffer.from(secret_key, "base64").toString()).update(timestamp + pin).digest("hex");
  return {
    auth: {
      pin,
      auth_timestamp: timestamp,
      auth_signature: hash
    },
    device: {
      "device_name": "heliotrope",
      "device_os": "Android",
      "app_name": "Homebridge",
      "type": "native",
      "app_id": "app.id",
      "id": apiUser,
      "auth_key": apiPass
    }
  };
}

// src/cmds/pair.ts
function makeDeviceId(length) {
  const result = [];
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * charactersLength);
    result.push(characters.charAt(random));
  }
  return result.join("");
}
function createUniquePairRequestPayload() {
  const deviceId = makeDeviceId(16);
  const payload = {
    "application_id": "app.id",
    "device_id": deviceId,
    "scope": ["read", "write", "control"],
    "device": {
      "device_name": "heliotrope",
      "device_os": "Android",
      "app_name": "Homebridge",
      "type": "native",
      "app_id": "app.id",
      "id": deviceId
    }
  };
  return payload;
}

// src/ambilight.ts
var AmbilightState = class {
  constructor(ip, auth, config, mac) {
    this.ambiState = null;
    console.log("SettingsState constructor", auth);
    if (!validate.ip.test(ip)) {
      throw "IP is not an IP Address!";
    }
    this.ip = ip;
    this._baseUrl = "https://" + ip + ":1926/" + String(config.apiVersion);
    if (mac && !validate.mac.test(mac)) {
      throw "Provided MAC is not an MAC Address!";
    } else if (mac) {
      this.mac = mac;
    }
    this.auth = auth;
    this.config = config;
    const s = this.getCurrent();
    s.then((v) => {
      if (v) {
        this.ambiState = {
          ...v,
          power: v.styleName !== "OFF" /* OFF */
        };
      }
    }).catch((e) => {
      console.error("Error getting current state", e);
    });
  }
  async getCurrent() {
    try {
      console.debug("SettingsState getCurrent: request started");
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/ambilight/currentconfiguration";
      const result = await get(url, void 0, this.auth);
      const p = await JSON.parse(result);
      this.ambiState = {
        ...p,
        power: p.styleName !== "OFF" /* OFF */
      };
      return p;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async setConfiguration(config) {
    try {
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/ambilight/currentconfiguration";
      const req_body = {
        styleName: config.styleName,
        isExpert: config.isExpert,
        menuSetting: config.menuSetting
      };
      const result = await get(url, JSON.stringify(req_body), this.auth);
      console.log("AMBI setConfiguration", result);
      return null;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async getBrightness() {
    try {
      console.debug("SettingsState getCurrent: request started");
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/menuitems/settings/current";
      const request_body = { "nodes": [{ "nodeid": 2131230769 /* AmbilightBrightness */ }] };
      const result = await post(url, JSON.stringify(request_body), this.auth);
      const p = await JSON.parse(result);
      if (this.ambiState !== null) {
        this.ambiState = {
          ...this.ambiState,
          brightness: p.values[0].value.data.value
        };
      }
      return p.values[0].value.data.value;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async getPowerState() {
    try {
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/ambilight/power";
      const result = await get(url, void 0, this.auth);
      const p = await JSON.parse(result);
      return p.power === "On";
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async setPowerState(state) {
    try {
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/ambilight/power";
      const req_body = {
        power: state ? "On" : "Off"
      };
      await post(url, JSON.stringify(req_body), this.auth);
      if (state) {
        return this.getCurrent();
      } else {
        this.ambiState = {
          styleName: "OFF" /* OFF */,
          isExpert: false,
          power: false
        };
      }
      return null;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async setVideo(mode) {
    if (mode === "OFF" /* OFF */) {
      return this.setPowerState(false);
    }
    return this.setConfiguration({
      styleName: "FOLLOW_VIDEO" /* FOLLOW_VIDEO */,
      isExpert: false,
      menuSetting: mode
    });
  }
};

// src/philipstv.ts
var validate = {
  mac: /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/,
  // eslint-disable-next-line
  ip: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  pin: /^[0-9]{4}$/
};
var PhilipsTVChannels = class {
  constructor() {
    this.channels = [];
  }
  reloadChannels(listChannels) {
    const channels = JSON.parse(listChannels);
    this.channels = [];
    for (const channel of channels.Channel) {
      this.channels.push({
        ccid: channel.ccid,
        name: channel.name,
        object: channel
      });
    }
  }
  getObjectByName(name) {
    for (const channel of this.channels) {
      if (channel.name === name) {
        return channel.object;
      }
    }
    return {};
  }
  getNameByCcid(ccid) {
    for (const channel of this.channels) {
      if (channel.ccid === ccid) {
        return channel.name;
      }
    }
    return "";
  }
  getObjectByCcid(ccid) {
    for (const channel of this.channels) {
      if (channel.ccid === ccid) {
        return channel.object;
      }
    }
    return {};
  }
};
var PhilipsTV = class {
  constructor(ip, mac, auth, config) {
    this.volumeMin = 0;
    this.volumeMax = 0;
    if (!validate.ip.test(ip)) {
      throw "IP is not an IP Address!";
    }
    this.ip = ip;
    if (mac && !validate.mac.test(mac)) {
      throw "Provided MAC is not an MAC Address!";
    } else if (mac) {
      this.mac = mac;
    }
    this.auth = auth;
    if (config) {
      this.config = config;
    } else {
      this.config = {
        wakeUntilAPIReadyCounter: 100,
        apiVersion: 6,
        broadcastIP: "255.255.255.255",
        wakeOnLanRequests: 1,
        wakeOnLanTimeout: 1e3
      };
    }
    this._baseUrl = "https://" + this.ip + ":1926/" + String(this.config.apiVersion);
    this.tvChannels = new PhilipsTVChannels();
    if (this.auth) {
      this.settings = new SettingsState(this.ip, this.auth, this.config, this.mac);
      this.ambilight = new AmbilightState(this.ip, this.auth, this.config, this.mac);
    }
  }
  async info() {
    const url = this._baseUrl + "/system";
    const result = await get(url);
    const response = JSON.parse(result);
    let t = "";
    if (this.auth) {
    }
    console.log("info", response);
    return response;
  }
  async requestPair() {
    const pair_url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/pair/request";
    const pair_payload = createUniquePairRequestPayload();
    const pair_result = await post(pair_url, JSON.stringify(pair_payload));
    const pair_response = JSON.parse(pair_result);
    this.auth = {
      user: pair_payload.device_id,
      pass: pair_response.auth_key,
      sendImmediately: false
    };
    return pair_response;
  }
  async authorizePair(timestamp, pin) {
    const auth_url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/pair/grant";
    const auth_payload = prepareAuthenticationRequestPayload(
      timestamp,
      pin,
      this.auth.user,
      this.auth.pass
    );
    await post(auth_url, JSON.stringify(auth_payload), this.auth);
    return {
      "apiUser": this.auth.user,
      "apiPass": this.auth.pass
    };
  }
  async pair(pinCallback) {
    const pair_response = await this.requestPair();
    const pin = await pinCallback();
    const auth_response = await this.authorizePair(pair_response.timestamp, pin);
    return auth_response;
  }
  async wakeOnLan() {
    if (this.mac) {
      for (let i = 0; i < this.config.wakeOnLanRequests; i++) {
        import_wake_on_lan.default.wake(this.mac, { address: this.config.broadcastIP }, (error) => {
          if (error) {
            console.log("wakeOnLan: error: " + error);
          }
        });
      }
      return await new Promise((resolve) => setTimeout(resolve, this.config.wakeOnLanTimeout));
    }
  }
  async getPowerState() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/powerstate";
    const result = await get(url, "", this.auth);
    return JSON.parse(result);
  }
  async setPowerState(on) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/powerstate";
    let request_body = { "powerstate": "Standby" };
    if (on) {
      request_body = { "powerstate": "On" };
    }
    await post(url, JSON.stringify(request_body), this.auth);
    return;
  }
  async getSettings() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/menuitems/settings/current";
    const request_body = { "nodes": [{ "nodeid": 2131230774 }] };
    const result = await post(url, JSON.stringify(request_body), this.auth);
    return JSON.parse(result);
  }
  async getApplications() {
  }
  async getCurrentActivity() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/activities/current";
    const result = await get(url, "", this.auth);
    return JSON.parse(result);
  }
  async getCurrentTVChannel() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/activities/tv";
    const result = await get(url, "", this.auth);
    return JSON.parse(result);
  }
  async getFavoriteList(favoriteListId) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/channeldb/tv/favoriteLists/" + String(favoriteListId);
    const result = await get(url, "", this.auth);
    return JSON.parse(result);
  }
  async getTVChannels() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/channeldb/tv/channelLists/all";
    const result = await get(url, "", this.auth);
    return JSON.parse(result);
  }
  async getVolume() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/audio/volume";
    const result = await get(url, "", this.auth);
    const response = JSON.parse(result);
    this.volume = response.current;
    this.volumeMax = response.max;
    this.volumeMin = response.min;
    return response;
  }
  async getVolumePercentage() {
    const result = await this.getVolume();
    return Math.floor(Number(result.current) * (100 / (result.max - result.min)));
  }
  async setVolume(value) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/audio/volume";
    const request_body = { "muted": false, "current": value };
    this.volume = value;
    const result = await post(url, JSON.stringify(request_body), this.auth);
    return JSON.parse(result);
  }
  async setVolumePercentage(percentage) {
    const result = await this.setVolume(Math.floor(Number(percentage) * (this.volumeMax - this.volumeMin) / 100));
    return result;
  }
  async setMute(muted) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/audio/volume";
    const request_body = { "muted": muted, "current": this.volume };
    const result = await post(url, JSON.stringify(request_body), this.auth);
    return JSON.parse(result);
  }
  async sendKey(key) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/input/key";
    const request_body = { "key": key };
    const result = await post(url, JSON.stringify(request_body), this.auth);
    return JSON.parse(result);
  }
  async launchApplication(application) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/activities/launch";
    const result = await post(url, JSON.stringify(application), this.auth);
    return JSON.parse(result);
  }
  async launchTVChannel(application) {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/activities/tv";
    const result = await post(url, JSON.stringify(application), this.auth);
    return JSON.parse(result);
  }
  async turnOn(counter = 0) {
    while (counter < this.config.wakeUntilAPIReadyCounter) {
      counter++;
      if (counter % 10 === 0) {
        console.log("turnOn: try " + counter);
      }
      try {
        await this.setPowerState(true);
        return;
      } catch {
        await this.wakeOnLan();
      }
    }
  }
  async wakeUntilAPIReady(counter = 0) {
    while (counter < this.config.wakeUntilAPIReadyCounter) {
      counter++;
      if (counter % 10 === 0) {
        console.log("wakeUntilAPIReady: try " + counter);
      }
      try {
        const result = await this.getPowerState();
        return result;
      } catch {
        await this.wakeOnLan();
      }
    }
  }
};

// src/settings.ts
var SettingsState = class {
  constructor(ip, auth, config, mac) {
    console.log("SettingsState constructor", auth);
    if (!validate.ip.test(ip)) {
      throw "IP is not an IP Address!";
    }
    this.ip = ip;
    this._baseUrl = "https://" + ip + ":1926/" + String(config.apiVersion);
    if (mac && !validate.mac.test(mac)) {
      throw "Provided MAC is not an MAC Address!";
    } else if (mac) {
      this.mac = mac;
    }
    this.auth = auth;
    this.config = config;
  }
  async getCurrent() {
    try {
      console.debug("SettingsState getCurrent: request started");
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/menuitems/settings/current";
      const request_body = { "nodes": [{ "nodeid": 2131230838 }] };
      const result = await post(url, JSON.stringify(request_body), this.auth);
      const p = await JSON.parse(result);
      console.debug("SettingsState getCurrent: got response", p.values[0].value.data.selected_item);
      return p.values[0].value.data.selected_item;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error(error);
    }
  }
  async setCurrent(value) {
    try {
      const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/menuitems/settings/update";
      const req_body = {
        values: [
          {
            value: {
              Nodeid: 2131230838,
              Controllable: true,
              Available: true,
              data: {
                selected_item: value.toString()
              }
            }
          }
        ]
      };
      console.log("SettingsState setCurrent", req_body, 1);
      return await post(url, JSON.stringify(req_body), this.auth);
    } catch (error) {
      throw new Error(error);
    }
  }
  async writeToFile(data) {
    try {
      import_node_fs.default.writeFileSync("./out.json", data);
      console.log("File written successfully");
    } catch (err) {
      throw new Error(err);
    }
  }
  async getMenuItems() {
    const url = "https://" + this.ip + ":1926/" + String(this.config.apiVersion) + "/menuitems/settings/structure";
    const result = await get(url, "", this.auth);
    const p = await JSON.parse(result);
    await this.writeToFile(p);
    return p;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AmbilightState,
  PhilipsTV,
  SettingsState
});
