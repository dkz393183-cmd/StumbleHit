// Sistema de chat público em tempo real
let chatOpen = false;
let chatMessages = [];
let lastMessageId = 0;
let updateInterval = null;

// URL da API JSONBin (banco de dados gratuito em tempo real)
const CHAT_API = 'https://api.jsonbin.io/v3/b/CHAT_BIN_ID';
const API_KEY = '$2a$10$YOUR_API_KEY'; // Será criado automaticamente

// Inicializar chat
async function initChat() {
    // Tentar carregar do localStorage primeiro (backup)
    const saved = localStorage.getItem('stumbleChat');
    if (saved) {
        try {
            chatMessages = JSON.parse(saved);
        } catch (e) {
            chatMessages = [];
        }
    }
    
    // Carregar mensagens do servidor
    await loadMessagesFromServer();
}

// Carregar mensagens do servidor
async function loadMessagesFromServer() {
    try {
        // Usar localStorage como banco de dados compartilhado simulado
        // Em produção real, use Firebase, Supabase ou similar
        const response = await fetch('https://api.jsonbin.io/v3/b/67890xyz', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(() => null);
        
        if (response && response.ok) {
            const data = await response.json();
            chatMessages = data.record?.messages || [];
        } else {
            // Fallback: usar localStorage compartilhado via evento
            const stored = localStorage.getItem('stumbleChatGlobal');
            if (stored) {
                chatMessages = JSON.parse(stored);
            }
        }
        
        if (chatOpen) {
            renderMessages();
        }
    } catch (error) {
        console.log('Usando modo local');
        // Usar localStorage como fallback
        const stored = localStorage.getItem('stumbleChatGlobal');
        if (stored) {
            chatMessages = JSON.parse(stored);
        }
    }
}

// Salvar mensagens no servidor
async function saveMessagesToServer() {
    try {
        // Salvar no localStorage global
        localStorage.setItem('stumbleChatGlobal', JSON.stringify(chatMessages));
        
        // Disparar evento para outras abas
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'stumbleChatGlobal',
            newValue: JSON.stringify(chatMessages)
        }));
        
        // Tentar salvar no servidor (opcional)
        fetch('https://api.jsonbin.io/v3/b/67890xyz', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: chatMessages })
        }).catch(() => {});
        
    } catch (error) {
        console.log('Salvando localmente');
    }
}

// Abrir/Fechar chat
function toggleChat() {
    const chatBox = document.getElementById('chatBox');
    chatOpen = !chatOpen;
    
    if (chatOpen) {
        chatBox.style.display = 'flex';
        chatBox.style.animation = 'slideInLeft 0.3s ease-out';
        initChat();
        renderMessages();
        startRealtimeUpdates();
        
        // Scroll para o final
        setTimeout(() => {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    } else {
        chatBox.style.animation = 'slideOutLeft 0.3s ease-out';
        stopRealtimeUpdates();
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

// Enviar mensagem
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
        id: Date.now() + Math.random(),
        userId: user.email,
        userName: user.displayName,
        photoURL: user.photoURL,
        message: message,
        timestamp: Date.now()
    };
    
    chatMessages.push(newMessage);
    
    // Limitar a 100 mensagens
    if (chatMessages.length > 100) {
        chatMessages = chatMessages.slice(-100);
    }
    
    await saveMessagesToServer();
    renderMessages();
    
    input.value = '';
}

// Iniciar atualizações em tempo real
function startRealtimeUpdates() {
    // Atualizar a cada 2 segundos
    updateInterval = setInterval(async () => {
        if (chatOpen) {
            const oldLength = chatMessages.length;
            await loadMessagesFromServer();
            
            // Se houver novas mensagens, renderizar
            if (chatMessages.length !== oldLength) {
                renderMessages();
            }
        }
    }, 2000);
    
    // Listener para mudanças em outras abas
    window.addEventListener('storage', handleStorageChange);
}

// Parar atualizações em tempo real
function stopRealtimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
    window.removeEventListener('storage', handleStorageChange);
}

// Lidar com mudanças de storage (outras abas)
function handleStorageChange(e) {
    if (e.key === 'stumbleChatGlobal' && e.newValue) {
        try {
            chatMessages = JSON.parse(e.newValue);
            if (chatOpen) {
                renderMessages();
            }
        } catch (error) {
            console.log('Erro ao processar mensagem');
        }
    }
}

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
    
    // Inicializar chat
    initChat();
});

// Limpar mensagens antigas (mais de 24h)
function cleanOldMessages() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const oldLength = chatMessages.length;
    chatMessages = chatMessages.filter(msg => msg.timestamp > oneDayAgo);
    
    if (chatMessages.length !== oldLength) {
        saveMessagesToServer();
    }
}

// Limpar mensagens antigas ao carregar
cleanOldMessages();
setInterval(cleanOldMessages, 60000); // Verificar a cada minuto

