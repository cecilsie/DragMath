document.addEventListener('DOMContentLoaded', () => {
    const tokens = document.querySelectorAll('.token');
    const dropZones = document.querySelectorAll('.drop-target');
    const mainDropZone = document.getElementById('main-drop-zone');
    const expressionOutput = document.getElementById('expression-output');

    // --- 1. Drag Start Handlers ---
    tokens.forEach(token => {
        token.addEventListener('dragstart', (e) => {
            // Store the HTML content of the dragged token, which we will clone later
            e.dataTransfer.setData('text/html', e.target.outerHTML);
        });
    });

    // --- 2. Drop Target Handlers ---
    // A single function to attach all drop event listeners to a target element
    function attachDropListeners(target) {
        // Drag Over: Allows the drop action
        target.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            // Add visual cue
            target.classList.add('drag-over'); 
        });

        // Drag Leave: Remove visual cue
        target.addEventListener('dragleave', (e) => {
            target.classList.remove('drag-over');
        });

        // Drop: Main logic
        target.addEventListener('drop', (e) => {
            e.preventDefault();
            target.classList.remove('drag-over');

            // Get the HTML of the dragged token
            const draggedTokenHTML = e.dataTransfer.getData('text/html');
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = draggedTokenHTML.trim();
            const newToken = tempDiv.firstChild;

            // Stop tokens already on the canvas from being dragged again (optional)
            newToken.removeAttribute('draggable');
            newToken.style.cursor = 'default'; 

            // --- Replacement Logic ---
            if (target === mainDropZone || target.classList.contains('placeholder-box') || target.classList.contains('drop-target')) {
                
                // If the dropped token is a simple token (number, variable, operator)
                if (newToken.dataset.type === 'number' || newToken.dataset.type === 'operator' || newToken.dataset.type === 'constant') {
                    // Replace the placeholder content with the new token
                    target.innerHTML = '';
                    target.appendChild(newToken);
                    // Remove the drop-target class from the filled token
                    target.classList.remove('drop-target');
                } 
                // If the dropped token is a structural token (fraction, function)
                else if (newToken.dataset.type === 'structure') {
                    // Inject the new structured element's *content* into the target
                    target.innerHTML = newToken.innerHTML;
                    target.classList.remove('drop-target');

                    // Find the newly created placeholders within the structure
                    const newPlaceholders = target.querySelectorAll('.drop-target');
                    
                    // Recursively attach drop listeners to these new placeholders
                    newPlaceholders.forEach(attachDropListeners); 
                }
            }
            
            // Re-render the output after every successful drop
            renderExpression();
        });
    }

    // Attach listeners to all initial drop zones
    dropZones.forEach(attachDropListeners);

    // --- 3. Expression Rendering (The Abstract Syntax Tree Logic) ---
    function renderExpression() {
        // NOTE: In a real app, this function would traverse the DOM/AST 
        // structure to generate a final mathematical string (like LaTeX).
        
        // For this basic example, we will just grab the HTML content
        let currentExpression = mainDropZone.innerHTML;
        
        // Simple cleanup for display
        currentExpression = currentExpression.replace(/<div class="token" data-type="(\w+)" data-value="(\w+)">/g, '')
                                             .replace(/<\/div>/g, '')
                                             .replace(/<span class="(.*?)drop-target">\[\]<\/span>/g, ' [ ] '); // Show remaining placeholders
        
        expressionOutput.innerHTML = currentExpression;

        // In a full implementation, you'd use a library like MathJax 
        // to render the final LaTeX string into beautiful math notation.
    }

});
