CMS.registerPreviewTemplate('recipes', ({ entry }) => {
    const title = entry.getIn(['data', 'title']);
    const body = entry.getIn(['data', 'body']);
    const tagline = entry.getIn(['data', 'tagline']);
    const author = entry.getIn(['data', 'author']);

    return (
        <div>
            <h1>{title}</h1>
            {tagline && <p>{tagline}</p>}
            {author && <p>Autor: {author}</p>}
            <div dangerouslySetInnerHTML={{ __html: marked(body || '') }} />
        </div>
    );
});