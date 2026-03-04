import { eventSource, event_types } from "../../../../script.js";

eventSource.on(event_types.APP_READY, () => {

    const waitForSelect = setInterval(() => {

        const selects = document.querySelectorAll("select");

        if (!selects.length) return;

        // Intentar encontrar el selector que tenga muchos temas
        const themeSelect = Array.from(selects).find(s => s.options.length > 5);

        if (!themeSelect) return;

        clearInterval(waitForSelect);

        // Crear buscador
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "🔍 Buscar tema...";
        searchInput.style.width = "100%";
        searchInput.style.marginBottom = "8px";
        searchInput.style.padding = "8px";
        searchInput.style.borderRadius = "10px";
        searchInput.style.background = "#222";
        searchInput.style.color = "white";
        searchInput.style.border = "1px solid #555";

        themeSelect.parentNode.insertBefore(searchInput, themeSelect);

        searchInput.addEventListener("input", () => {

            const value = searchInput.value.toLowerCase();

            Array.from(themeSelect.options).forEach(option => {

                const text = option.text.toLowerCase();
                const match = text.includes(value);

                option.hidden = !match;

            });

        });

        // Cambio automático real
        themeSelect.addEventListener("change", () => {

            themeSelect.dispatchEvent(new Event("input", { bubbles: true }));
            themeSelect.dispatchEvent(new Event("change", { bubbles: true }));

        });

    }, 800);

});
