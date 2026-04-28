(function () {
    const parseMap = (field) => {
        try {
            return JSON.parse(field.dataset.subcategoryMap || "{}");
        } catch (error) {
            return {};
        }
    };

    const findCategoryField = (subcategoryField) => {
        const form = subcategoryField.closest("form") || document;
        return (
            form.querySelector('[name="category"]') ||
            form.querySelector('[name$="-category"]')
        );
    };

    const renderOptions = (subcategoryField, categoryField) => {
        const subcategoryMap = parseMap(subcategoryField);
        const selectedCategory = categoryField?.value || "";
        const options = subcategoryMap[selectedCategory] || [];
        const previousValue = subcategoryField.value || "";

        subcategoryField.innerHTML = "";
        subcategoryField.add(new Option("Без подкатегории", ""));

        options.forEach((title) => {
            subcategoryField.add(new Option(title, title));
        });

        if (previousValue && !options.includes(previousValue)) {
            subcategoryField.add(new Option(previousValue, previousValue));
        }

        subcategoryField.value = previousValue && Array.from(subcategoryField.options).some((option) => option.value === previousValue)
            ? previousValue
            : "";

        subcategoryField.disabled = options.length === 0;
        subcategoryField.closest(".form-row, .studio-field")?.classList.toggle("is-subcategory-disabled", options.length === 0);
    };

    const initSubcategoryField = (subcategoryField) => {
        if (subcategoryField.dataset.subcategoryReady === "true") {
            return;
        }

        const categoryField = findCategoryField(subcategoryField);
        if (!categoryField) {
            return;
        }

        subcategoryField.dataset.subcategoryReady = "true";
        renderOptions(subcategoryField, categoryField);
        categoryField.addEventListener("change", () => {
            subcategoryField.value = "";
            renderOptions(subcategoryField, categoryField);
        });
    };

    const initAll = () => {
        document.querySelectorAll("[data-subcategory-select]").forEach(initSubcategoryField);
    };

    window.addEventListener("load", initAll);
    document.addEventListener("formset:added", initAll);
})();
