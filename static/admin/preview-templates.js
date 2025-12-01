// Preview templates for Decap CMS with visual editing support
// This file registers custom preview templates for your collections

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
        const recipeImage = entry.getIn(['data', 'recipe_image'], '');
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

        // Get image URL
        const imageUrl = recipeImage ? getAsset(recipeImage).toString() : '';

        return h('div', { className: 'recipe-preview' },
            // Hero Section
            h('div', { className: 'recipe-hero', style: { position: 'relative', height: '400px', overflow: 'hidden' } },
                imageUrl && h('img', {
                    src: imageUrl,
                    alt: entry.getIn(['data', 'title'], ''),
                    style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        aspectRatio: '1/1'
                    }
                }),
                h('div', {
                    className: 'recipe-hero__gradient',
                    style: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        padding: '2rem'
                    }
                },
                    h('h1', {
                        className: 'recipe-hero__title',
                        style: { color: 'white', margin: 0, fontSize: '2.5rem' }
                    }, title)
                )
            ),

            // Meta Section
            h('div', { className: 'recipe-content', style: { maxWidth: '800px', margin: '0 auto', padding: '2rem' } },
                // Author
                author && h('p', { style: { fontSize: '1.1rem', color: '#666', marginBottom: '1rem' } },
                    h('strong', {}, 'Autor: '), author
                ),

                // Tagline
                tagline && h('p', { style: { fontSize: '1.2rem', fontStyle: 'italic', marginBottom: '2rem' } },
                    tagline
                ),

                // Tags
                tagsData && tagsData.size > 0 && h('div', { style: { marginBottom: '2rem' } },
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
                        }, widgetFor('tags.' + i))
                    ).toArray()
                ),

                // Ingredients
                ingredientsData && ingredientsData.size > 0 && h('div', { style: { marginBottom: '2rem' } },
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
                        }, widgetFor('ingredients.' + i))
                    ).toArray()
                ),

                // Stats Grid
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
                    servings && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Porcje'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, servings)
                    ),
                    prepTime && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Przygotowanie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, prepTime + ' min')
                    ),
                    cookTime && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#666' } }, 'Gotowanie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold' } }, cookTime)
                    )
                ),

                // Macros
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
                    calories && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Kalorie'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, calories)
                    ),
                    protein && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Białko'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, protein + 'g')
                    ),
                    fat && h('div', {},
                        h('div', { style: { fontWeight: 'bold', fontSize: '0.9rem', color: '#2e7d32' } }, 'Tłuszcz'),
                        h('div', { style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#1b5e20' } }, fat + 'g')
                    ),
                    carbohydrate && h('div', {},
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
