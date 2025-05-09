import Icon from "../components/Icon";
import { useState, useEffect } from "react";

export default function MainTab({ onSwitchTab, status }) {
    const [settings, setSettings] = useState({
        nickname: "",
        javaPath: "",
        memory: 4,
    });

    // При монтировании подгружаем настройки
    useEffect(() => {
        window.electronAPI.getSettings().then((cfg) => {
            setSettings(cfg);
        });
    }, []);

    // Сохранить изменение одного поля
    const updateField = (key, value) => {
        const newCfg = { ...settings, [key]: value };
        setSettings(newCfg);
        window.electronAPI.setSettings(newCfg);
    };

    return (
        <main
            className="main"
            id="mainContent"
            style={{
                backgroundImage: `url("/images/banner%20bg%20shader.png")`,
            }}
        >
            <div className="main__overlay"></div>
            <div className="container main__container">
                <div className="main__title">
                    <div className="main__logo">
                        <Icon icon={"logo"} />
                        <h1>Cloost SMP</h1>
                    </div>
                    <div className="main__status">
                        <p id="status">{status.msg}</p>
                    </div>
                </div>
                <div className="main__buttons">
                    <div className="main__buttons-settings">
                        <label
                            className="main__nickname input-main"
                            htmlFor="nickname_input"
                        >
                            <Icon icon={"account"} />
                            <input
                                type="text"
                                id="nickname_input"
                                placeholder="Введите никнейм"
                                defaultValue={settings.nickname}
                                onChange={(e) =>
                                    updateField("nickname", e.target.value)
                                }
                            />
                        </label>
                        <button
                            className="btn-main"
                            id="settingsButton"
                            onClick={() => onSwitchTab("settings")}
                        >
                            <Icon icon={"settings"} />
                            <span>Настройки</span>
                        </button>
                        <button
                            className="btn-main"
                            id="logsButton"
                            onClick={() => onSwitchTab("logs")}
                        >
                            <Icon icon={"text-snippet"} />
                            <span>Логи</span>
                        </button>
                    </div>
                    <button
                        id="play"
                        className="btn-blue"
                        onClick={() => window.electronAPI.runGame()}
                    >
                        <Icon icon={"play"} />
                        <span>Играть</span>
                    </button>
                </div>
                <div id="response-container"></div>
            </div>
        </main>
    );
}
