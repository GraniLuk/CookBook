// Print function for recipes
function printRecipe() {
    // Hide non-essential elements for printing
    const elementsToHide = [
        '#printButton',
    '#mediaButtons',
        '.navbar',
        '.footer',
        'hr'
    ];
    
    // Store original display values
    const originalDisplays = [];
    elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            originalDisplays.push({
                element: element,
                display: element.style.display
            });
            element.style.display = 'none';
        });
    });
    
    // Add print class to body for print-specific styling
    document.body.classList.add('printing');
    
    // Trigger print
    window.print();
    
    // Restore original display values after printing
    setTimeout(() => {
        originalDisplays.forEach(item => {
            item.element.style.display = item.display;
        });
        document.body.classList.remove('printing');
    }, 1000);
}
