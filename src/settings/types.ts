type ResponseValueType<T> = {
    Nodeid: number;
    Controllable: boolean;
    Available: boolean;
    string_id?: string;
    data: T;
};
type EnumValue = {
    enum_id: number;
    controllable: boolean;
    available: boolean;
    string_id: string;
    icon?: string;
};

export type PictureSettingsData = {
    selected_item: number;
    items: EnumValue[];
};
export type ReturnSettingsType<T> = {
    values: {
        value: ResponseValueType<T>;
    }[];
    version: number;
};
export type ResponseSettingsType<T> = {
    values: {
        value: ResponseValueType<T>;
    }[];
};