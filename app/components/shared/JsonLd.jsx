// Structured data has to be in the HTML the crawler receives, so this renders
// as a plain script tag from a server component. JSON.stringify output is
// escaped to keep a product name containing "</script>" from breaking out.
export default function JsonLd({ data }) {
    if (!data) return null;

    const payload = JSON.stringify(Array.isArray(data) ? data : [data]).replace(/</g, '\\u003c');

    return (
        <script
            type="application/ld+json"
            // Structured data is generated server-side from our own API, not user input.
            dangerouslySetInnerHTML={{ __html: payload }}
        />
    );
}
