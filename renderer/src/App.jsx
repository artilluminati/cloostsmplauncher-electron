import { useState, useEffect } from "react";
import "./App.css";
import MainTab from "./Tabs/MainTab";
import SettingsTab from "./Tabs/SettingsTab";
import Icon from "./components/Icon";
import LogsTab from "./Tabs/LogsTab";

const tabsConfig = [
    { id: "main", label: "Cloost SMP Launcher" },
    { id: "settings", label: "Настройки" },
    { id: "logs", label: "Логи" }, // пример новой вкладки
];

function App() {
    const [activeTab, setActiveTab] = useState("main");
    const [showModal, setShowModal] = useState(false);
    const [ram, setRam] = useState(4);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
    };

    const handleRamInputChange = (e) => {
        const value = Number(e.target.value);
        setRam(value);
    };

    const handleRamChange = (value) => {
        const num = Number(value);
        if (!isNaN(num) && num >= 2 && num <= 16) {
            setRam(num);
        }
    };

    const [status, setStatus] = useState({
        phase: "",
        msg: "Ожидание запуска...",
    });

    useEffect(() => {
        console.log("[React] subscribing to run-game-status");
        window.electronAPI.onRunGameStatus((s) => {
            console.log("[React] got status", s);
            setStatus(s);
        });
    }, []);

    const [logs, setLogs] = useState([]);

    useEffect(() => {
        window.electronAPI.onGameLog((entry) => {
            setLogs((prev) => [
                ...prev,
                entry.msg || `Exit code: ${entry.code}`,
            ]);
        });
    }, []);

    return (
        <>
            <header className="header" id="main-header">
                <div className="header__info">
                    <Icon icon={"logo-icon"} />
                    <div className="header__title">
                        {tabsConfig.find((e) => e.id == activeTab).label}
                    </div>
                </div>
                <div className="header__controls">
                    <button
                        className="header__btn header_btn-minimize"
                        id="minimizeWindow"
                        onClick={() => window.electronAPI.minimizeWindow()}
                    >
                        <Icon icon={"minimize-btn"} />
                    </button>
                    <button
                        className="header__btn header_btn-close"
                        id="closeWindow"
                        onClick={() => window.electronAPI.closeWindow()}
                    >
                        <Icon icon={"close-btn"} />
                    </button>
                </div>
            </header>

            {/* Контент вкладок */}
            <div className="tab-content">
                {activeTab === "main" && (
                    <MainTab onSwitchTab={handleTabClick} status={status} />
                )}
                {activeTab === "settings" && (
                    <SettingsTab onSwitchTab={handleTabClick} />
                )}
                {activeTab === "logs" && (
                    <LogsTab onSwitchTab={handleTabClick} logs={logs} />
                )}
            </div>
        </>
    );
}

export default App;
