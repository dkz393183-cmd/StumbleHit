// Sistema de chat público em tempo real com Firebase
let chatOpen = false;
let chatMessages = [];
let chatListener = null;

// Inicializar chat
function initChat() {
    // Carregar mensagens do Firebase
    loadChatMessagesFromFirebase();
}

// Carregar mensagens do Firebase em tempo real
function loadChatMessagesFromFirebase() {
    if (!window.firebaseDB) {
        console.log('Aguardando Firebase...');
        setTimeout(loadChatMessagesFromFirebase, 500);
        return;
    }
    
    const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
    const messagesQuery = window.firebaseQuery(messagesRef, window.firebaseOrderByChild('timestamp'), window.firebaseLimitToLast(100));
    
    // Listener em tempo real
    chatListener = window.firebaseOnValue(messagesQuery, (snapshot) => {
        chatMessages = [];
        snapshot.forEach((childSnapshot) => {
            chatMessages.push(childSnapshot.val());
        });
        
        // Limpar mensagens antigas (mais de 7 dias)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        chatMessages = chatMessages.filter(msg => msg.timestamp > sevenDaysAgo);
        
        if (chatOpen) {
            renderMessages();
        }
    });
}

// Abrir/Fechar chat
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatBox.style.display = 'flex';
        chatBox.style.animation = 'slideInLeft 0.3s ease-out';
        renderMessages();
        
        // Scroll para o final
        setTimeout(() => {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    } else {
        chatBox.style.animation = 'slideOutLeft 0.3s ease-out';
        setTimeout(() => {
            chatBox.style.display = 'none';
        }, 300);
    }
}

// Renderizar mensagens
function renderMessages() {
    const container = document.getElementById('chatMessages');
    const user = JSON.parse(localStorage.getItem('stumbleUser'));
    
    if (chatMessages.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px; font-size: 14px;">Nenhuma mensagem ainda.<br>Seja o primeiro a conversar! 💬</div>';
        return;
    }
    
    const currentScroll = container.scrollTop;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    container.innerHTML = chatMessages.map(msg => {
        const isOwn = user && msg.userId === user.email;
        const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div style="margin-bottom: 15px; ${isOwn ? 'text-align: right;' : ''}">
                <div style="display: inline-block; max-width: 70%; text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; ${isOwn ? 'flex-direction: row-reverse;' : ''}">
                        ${msg.photoURL ? 
                            `<img src="${msg.photoURL}" style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid #000; object-fit: cover;">` :
                            `<div style="width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; border: 2px solid #000; color: white; font-size: 14px; font-weight: bold;">${msg.userName.charAt(0)}</div>`
                        }
                        <span style="font-weight: bold; color: #667eea; font-size: 14px;">${msg.userName}</span>
                        <span style="font-size: 11px; color: #999;">${time}</span>
                    </div>
                    <div style="background: ${isOwn ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f0f0f0'}; color: ${isOwn ? 'white' : '#333'}; padding: 10px 15px; border-radius: 15px; border: 2px solid #000; word-wrap: break-word; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        ${escapeHtml(msg.message)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Manter scroll na posição ou ir para o final se estava no final
    if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
    }
}

// Escapar HTML para segurança
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Enviar mensagem para Firebase
async function sendMessage() {
    const user = JSON.parse(localStorage.getItem('stumbleUser'));
    
    if (!user) {
        alert('Você precisa estar logado para enviar mensagens!');
        window.location.href = 'login.html';
        return;
    }
    
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (message.length > 500) {
        alert('Mensagem muito longa! Máximo 500 caracteres.');
        return;
    }
    
    const newMessage = {
        userId: user.email,
        userName: user.displayName,
        photoURL: user.photoURL || null,
        message: message,
        timestamp: Date.now()
    };
    
    // Salvar no Firebase
    const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
    await window.firebasePush(messagesRef, newMessage);
    
    input.value = '';
    
    // Scroll para o final
    setTimeout(() => {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// Funções removidas - Firebase faz tudo automaticamente em tempo real!

// Listener para Enter
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Inicializar chat quando Firebase estiver pronto
    if (window.firebaseDB) {
        initChat();
    } else {
        setTimeout(initChat, 1000);
    }
});

