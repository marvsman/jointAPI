declare enum AmbilightStyles {
    FOLLOW_VIDEO = "FOLLOW_VIDEO",
    FOLLOW_AUDIO = "FOLLOW_AUDIO",
    FOLLOW_COLOR = "FOLLOW_COLOR",
    OFF = "OFF"
}
declare enum AmbilightColorMenuSetting {
    HOT_LAVA = "HOT_LAVA",
    DEEP_WATER = "DEEP_WATER",
    FRESH_NATURE = "FRESH_NATURE",
    ISF = "ISF",
    PTA_LOUNGE = "PTA_LOUNGE"
}
declare enum AmbilightVideoMenuSetting {
    STANDARD = "STANDARD",
    NATURAL = "NATURAL",
    IMMERSIVE = "IMMERSIVE",
    VIVID = "VIVID",
    GAME = "GAME",
    COMFORT = "COMFORT",
    RELAX = "RELAX",
    OFF = "OFF"
}
declare enum AmbilightAudioMenuSetting {
}
type AmbilightConfiguration = {
    styleName: AmbilightStyles;
    isExpert: boolean;
    menuSetting?: AmbilightVideoMenuSetting | AmbilightColorMenuSetting | AmbilightAudioMenuSetting;
    stringValue?: string;
};
declare class AmbilightState {
    private mac?;
    private auth;
    private config;
    private _baseUrl;
    private ip;
    ambiState: AmbilightConfiguration & {
        power: boolean;
        brightness?: number;
    } | null;
    constructor(ip: string, auth: Authentication, config: PhilipsTVConfig, mac?: string);
    getCurrent(): Promise<AmbilightConfiguration | null>;
    setConfiguration(config: AmbilightConfiguration): Promise<any>;
    getBrightness(): Promise<number | null>;
    getPowerState(): Promise<boolean | null>;
    setPowerState(state: boolean): Promise<any>;
    setVideo(mode: AmbilightVideoMenuSetting): Promise<any>;
}

interface PhilipsTVConfig {
    apiVersion: number;
    wakeUntilAPIReadyCounter: number;
    broadcastIP: string;
    wakeOnLanRequests: number;
    wakeOnLanTimeout: number;
}
interface Authentication {
    user: string;
    pass: string;
    sendImmediately: boolean;
}
declare class PhilipsTVChannels {
    channels: Channel[];
    reloadChannels(listChannels: string): void;
    getObjectByName(name: string): Record<string, string>;
    getNameByCcid(ccid: string): string;
    getObjectByCcid(ccid: string): Record<string, string>;
}
declare class PhilipsTV {
    private ip;
    private mac?;
    private auth?;
    private config;
    private volume?;
    private volumeMin;
    private volumeMax;
    tvChannels: PhilipsTVChannels;
    private _baseUrl;
    settings: SettingsState | undefined;
    ambilight: AmbilightState | undefined;
    constructor(ip: string, mac?: string, auth?: Authentication, config?: PhilipsTVConfig);
    info(): Promise<Record<string, unknown>>;
    requestPair(): Promise<Record<string, unknown>>;
    authorizePair(timestamp: string, pin: string): Promise<Record<string, unknown>>;
    pair(pinCallback: () => Promise<string>): Promise<Record<string, unknown>>;
    wakeOnLan(): Promise<unknown>;
    getPowerState(): Promise<any>;
    setPowerState(on: boolean): Promise<void>;
    getSettings(): Promise<any>;
    getApplications(): Promise<void>;
    getCurrentActivity(): Promise<any>;
    getCurrentTVChannel(): Promise<any>;
    getFavoriteList(favoriteListId: number): Promise<any>;
    getTVChannels(): Promise<any>;
    getVolume(): Promise<any>;
    getVolumePercentage(): Promise<number>;
    setVolume(value: number): Promise<any>;
    setVolumePercentage(percentage: number): Promise<any>;
    setMute(muted: boolean): Promise<any>;
    sendKey(key: string): Promise<any>;
    launchApplication(application: Record<string, string>): Promise<any>;
    launchTVChannel(application: Record<string, string>): Promise<any>;
    turnOn(counter?: number): Promise<void>;
    wakeUntilAPIReady(counter?: number): Promise<any>;
}
interface Channel {
    ccid: string;
    name: string;
    object: Record<string, string>;
}

declare class SettingsState {
    private mac?;
    private auth;
    private config;
    private _baseUrl;
    private ip;
    constructor(ip: string, auth: Authentication, config: PhilipsTVConfig, mac?: string);
    getCurrent(): Promise<number | null>;
    setCurrent(value: number): Promise<any>;
    writeToFile(data: any): Promise<void>;
    getMenuItems(): Promise<Record<string, unknown>>;
}

export { AmbilightState, type Authentication, PhilipsTV, type PhilipsTVConfig, SettingsState };
