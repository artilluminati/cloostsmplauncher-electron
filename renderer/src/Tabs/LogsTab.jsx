import { useState, useEffect } from "react";
import Icon from "../components/Icon";
import SyntaxHighlighter from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/hljs";
import hljs from "highlight.js/lib/core";

export default function LogsTab({ onSwitchTab, logs }) {
    const [files, setFiles] = useState([]); // список файлов в папке logs
    const [selected, setSelected] = useState("live"); // текущий выбор
    const [fileLines, setFileLines] = useState([]); // содержимое выбранного файла

    // При монтировании: получаем список лог-файлов
    useEffect(() => {
        window.electronAPI
            .listLogFiles() // должен вернуть Promise<string[]>
            .then((list) => {
                // заранее вставляем опцию latest.log
                const uniq = Array.from(new Set(["latest.log", ...list]));
                setFiles(uniq);
            })
            .catch((err) => console.error("Failed to list log files:", err));
    }, []);

    // При изменении selected: если не live, читаем файл
    useEffect(() => {
        if (selected !== "live") {
            window.electronAPI
                .readLogFile(selected) // должен вернуть Promise<string>
                .then((content) => {
                    // разбиваем на строки
                    const lines = content.split(/\r?\n/);
                    setFileLines(lines);
                })
                .catch((err) => {
                    console.error("Failed to read log file:", err);
                    setFileLines([`Ошибка чтения файла: ${err.message}`]);
                });
        }
    }, [selected]);

    // Выводимые строки: либо live-логи, либо fileLines
    const displayLines = selected === "live" ? logs : fileLines;
    const codeString = displayLines.join("\n");

    hljs.registerLanguage("javaLog", function (hljs) {
        return {
            name: "Log",
            contains: [
                // Временная метка [HH:MM:SS]
                {
                    className: "number",
                    begin: /\[\d{2}:\d{2}:\d{2}\]/,
                    relevance: 0,
                },
                // Уровень логирования [INFO], [ERROR], [DEBUG], [WARN]
                {
                    className: "keyword",
                    begin: /\[(?:INFO|ERROR|DEBUG|WARN)\]/,
                    relevance: 10,
                },
                // Префикс потока [Render thread/INFO]:
                {
                    className: "type",
                    begin: /\[[^\]]+\/(?:INFO|ERROR|DEBUG|WARN)\]/,
                    relevance: 5,
                },
                // Остальная часть строки как сообщение
                {
                    className: "string",
                    begin: /]:\s/,
                    end: /$/,
                    excludeBegin: true,
                },
            ],
        };
    });

    return (
        <main className="logs">
            <div className="container-lg">
                <div className="settings__title">
                    <div className="logs-controls">
                        <button
                            className="btn-main"
                            onClick={() => onSwitchTab("main")}
                        >
                            {/* <Icon icon="arrow-back" /> */}
                            <span>Назад</span>
                        </button>
                        <label>
                            <select
                                value={selected}
                                className="btn-main"
                                onChange={(e) => setSelected(e.target.value)}
                            >
                                <option value="live">Live log</option>
                                {files.map((f) => (
                                    <option key={f} value={f}>
                                        {f}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="logs__content">
                    <SyntaxHighlighter language="scheme" style={okaidia}>
                        {codeString}
                    </SyntaxHighlighter>
                </div>
            </div>
        </main>
    );
}
