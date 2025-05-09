import Icon from "../components/Icon";
import { useState, useEffect } from "react";

export default function SettingsTab({ onSwitchTab }) {
    const [settings, setSettings] = useState({
        nickname: "",
        javaPath: "",
        memory: 4,
    });

    // При монтировании — загрузить настройки
    useEffect(() => {
        window.electronAPI.getSettings().then((cfg) => {
            setSettings(cfg);
        });
    }, []);

    // Универсальный метод обновления и сохранения настроек
    const updateField = async (key, value) => {
        const newCfg = { ...settings, [key]: value };
        setSettings(newCfg);
        await window.electronAPI.setSettings(newCfg);
    };

    // Открыть диалог выбора Java и сохранить путь
    const onSelectJava = async () => {
        const selected = await window.electronAPI.selectJavaPath();
        if (selected) {
            updateField("javaPath", selected);
        }
    };

    return (
        <main className="settings">
            <div className="container settings__container">
                <button
                    className="btn-main"
                    onClick={() => onSwitchTab("main")}
                >
                    Назад
                </button>
                <div className="settings__title">
                    <h1>Настройки</h1>
                </div>
                <div className="settings__content">
                    <div className="settings__param">
                        <h2>Версия Java</h2>
                        <p>Минимальная версия - Java 17</p>
                        <button className="btn-main" id="setJava">
                            <Icon icon={"folder"} />
                            <span>Выбрать файл с Java</span>
                        </button>
                        <p id="javaPath">
                            {settings.javaPath || "Путь не задан"}
                        </p>
                    </div>
                    <div className="settings__param">
                        <h2>Выделяемая оперативная память (ГБ)</h2>
                        <p>
                            Для стабильной игры рекомендуем выделить от 4 до 8
                            ГБ памяти
                        </p>
                        <label className="input-main" id="setRAM" htmlFor="ram">
                            <Icon icon={"gb"} />
                            <input
                                type="text"
                                id="ram"
                                value={settings.memory}
                                onChange={(e) =>
                                    updateField(
                                        "memory",
                                        Number(e.target.value)
                                    )
                                }
                            />
                        </label>
                        <input
                            className="range-main"
                            id="ramRange"
                            type="range"
                            step="1"
                            min="2"
                            max="16"
                            value="4"
                            onChange={(e) => console.log(e.value)}
                        />
                        <div className="settings__range-tooltip">
                            <span>2</span>
                            <span></span>
                            <span>4</span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span>8</span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span>12</span>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span>16</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
