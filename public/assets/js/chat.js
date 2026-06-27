document.addEventListener('DOMContentLoaded', () => {
    // État global de la conversation
    let conversationHistory = [];

    // Création du conteneur principal
    const chatWidget = document.createElement('div');
    chatWidget.id = 'chat-widget';
    chatWidget.innerHTML = `
        <div id="chat-toggle-btn" class="chat-toggle-btn" aria-label="Ouvrir le chat IA">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </div>
        <div id="chat-window" class="chat-window" style="display: none;">
            <div class="chat-header">
                <h3>Assistant IA Grégoire</h3>
                <button id="chat-close-btn" class="chat-close-btn" aria-label="Fermer le chat">×</button>
            </div>
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Pose-moi une question sur Grégoire..." />
                <button id="chat-send-btn" class="chat-send-btn" aria-label="Envoyer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(chatWidget);

    // Récupération des éléments du DOM
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesContainer = document.getElementById('chat-messages');

    // Empêcher le focus automatique et l'ouverture du clavier sur iOS
    toggleBtn.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        if (chatWindow.style.display === 'flex') {
            // Sur mobile, on ne focus pas automatiquement
            if (window.innerWidth > 768) {
                chatInput.focus();
            }
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    // Fonction pour ajouter un message à l'écran
    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message chat-message-${sender}`;
        msgDiv.innerHTML = `<div class="chat-message-content">${escapeHtml(text)}</div>`;
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Fonction pour échapper les caractères HTML
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Fonction pour envoyer un message
    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        // Ajoute le message utilisateur à l'historique et à l'écran
        conversationHistory.push({ role: 'user', content: text });
        addMessage(text, 'user');
        chatInput.value = '';
        sendBtn.disabled = true;

        try {
            // Envoie l'historique complet à l'API
            const response = await fetch('/api/groq', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            });

            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.text;

            // Ajoute la réponse IA à l'historique et à l'écran
            conversationHistory.push({ role: 'assistant', content: aiResponse });
            addMessage(aiResponse, 'assistant');
        } catch (err) {
            addMessage(`❌ Erreur: ${err.message}. Vérifie que l'API est accessible.`, 'error');
            console.error('Erreur chat:', err);
        } finally {
            sendBtn.disabled = false;
        }
    };

    // Événement sur le bouton Envoyer
    sendBtn.addEventListener('click', sendMessage);

    // Événement sur la touche Entrée
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Message d'accueil initial
    addMessage("Bonjour ! Je suis l'assistant IA de Grégoire. Pose-moi des questions sur son parcours, ses compétences ou ses projets 👋", 'assistant');
});
