document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = form.username.value;
        const resp = await post('/load', { username });

        const results = document.getElementById('results');
        results.innerHTML = '';
        results.innerHTML = `
            <h3>${resp.username}'s library</h3>
            <p>${resp.count} scrobbles</p>
            <p>${resp.fromDb ? 'Fetched from' : 'Saved to'} database</p>
            <p>Last updated: ${new Date(resp.timestamp).toLocaleString()}</p>
        `;
    });
});

async function post(url, body) {
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const data = await resp.json();
    return data;
}
