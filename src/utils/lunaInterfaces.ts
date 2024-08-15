export interface LunaResponse {
    returnValue: boolean;
}

export interface ExecPayload {
    command: string;
}

export interface ExecError {
    killed: boolean,
    code: number,
    signal: number | null,
    cmd: string,
}

export interface ExecResponse extends LunaResponse {
    stdoutString: string;
    stdoutBytes: string;
    stderrString: string;
    stderrBytes: string;
    error?: ExecError;
}

export interface CheckRootPayload {
}

export interface CheckRootResponse extends LunaResponse {
}

export interface SystemInfoPayload {
    keys: string[];
    subscribe?: boolean;
}

export interface SystemInfoResponse extends LunaResponse {
    boardType?: string;
    firmwareVersion?: string;
    modelName?: string;
    sdkVersion?: string;
    UHD?: boolean;
    _3d?: boolean;
}

export interface ToastPayload {
    message: string;
}

export interface ToastResponse extends LunaResponse {
    toastId?: number;
    errorText?: string;
}

export interface ButtonPayload {
    label: string;
    onclick?: string;
    onClick?: string;
    params?: any;
    buttonType?: "ok" | "cancel";
    focus?: boolean;
}

export interface AlertPayload {
    iconUrl?: string;
    title?: string;
    message: string;
    modal?: boolean;
    buttons: ButtonPayload[];
    onclose?: {
        uri?: string;
        params?: any;
    },
    type?: "confirm" | "warning",
    isSysReq?: boolean;
    onfail?: {
        uri?: string;
        params?: any;
    },
}

export interface AlertResponse extends LunaResponse {
    alertId?: string;
    errorText?: string;
    errorCode?: number;
}
