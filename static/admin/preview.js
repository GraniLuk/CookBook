CMS.registerPreviewTemplate('recipes', ({ entry }) => {
    const title = entry.getIn(['data', 'title']);
    const body = entry.getIn(['data', 'body']);
    const tagline = entry.getIn(['data', 'tagline']);
    const author = entry.getIn(['data', 'author']);

    return React.createElement('div', null,
        React.createElement('h1', null, title),
        tagline && React.createElement('p', null, tagline),
        author && React.createElement('p', null, 'Autor: ' + author),
        React.createElement('div', { dangerouslySetInnerHTML: { __html: marked(body || '') } })
    );
});