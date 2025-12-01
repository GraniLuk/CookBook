// Preview templates for Decap CMS with visual editing support
// This file registers custom preview templates for your collections

// Helper function to clean invisible Unicode characters from strings (stega encoding)
const cleanString = (str) => {
    if (!str) return str;
    // Remove all invisible Unicode characters that stega encoding adds
    return str.replace(/[\u200B-\u200D\uFEFF]/g, '');
};

// Recipe Preview Component
const RecipePreview = createClass({
    render: function () {
        const entry = this.props.entry;
        const widgetFor = this.props.widgetFor;
        const widgetsFor = this.props.widgetsFor;
        const getAsset = this.props.getAsset;

        // Get field values - use widgetFor for visual editing support
        const title = widgetFor('title');
        const author = widgetFor('author');
        const tagline = widgetFor('tagline');
        const category = entry.getIn(['data', 'categories'], '');
        const subcategory = entry.getIn(['data', 'subcategories'], '');
        const tagsData = entry.getIn(['data', 'tags'], []);
        const ingredientsData = entry.getIn(['data', 'ingredients'], []);
        const servings = entry.getIn(['data', 'servings'], '');
        const prepTime = entry.getIn(['data', 'prep_time'], '');
        const cookTime = entry.getIn(['data', 'cook_time'], '');
        const calories = entry.getIn(['data', 'calories'], '');
        const protein = entry.getIn(['data', 'protein'], '');
        const fat = entry.getIn(['data', 'fat'], '');
        const carbohydrate = entry.getIn(['data', 'carbohydrate'], '');
        const body = widgetFor('body');

        return h('div', { className: 'recipe-preview', style: { padding: '1rem' } },
            // Title at the top - compact header
            h('h1', {
                style: {
                    margin: '0 0 1rem 0',
                    fontSize: '2rem',
                    borderBottom: '2px solid #667eea',
                    paddingBottom: '0.5rem'
                }
            }, title),

            // Meta Section
            h('div', { style: { marginBottom: '2rem' } },
                // Author
                author && h('p', { style: { fontSize: '1.1rem', color: '#666', marginBottom: '1rem' } },
                    h('strong', {}, 'Autor: '), author
                ),

                // Tagline
                tagline && h('p', { style: { fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '2rem' } },
                    tagline
                ),

                // Category - clickable to focus category field
                category && h('div', {
                    style: {
                        marginBottom: '1rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        margin: '-0.5rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                    },
                    onClick: () => {
                        const categoryField = document.querySelector('[data-testid="categories-field"], [id*="categories"]');
                        if (categoryField) categoryField.focus();
                    },
                    onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; },
                    onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                },
                    h('strong', {}, 'Kategoria: '),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            background: '#e3f2fd',
                            padding: '0.25rem 0.75rem',
                            margin: '0.25rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            border: '1px solid #90caf9'
                        }
                    }, category)
                ),

                // Subcategory - clickable to focus subcategory field
                subcategory && h('div', {
                    style: {
                        marginBottom: '2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        margin: '-0.5rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                    },
                    onClick: () => {
                        const subcategoryField = document.querySelector('[data-testid="subcategories-field"], [id*="subcategories"]');
                        if (subcategoryField) subcategoryField.focus();
                    },
                    onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; },
                    onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                },
                    h('strong', {}, 'Podkategoria: '),
                    h('span', {
                        style: {
                            display: 'inline-block',
                            background: '#f3e5f5',
                            padding: '0.25rem 0.75rem',
                            margin: '0.25rem',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            border: '1px solid #ce93d8'
                        }
                    }, subcategory)
                ),

                // Tags - clickable area to focus tags field
                tagsData && tagsData.size > 0 && h('div', {
                    style: {
                        marginBottom: '2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        margin: '-0.5rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                    },
                    onClick: () => {
                        // Focus the tags field when clicking anywhere in this section
                        const tagsField = document.querySelector('[data-testid="tags-field"], [id*="tags"]');
                        if (tagsField) tagsField.focus();
                    },
                    onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#f5f5f5'; },
                    onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                },
                    h('strong', {}, 'Tagi: '),
                    tagsData.map((tag, i) =>
                        h('span', {
                            key: i,
                            style: {
                                display: 'inline-block',
                                background: '#f0f0f0',
                                padding: '0.25rem 0.75rem',
                                margin: '0.25rem',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                            }
                        }, tag)
                    ).toArray()
                ),

                // Ingredients - clickable area to focus ingredients field
                ingredientsData && ingredientsData.size > 0 && h('div', {
                    style: {
                        marginBottom: '2rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        margin: '-0.5rem',
                        borderRadius: '4px',
                        transition: 'background-color 0.2s'
                    },
                    onClick: () => {
                        // Focus the ingredients field when clicking anywhere in this section
                        const ingredientsField = document.querySelector('[data-testid="ingredients-field"], [id*="ingredients"]');
                        if (ingredientsField) ingredientsField.focus();
                    },
                    onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#fff9f0'; },
                    onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                },
                    h('strong', {}, 'Składniki: '),
                    ingredientsData.map((ingredient, i) =>
                        h('span', {
                            key: i,
                            style: {
                                display: 'inline-block',
                                background: '#fff4e6',
                                padding: '0.25rem 0.75rem',
                                margin: '0.25rem',
                                borderRadius: '4px',
                                fontSize: '0.9rem',
                                border: '1px solid #ffe0b2'
                            }
                        }, ingredient)
                    ).toArray()
                ),

                // Stats Grid - each stat clickable to focus its field
                h('div', {
                    className: 'recipe-meta',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: '#f9f9f9',
                        borderRadius: '8px'
                    }
                },
                    servings && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const servingsField = document.querySelector('[data-testid="servings-field"], [id*="servings"]');
                            if (servingsField) servingsField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e8e8e8'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Porcje'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, servings)
                    ),
                    prepTime && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const prepTimeField = document.querySelector('[data-testid="prep_time-field"], [id*="prep_time"]');
                            if (prepTimeField) prepTimeField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e8e8e8'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Przygotowanie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, prepTime + ' min')
                    ),
                    cookTime && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const cookTimeField = document.querySelector('[data-testid="cook_time-field"], [id*="cook_time"]');
                            if (cookTimeField) cookTimeField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e8e8e8'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Gotowanie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, cookTime)
                    )
                ),

                // Macros - each macro clickable to focus its field
                (calories || protein || fat || carbohydrate) && h('div', {
                    className: 'recipe-macros',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: '#e8f5e9',
                        borderRadius: '8px'
                    }
                },
                    calories && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const caloriesField = document.querySelector('[data-testid="calories-field"], [id*="calories"]');
                            if (caloriesField) caloriesField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#c8e6c9'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Kalorie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, calories)
                    ),
                    protein && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const proteinField = document.querySelector('[data-testid="protein-field"], [id*="protein"]');
                            if (proteinField) proteinField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#c8e6c9'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Białko'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, protein + 'g')
                    ),
                    fat && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const fatField = document.querySelector('[data-testid="fat-field"], [id*="fat"]');
                            if (fatField) fatField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#c8e6c9'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Tłuszcz'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, fat + 'g')
                    ),
                    carbohydrate && h('div', {
                        style: { cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' },
                        onClick: () => {
                            const carbohydrateField = document.querySelector('[data-testid="carbohydrate-field"], [id*="carbohydrate"]');
                            if (carbohydrateField) carbohydrateField.focus();
                        },
                        onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#c8e6c9'; },
                        onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = 'transparent'; }
                    },
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Węglowodany'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, carbohydrate + 'g')
                    )
                ),

                // Body Content
                h('div', {
                    className: 'recipe-body',
                    style: {
                        fontSize: '1.1rem',
                        lineHeight: '1.8',
                        marginTop: '2rem'
                    }
                }, body)
            )
        );
    }
});

// Register the preview template
CMS.registerPreviewTemplate('recipes', RecipePreview);

// Optional: Register preview styles
CMS.registerPreviewStyle('/CookBook/css/bulma.min.css');
CMS.registerPreviewStyle('/CookBook/css/custom.css');
