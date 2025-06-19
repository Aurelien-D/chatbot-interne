document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const sendButton = document.getElementById('send-button');

    // Historique de la conversation, stocké côté client
    let conversationHistory = [];

    const addMessage = (message, sender) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const p = document.createElement('p');
        p.textContent = message;
        messageElement.appendChild(p);

        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const setLoading = (isLoading) => {
        let loadingElement = chatBox.querySelector('.loading');
        if (isLoading) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.classList.add('message', 'loading');
                loadingElement.innerHTML = '<span></span><span></span><span></span>';
                chatBox.appendChild(loadingElement);
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        } else {
            if (loadingElement) {
                chatBox.removeChild(loadingElement);
            }
        }
    };


    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        if (!message) return;

        // Ajouter le message de l'utilisateur à l'UI et à l'historique
        addMessage(message, 'user');
        conversationHistory.push({ role: 'user', content: message });
        
        userInput.value = '';
        setLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, history: conversationHistory.slice(0, -1) }), // Envoie l'historique SANS le dernier message utilisateur
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur du serveur');
            }

            const data = await response.json();
            const botReply = data.reply;
            
            // Ajouter la réponse du bot à l'UI et à l'historique
            addMessage(botReply, 'bot');
            conversationHistory.push({ role: 'assistant', content: botReply });

        } catch (error) {
            console.error('Erreur:', error);
            addMessage(`Désolé, une erreur est survenue : ${error.message}`, 'bot');
        } finally {
            setLoading(false);
        }
    });
});