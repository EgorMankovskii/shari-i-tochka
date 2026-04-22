(function () {
    const replacePrefix = (html, index) => html.replace(/__prefix__/g, String(index));

    const renumberCards = (container, label) => {
        const visibleCards = Array.from(container.querySelectorAll("[data-inline-card]"))
            .filter((card) => !card.classList.contains("is-removed"));

        visibleCards.forEach((card, index) => {
            const title = card.querySelector("[data-inline-title]");
            if (title) {
                title.textContent = `${label} ${index + 1}`;
            }
        });
    };

    const dispatchFormsetAdded = (node) => {
        document.dispatchEvent(new CustomEvent("formset:added", { detail: { form: node } }));
    };

    const initInlineFormsets = () => {
        const addButtons = document.querySelectorAll("[data-inline-add]");

        addButtons.forEach((button) => {
            const formsetName = button.dataset.inlineAdd;
            const container = document.querySelector(`[data-inline-formset="${formsetName}"]`);
            const template = document.querySelector(`#${formsetName}-empty-form-template`);

            if (!container || !template) {
                return;
            }

            const totalInput = document.querySelector(`#id_${container.dataset.inlineTotalId}`);
            const itemLabel = formsetName === "videos" ? "Видео" : "Фото";

            if (!totalInput || button.dataset.inlineReady === "true") {
                return;
            }

            button.dataset.inlineReady = "true";

            button.addEventListener("click", () => {
                const nextIndex = Number(totalInput.value || 0);
                const wrapper = document.createElement("div");
                wrapper.innerHTML = replacePrefix(template.innerHTML.trim(), nextIndex);
                const newCard = wrapper.firstElementChild;

                if (!newCard) {
                    return;
                }

                container.appendChild(newCard);
                totalInput.value = String(nextIndex + 1);
                renumberCards(container, itemLabel);
                dispatchFormsetAdded(newCard);
            });

            container.addEventListener("click", (event) => {
                const removeButton = event.target.closest("[data-inline-remove]");
                if (!removeButton) {
                    return;
                }

                const card = removeButton.closest("[data-inline-card]");
                if (!card) {
                    return;
                }

                const deleteInput = card.querySelector('input[type="checkbox"][name$="-DELETE"]');
                if (deleteInput) {
                    deleteInput.checked = true;
                }

                card.classList.add("is-removed");
                renumberCards(container, itemLabel);
            });

            renumberCards(container, itemLabel);
        });
    };

    const initStatusForms = () => {
        document.querySelectorAll(".js-studio-status-form").forEach((form) => {
            if (form.dataset.statusReady === "true") {
                return;
            }

            form.dataset.statusReady = "true";

            form.addEventListener("submit", () => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete("studio_scroll");
                window.sessionStorage.setItem("studio:return-path", `${currentUrl.pathname}${currentUrl.search}`);
                window.sessionStorage.setItem("studio:return-scroll", String(window.scrollY || window.pageYOffset || 0));

                let scrollInput = form.querySelector('input[name="scroll"]');
                if (!scrollInput) {
                    scrollInput = document.createElement("input");
                    scrollInput.type = "hidden";
                    scrollInput.name = "scroll";
                    form.appendChild(scrollInput);
                }
                scrollInput.value = String(window.scrollY || window.pageYOffset || 0);
            });
        });
    };

    const restoreScrollFromQuery = () => {
        const url = new URL(window.location.href);
        const scrollValue = url.searchParams.get("studio_scroll");
        const storedPath = window.sessionStorage.getItem("studio:return-path");
        const storedScroll = window.sessionStorage.getItem("studio:return-scroll");
        const currentPath = `${url.pathname}${url.search.replace(/([?&])studio_scroll=[^&]*&?/, "$1").replace(/[?&]$/, "")}`;

        if (storedPath && storedScroll && storedPath === currentPath) {
            const storedPosition = Number(storedScroll);
            if (Number.isFinite(storedPosition)) {
                window.requestAnimationFrame(() => {
                    window.scrollTo({ top: storedPosition, behavior: "auto" });
                    window.sessionStorage.removeItem("studio:return-path");
                    window.sessionStorage.removeItem("studio:return-scroll");
                });
            }
        }

        if (!scrollValue) {
            return;
        }

        const nextPosition = Number(scrollValue);
        if (!Number.isFinite(nextPosition)) {
            return;
        }

        window.requestAnimationFrame(() => {
            window.scrollTo({ top: nextPosition, behavior: "auto" });
            url.searchParams.delete("studio_scroll");
            window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        });
    };

    window.addEventListener("load", () => {
        initInlineFormsets();
        initStatusForms();
        restoreScrollFromQuery();
    });
})();
