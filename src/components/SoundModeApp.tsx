import React, {useEffect, useState} from "react";

import Button from "@enact/sandstone/Button";
import SwitchItem from "@enact/sandstone/SwitchItem";
import Spinner from "@enact/sandstone/Spinner";
import Scroller from "@enact/sandstone/Scroller";
import {Header, Panel} from "@enact/sandstone/Panels";
import {checkRoot, createAlert} from "../utils/luna";
import {ensureInstalled, getCurrentSoundSettings, SoundMode, updateSoundSettings} from "../utils/soundMode";
import Dropdown from "@enact/sandstone/Dropdown";
import {Cell, Row} from "@enact/ui/Layout";
import {ExecutedProcessError} from "../utils/exceptions";


const nameToSoundMode: { [key: string]: SoundMode } = {
    "AI Sound Pro": "aiSoundPlus",
    "Standard": "standard",
    "Movie": "movie",
    "Clear Voice Pro": "news",
    "Sports": "sports",
    "Music": "music",
    "Game Optimizer": "game",
};

const soundModeToName: { [key: string]: string } = {
    "aiSoundPlus": "AI Sound Pro",
    "standard": "Standard",
    "movie": "Movie",
    "news": "Clear Voice Pro",
    "sports": "Sports",
    "music": "Music",
    "game": "Game Optimizer",
};

const SoundModeApp: React.FC = () => {
    const [enabled, setEnabled] = useState<boolean>(true);
    const [soundMode, setSoundMode] = useState<SoundMode>("music");
    const [showPopups, setShowPopups] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [rooted, setRooted] = useState<boolean>(false);

    const handleError = async (e: Error) => {
        let title: string;
        let message: string;
        if (e instanceof ExecutedProcessError) {
            title = "Failed to run root command";
            message = `${e.response.stdoutString}${e.response.stderrString}`;
        } else {
            title = "An error occurred";
            message = e.message || "Unknown error";
        }

        await createAlert({
            title,
            message,
            type: "warning",
            modal: true,
            buttons: [
                {label: "OK", buttonType: "cancel", focus: true}
            ],
            onclose: {
                uri: "luna://com.webos.service.applicationmanager/close",
                params: {}
            }
        });
    }

    useEffect(() => {
        (async () => {
            try {
                const isRooted = await checkRoot();
                setRooted(isRooted);

                if (isRooted) {
                    await ensureInstalled();
                    const data = await getCurrentSoundSettings();
                    setEnabled(data.enabled);
                    setSoundMode(data.soundMode);
                    setShowPopups(data.showPopups);
                }
            } catch (e) {
                await handleError(e);
            } finally {
                setLoading(false);
            }

        })().then();
    }, []);

    const handleEnabledChange = () => {
        if (!loading) {
            setEnabled(!enabled);
        }
    };

    const handleShowPopupsChange = () => {
        if (!loading) {
            setShowPopups(!showPopups);
        }
    }

    const handleSoundModeChange = (mode: SoundMode) => {
        if (!loading) {
            setSoundMode(mode);
        }
    };

    const saveSettings = async () => {
        if (!loading) {
            try {
                setLoading(true);
                await updateSoundSettings({enabled, soundMode, showPopups});
            } catch (e) {
                await handleError(e);
            } finally {
                setLoading(false);
            }
        }
    };

    const closeApp = async () => {
        window.close();
    }

    return (<Panel>
        <Header title="Sound Mode Fix Settings" onClose={closeApp}/>
        {loading ? (<>
            <Spinner centered component="div">Loading...</Spinner>
        </>) : rooted ? (<Scroller>
            <div style={{paddingBottom: "100px"}}>
                <br/>
                <SwitchItem selected={enabled} onToggle={handleEnabledChange} disabled={loading}>
                    Force sound mode
                </SwitchItem>
                <SwitchItem selected={showPopups} onToggle={handleShowPopupsChange} disabled={loading || !enabled}>
                    Display a notification when the sound mode is changed
                </SwitchItem>
                <br/>
                {/* @ts-ignore */}
                <Row align="center space-between">
                    <Cell component="div" align="end" shrink>
                        <Dropdown title="Forced sound mode"
                                  disabled={!enabled}
                                  selected={Object.keys(soundModeToName).indexOf(soundMode)}
                                  onSelect={(e) => handleSoundModeChange(Object.values(nameToSoundMode)[e.selected])}
                                  size="large" width="large">
                            {Object.keys(nameToSoundMode)}
                        </Dropdown>
                    </Cell>
                    <Cell component="div" align="end" shrink>
                        <Button onClick={saveSettings} disabled={loading}>
                            Save Settings
                        </Button>
                    </Cell>
                </Row>
            </div>
        </Scroller>) : <div>Root access is required to change sound settings</div>}
    </Panel>);
};

export default SoundModeApp;
