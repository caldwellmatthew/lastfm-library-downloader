document.addEventListener('DOMContentLoaded', () => {
    const dom = {
        form: document.getElementById('user-form'),
        refreshButton: document.getElementById('refresh-button'),
        results: document.getElementById('results'),
    };

    dom.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        dom.refreshButton.classList.add('hidden');
        dom.results.innerHTML = `
                <p>Loading...</p>
                <p id="progress"></p>
            `;
        dom.progress = document.getElementById('progress');
        
        const ws = new WebSocket(`ws://${location.host}`);
        ws.addEventListener('message', (event) => {
            const { page, totalPages } = JSON.parse(event.data);
            const progress = (page / totalPages * 100).toFixed(2);
            dom.progress.innerText = `Page ${page} / ${totalPages} (${progress}%)`;
        });

        const username = dom.form.username.value;
        const resp = await post('/load', { username });
        dom.results.innerHTML = `
            <h3>${resp.username}'s library</h3>
            <p>${resp.count} scrobbles</p>
            <p>${resp.fromDb ? 'Fetched from' : 'Saved to'} database</p>
            <p>Last updated: ${new Date(resp.timestamp).toLocaleString()}</p>
        `;
        dom.refreshButton.classList.remove('hidden');
        ws.close();
    });

    dom.refreshButton.addEventListener('click', async () => {
        dom.refreshButton.classList.add('hidden');
        dom.results.innerHTML = `
            <p>Loading...</p>
            <p id="progress"></p>
        `;
        dom.progress = document.getElementById('progress');

        const ws = new WebSocket(`ws://${location.host}`);
        ws.addEventListener('message', (event) => {
            const { page, totalPages } = JSON.parse(event.data);
            const progress = (page / totalPages * 100).toFixed(2);
            dom.progress.innerText = `Page ${page} / ${totalPages} (${progress}%)`;
        });

        const username = dom.form.username.value;
        const resp = await post('/refresh', { username });
        dom.results.innerHTML = `
            <h3>${resp.username}'s library</h3>
            <p>${resp.count} scrobbles</p>
            <p>Saved to database</p>
            <p>Last updated: ${new Date(resp.timestamp).toLocaleString()}</p>
        `;
        dom.refreshButton.classList.remove('hidden');
        ws.close();
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
