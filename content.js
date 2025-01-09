// Prefix for keys in localStorage
const HIGHLIGHT_STORAGE_PREFIX = 'highlightedProfile_';

// Function to check for CJK characters (excluding Japanese)
function containsCJK(text) {
    const cjkRegex = /[\u4E00-\u9FFF\uAC00-\uD7AF]/;
    return cjkRegex.test(text);
}

// Function to update the color and counter display of an element
function updateElementAndCounter(element, counterDisplay, counter) {
    if (counter > 0) {
        element.style.color = 'green';
        counterDisplay.style.color = 'green';
        counterDisplay.textContent = `+${counter}`; // Add "+" for positive numbers
    } else if (counter < 0) {
        element.style.color = 'red';
        counterDisplay.style.color = 'red';
        counterDisplay.textContent = `${counter}`; // Negative numbers already include "-"
    } else {
        element.style.color = ''; // Neutral (no color)
        counterDisplay.style.color = ''; // Neutral (default color)
        counterDisplay.textContent = ''; // Hide counter for zero
    }
}

// Function to add upvote and downvote buttons with voting logic
function addButtonsToProfileLinks() {
    const elements = document.querySelectorAll('.profile-link a');

    elements.forEach(element => {
        const text = element.textContent.trim();
        const regex = /^[\p{L}\u0400-\u04FF\u0370-\u03FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F\u0900-\u097F\s-]+#[0-9]+$/u;

        if (regex.test(text)) {
            if (element.nextElementSibling && element.nextElementSibling.classList.contains('vote-buttons')) {
                return;
            }

            // Check for CJK characters in the first part of the text (before the #)
            const [usernamePart] = text.split('#');
            if (containsCJK(usernamePart)) {
                element.style.border = '2px solid red'; // Add red border
                element.style.padding = '2px'; // Add padding for better visibility
            }

            // Get the current value from localStorage
            let counter = parseInt(localStorage.getItem(HIGHLIGHT_STORAGE_PREFIX + text)) || 0;

            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('vote-buttons');
            buttonsContainer.style.display = 'inline-flex';
            buttonsContainer.style.alignItems = 'center';
            buttonsContainer.style.marginLeft = '10px';

            // Create upvote button
            const upvoteButton = document.createElement('button');
            upvoteButton.textContent = '▲'; // Thumbs-up icon
            upvoteButton.style.cursor = 'pointer';
            upvoteButton.style.border = '1px solid #ccc';
            upvoteButton.style.backgroundColor = '#f0f0f0';
            upvoteButton.style.marginRight = '5px';
            upvoteButton.style.color = 'black';

            // Create counter display
            const counterDisplay = document.createElement('span');
            counterDisplay.style.margin = '0 5px';
            counterDisplay.style.fontWeight = 'bold';

            // Create downvote button
            const downvoteButton = document.createElement('button');
            downvoteButton.textContent = '▼'; // Thumbs-down icon
            downvoteButton.style.cursor = 'pointer';
            downvoteButton.style.border = '1px solid #ccc';
            downvoteButton.style.backgroundColor = '#f0f0f0';
            downvoteButton.style.color = 'black';

            // Apply initial colors and counter
            updateElementAndCounter(element, counterDisplay, counter);

            // Upvote logic
            upvoteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                counter += 1;

                if (counter === 0) {
                    localStorage.removeItem(HIGHLIGHT_STORAGE_PREFIX + text);
                } else {
                    localStorage.setItem(HIGHLIGHT_STORAGE_PREFIX + text, counter);
                }

                // Update colors and counter display
                updateElementAndCounter(element, counterDisplay, counter);
            });

            // Downvote logic
            downvoteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                counter -= 1;

                if (counter === 0) {
                    localStorage.removeItem(HIGHLIGHT_STORAGE_PREFIX + text);
                } else {
                    localStorage.setItem(HIGHLIGHT_STORAGE_PREFIX + text, counter);
                }

                // Update colors and counter display
                updateElementAndCounter(element, counterDisplay, counter);
            });

            // Append buttons and counter to the container
            buttonsContainer.appendChild(upvoteButton);
            buttonsContainer.appendChild(counterDisplay);
            buttonsContainer.appendChild(downvoteButton);

            // Add the container next to the element
            element.parentNode.appendChild(buttonsContainer);
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

// Export and Import logic
function exportData() {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith(HIGHLIGHT_STORAGE_PREFIX));
    const data = {};
    allKeys.forEach(key => {
        const originalKey = key.replace(HIGHLIGHT_STORAGE_PREFIX, '');
        data[originalKey] = parseInt(localStorage.getItem(key));
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'highlightedProfiles.json';
    a.click();
    URL.revokeObjectURL(url);
}

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
                alert('Storage cleared as the imported JSON was empty.');
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

// Observe dynamic changes to the page
const observer = new MutationObserver(addButtonsToProfileLinks);
observer.observe(document.body, { childList: true, subtree: true });
