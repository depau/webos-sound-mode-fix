import LS2Request from "@enact/webos/LS2Request";
import {
    AlertPayload,
    AlertResponse,
    CheckRootPayload,
    CheckRootResponse,
    ExecPayload,
    ExecResponse,
    SystemInfoPayload,
    SystemInfoResponse
} from "./lunaInterfaces";
import {ExecutedProcessError} from "./exceptions";


export function lunaSend<PayloadType, ResponseType>(url: string, method: string, params: PayloadType, throwOnError: boolean = true): Promise<ResponseType> {
    return new Promise((resolve: (value: ResponseType) => void, reject: (reason: any) => void) => {
        try {
            new LS2Request().send({
                service: url,
                method: method,
                parameters: params,
                onSuccess: (res: ResponseType) => {
                    resolve(res);
                },
                onFailure: (res: ResponseType) => {
                    console.error(`Failed to send request to Luna service ${url}/${method}`, res);
                    if (throwOnError) {
                        reject(res);
                    } else {
                        resolve(res);
                    }
                },
            });
        } catch (err) {
            console.error(`Failed to send request to Luna service ${url}/${method}`, err);
            reject(err);
        }
    });
}

async function getModelName(): Promise<string> {
    return (await lunaSend<SystemInfoPayload, SystemInfoResponse>(
        "luna://com.webos.service.tv.systemproperty",
        "getSystemInfo",
        {keys: ["modelName"],})).modelName;
}

let _isSimulator: boolean | undefined = undefined;

export async function isSimulator(): Promise<boolean> {
    if (_isSimulator === undefined) {
        _isSimulator = (await getModelName()).endsWith("_SIMULATOR");
    }
    return _isSimulator;
}

export async function exec(command: string, throwOnError: boolean = true): Promise<ExecResponse> {
    const response = await lunaSend<ExecPayload, ExecResponse>("luna://org.webosbrew.hbchannel.service", "exec", {
        command: command,
    }, false);
    if (response.error && throwOnError) {
        throw new ExecutedProcessError(response);
    } else if (!response.returnValue && throwOnError) {
        throw new Error(`Failed to execute command: ${response.stderrString}`);
    }
    return response;
}

export async function checkRoot(): Promise<boolean> {
    if (await isSimulator()) {
        console.log("Running in simulator, pretending rooted");
        return true;
    }
    try {
        const result: CheckRootResponse = await lunaSend<CheckRootPayload, CheckRootResponse>(
            "luna://org.webosbrew.hbchannel.service",
            "checkRoot",
            {}
        );
        return result.returnValue;
    } catch (err) {
        console.error("Failed to check root:", err);
        return false;
    }
}

export async function createAlert(payload: AlertPayload): Promise<AlertResponse> {
    // return lunaSend<AlertPayload, AlertResponse>("luna://com.webos.notification", "createAlert", payload);
    console.assert(payload.message, "Message is required");
    console.assert(payload.buttons && payload.buttons.length > 0, "At least one button is required");
    const payloadString = JSON.stringify(payload).replace(/'/g, "\\'");
    const cmd = `luna-send -n 1 -f luna://com.webos.notification/createAlert '${payloadString}'`;
    const res = await exec(cmd);
    const alertResponse: AlertResponse = JSON.parse(res.stdoutString);
    if (!alertResponse.returnValue) {
        throw new Error(`Failed to create alert: ${alertResponse.errorText}`);
    }
    return alertResponse;
}

// Place utilities into the window object for debugging
const extWindow = window as typeof window & {
    lunaSend: any,
    createAlert: any,
    exec: any,
    checkRoot: any,
    isSimulator: any
};
extWindow.lunaSend = lunaSend;
extWindow.createAlert = createAlert;
extWindow.exec = exec;
extWindow.checkRoot = checkRoot;
extWindow.isSimulator = isSimulator;

