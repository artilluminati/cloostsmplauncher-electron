window.addEventListener("DOMContentLoaded", () => {
    console.log("dom loaded");

    document.getElementById("settings").classList.add("hidden"); // Скрыть настройки по умолчанию

    const closeWindowBtn = document.querySelector("#closeWindow");
    const minimizeWindowBtn = document.querySelector("#minimizeWindow");

    closeWindowBtn.addEventListener("click", (e) => {
        window.electronAPI.closeWindow();
    });
    minimizeWindowBtn.addEventListener("click", (e) => {
        window.electronAPI.minimizeWindow();
    });

    const ramInput = document.getElementById("ram");
    const ramRange = document.getElementById("ramRange");

    // Обработчик изменения значения ползунка
    ramRange.addEventListener("input", function () {
        {
            ramInput.value = ramRange.value; // Обновление текстового поля в соответствии с значением ползунка
        }
    });
    ramInput.addEventListener("input", function () {
        {
            ramRange.value = ramInput.value; // Обновление текстового поля в соответствии с значением ползунка
        }
    });

    document
        .getElementById("settingsButton")
        .addEventListener("click", openSettings);
    document
        .getElementById("closeSettings")
        .addEventListener("click", closeSettings);
    //document.getElementById('close').addEventListener('click', () => window.close());
    //document.getElementById('minimize').addEventListener('click', () => {{
    // Minimize window logic if needed
    //}});
});

function openSettings() {
    document.getElementById("main-header").classList.add("hidden");
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("settings").classList.remove("hidden");
}

function closeSettings() {
    document.getElementById("main-header").classList.remove("hidden");
    document.getElementById("mainContent").classList.remove("hidden");
    document.getElementById("settings").classList.add("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function openModal() {
    document.getElementById("modal").classList.remove("hidden");
}
