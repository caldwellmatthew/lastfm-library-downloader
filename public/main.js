document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = form.username.value;
        const resp = await post('/load', { username });
        console.log(resp);
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
