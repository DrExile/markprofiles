// Prefix for keys in localStorage
const HIGHLIGHT_STORAGE_PREFIX = 'highlightedProfile_';

// Function to check for the presence of CJK characters
function containsCJK(text) {
    const cjkRegex = /[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/; // CJK character ranges
    return cjkRegex.test(text);
}

// Function to add "Mark" buttons next to profile links
function addButtonsToProfileLinks() {
    const elements = document.querySelectorAll('.profile-link a');

    elements.forEach(element => {
        const text = element.textContent.trim();
        const regex = /^[\w\u0400-\u04FF\u0370-\u03FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]+#[0-9]+$/;

        if (regex.test(text)) {
            if (element.nextElementSibling && element.nextElementSibling.classList.contains('highlight-button')) {
                return;
            }

            const [usernamePart] = text.split('#');
            if (containsCJK(usernamePart)) {
                element.style.border = '2px solid red';
                element.style.padding = '2px';
            }

            const isHighlighted = localStorage.getItem(HIGHLIGHT_STORAGE_PREFIX + text) === 'true';
            if (isHighlighted) {
                element.style.color = 'red';
            }

            const button = document.createElement('button');
            button.textContent = 'Mark';
            button.classList.add('highlight-button');
            button.style.marginLeft = '10px';
            button.style.cursor = 'pointer';
            button.style.color = 'black';
            button.style.backgroundColor = '#f0f0f0';
            button.style.border = '1px solid #ccc';

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                if (element.style.color === 'red') {
                    element.style.color = '';
                    localStorage.removeItem(HIGHLIGHT_STORAGE_PREFIX + text);
                } else {
                    element.style.color = 'red';
                    localStorage.setItem(HIGHLIGHT_STORAGE_PREFIX + text, 'true');
                }
            });

            element.parentNode.appendChild(button);
        }
    });
}

// Function to add an import/export panel with collapsible functionality
function addExportImportButtons() {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.zIndex = '1000';
    container.style.backgroundColor = '#f9f9f9';
    container.style.padding = '10px';
    container.style.border = '1px solid #ccc';
    container.style.borderRadius = '5px';
    container.style.width = '40px';
    container.style.height = '40px';
    container.style.overflow = 'hidden';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.transition = 'width 0.3s, height 0.3s';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '<<';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.border = 'none';
    toggleButton.style.background = 'transparent';
    toggleButton.style.fontSize = '16px';
    toggleButton.style.lineHeight = '40px';
    toggleButton.style.color = '#333';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'none';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.marginTop = '10px';

    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Data';
    exportButton.style.marginBottom = '10px';
    exportButton.style.cursor = 'pointer';
    exportButton.addEventListener('click', exportData);

    const importButton = document.createElement('button');
    importButton.textContent = 'Import Data';
    importButton.style.cursor = 'pointer';
    importButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.addEventListener('change', importData);
        input.click();
    });

    toggleButton.addEventListener('click', () => {
        if (container.style.width === '40px') {
            container.style.width = '200px';
            container.style.height = 'auto';
            buttonContainer.style.display = 'flex';
            toggleButton.textContent = '>>';
        } else {
            container.style.width = '40px';
            container.style.height = '40px';
            buttonContainer.style.display = 'none';
            toggleButton.textContent = '<<';
        }
    });

    buttonContainer.appendChild(exportButton);
    buttonContainer.appendChild(importButton);
    container.appendChild(toggleButton);
    container.appendChild(buttonContainer);
    document.body.appendChild(container);
}

// Function to export data to a JSON file
function exportData() {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith(HIGHLIGHT_STORAGE_PREFIX));
    const data = {};
    allKeys.forEach(key => {
        const originalKey = key.replace(HIGHLIGHT_STORAGE_PREFIX, '');
        data[originalKey] = localStorage.getItem(key);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'highlightedProfiles.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to import data from a JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (Object.keys(data).length === 0) {
                const allKeys = Object.keys(localStorage).filter(key => key.startsWith(HIGHLIGHT_STORAGE_PREFIX));
                allKeys.forEach(key => localStorage.removeItem(key));
                alert('Storage has been cleared because the imported JSON was empty.');
                return;
            }

            Object.keys(data).forEach(key => {
                localStorage.setItem(HIGHLIGHT_STORAGE_PREFIX + key, data[key]);
            });

            alert('Data successfully imported! Please reload the page.');
        } catch (error) {
            alert('Error importing data. Make sure the file is valid.');
        }
    };
    reader.readAsText(file);
}

// Run functions on page load
addButtonsToProfileLinks();
addExportImportButtons();

// Watch for dynamic changes to the page
const observer = new MutationObserver(addButtonsToProfileLinks);
observer.observe(document.body, { childList: true, subtree: true });
