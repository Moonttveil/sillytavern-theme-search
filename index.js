import { eventSource, event_types } from "../../../../script.js";

eventSource.on(event_types.APP_READY, () => {

    const wait = setInterval(() => {

        const themeSelect = document.querySelector("#themes");

        if (!themeSelect) return;

        clearInterval(wait);

        // Evitar duplicados
        if (document.getElementById("theme-search-bar")) return;

        // Crear input
        const input = document.createElement("input");
        input.id = "theme-search-bar";
        input.type = "text";
        input.placeholder = "🔍 Buscar tema...";
        
        input.style.width = "100%";
        input.style.marginBottom = "6px";
        input.style.padding = "6px";
        input.style.borderRadius = "8px";
        input.style.background = "#222";
        input.style.color = "white";
        input.style.border = "1px solid #555";

        // Insertar justo arriba del selector
        themeSelect.parentNode.insertBefore(input, themeSelect);

        // Filtrar opciones
        input.addEventListener("input", () => {

            const value = input.value.toLowerCase();

            Array.from(themeSelect.options).forEach(option => {

                const text = option.text.toLowerCase();
                option.hidden = !text.includes(value);

            });

        });

        // Selección automática
        input.addEventListener("keydown", (e) => {

            if (e.key === "Enter") {

                const visible = Array.from(themeSelect.options)
                    .find(opt => !opt.hidden);

                if (visible) {
                    themeSelect.value = visible.value;
                    themeSelect.dispatchEvent(new Event("change", { bubbles: true }));
                }
            }

        });

    }, 500);

});
