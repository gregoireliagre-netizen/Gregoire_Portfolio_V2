document.addEventListener('DOMContentLoaded', () => {

    const chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.style.cssText = 'height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; background: #fff; display: none;';

    const chatInput = document.createElement('input');
    chatInput.id = 'chat-input';
    chatInput.placeholder = 'Pose-moi une question...';
    chatInput.style.cssText = 'width: 70%; padding: 5px;';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Envoyer';
    sendBtn.style.cssText = 'width: 25%; padding: 5px;';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '💬 Chat';
    toggleBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 10px; cursor: pointer;';

    document.body.appendChild(toggleBtn);
    const chatWrapper = document.createElement('div');
    chatWrapper.style.cssText = 'position: fixed; bottom: 60px; right: 20px; width: 300px; background: #eee; padding: 10px;';
    chatWrapper.append(chatBox, chatInput, sendBtn);
    document.body.appendChild(chatWrapper);

    toggleBtn.onclick = () => chatBox.style.display = chatBox.style.display === 'none' ? 'block' : 'none';

    sendBtn.onclick = async() => {
        const text = chatInput.value;
        if (!text) return;
        chatBox.innerHTML += `<div><b>Moi:</b> ${text}</div>`;
        chatInput.value = '';

        try {
            // Note le slash devant /api/groq
            const response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
            });

            if (!response.ok) throw new Error('Erreur API');

            const data = await response.json();
            chatBox.innerHTML += `<div><b>IA:</b> ${data.text}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (err) {
            chatBox.innerHTML += `<div style="color:red;">Erreur: API non trouvée.</div>`;
        }
    };
});