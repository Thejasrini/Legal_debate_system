export function chunkBySections(text) {

    const regex = /Section\s+\d+[A-Z]?(.*?)(?=Section\s+\d+[A-Z]?|$)/gs;

    const chunks = [];

    let match;

    while ((match = regex.exec(text)) !== null) {

        chunks.push(match[0].trim());

    }

    return chunks;

}