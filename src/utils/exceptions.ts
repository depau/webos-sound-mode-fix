import {ExecResponse} from "./lunaInterfaces";

export class ExecutedProcessError extends Error {
    response: ExecResponse;

    constructor(response: ExecResponse) {
        super(`Called process failed with status code ${response.error!.code}`);
        this.response = response;
    }
}