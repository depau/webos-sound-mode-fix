import {exec, isSimulator} from "./luna";

export type SoundMode = "aiSoundPlus" | "standard" | "movie" | "news" | "sports" | "music" | "game";

export interface SoundSettings {
    enabled: boolean;
    soundMode: SoundMode;
    showPopups: boolean;
}

const soundSettings: SoundSettings = {
    enabled: true,
    soundMode: "music",
    showPopups: true,
};

const APP_DIR = "/media/developer/apps/usr/palm/applications/eu.depau.webos.soundmodefix";
const ASSETS_DIR = `${APP_DIR}/assets`;
const SOUNDMODE_CTL = `${ASSETS_DIR}/soundmodectl.sh`;

export async function ensureInstalled(): Promise<void> {
    if (await isSimulator()) {
        console.log("Running in simulator, skipping installation");
        return;
    }
    await exec(`${ASSETS_DIR}/install.sh`);
}

export async function getCurrentSoundSettings(): Promise<SoundSettings> {
    if (await isSimulator()) {
        console.log("Returning fake sound settings", soundSettings);
        return soundSettings;
    }
    const value = await exec(`${SOUNDMODE_CTL} get`);
    const [enabled, soundMode] = value.stdoutString.trim().split(",");

    const result = await exec(`ls ${APP_DIR}/noPopups`, false);
    const showPopups = result.error?.code !== 0;

    return {
        enabled: enabled === "enabled",
        soundMode: soundMode as SoundMode,
        showPopups,
    };
}

export async function updateSoundSettings(settings: SoundSettings): Promise<void> {
    if (await isSimulator()) {
        soundSettings.enabled = settings.enabled;
        soundSettings.soundMode = settings.soundMode;
        soundSettings.showPopups = settings.showPopups;
        console.log("Updated simulated sound settings", soundSettings);
        return;
    }
    if (!settings.enabled) {
        await exec(`${SOUNDMODE_CTL} disable`);
    } else {
        await exec(`${SOUNDMODE_CTL} set ${settings.soundMode}`);
    }

    if (settings.showPopups) {
        await exec(`rm -f ${APP_DIR}/noPopups`);
    } else {
        await exec(`touch ${APP_DIR}/noPopups`);
    }
}

