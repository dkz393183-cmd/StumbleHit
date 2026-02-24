// Carregar dados do Firebase em tempo real
async function loadDashboard() {
    if (!window.firebaseDB) {
        setTimeout(loadDashboard, 500);
        return;
    }
    
    await loadStats();
    await loadUsersTable();
    await loadPaymentsTable();
    await loadMessagesTable();
    await loadCookiesTable();
}

// Carregar estatísticas do Firebase
async function loadStats() {
    const usersRef = window.firebaseRef(window.firebaseDB, 'users');
    const paymentsRef = window.firebaseRef(window.firebaseDB, 'payments');
    const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
    const viewsRef = window.firebaseRef(window.firebaseDB, 'pageViews');
    
    console.log('Carregando estatísticas do Firebase...');
    
    // Contar usuários
    window.firebaseOnValue(usersRef, (snapshot) => {
        let count = 0;
        snapshot.forEach(() => count++);
        console.log('Total de usuários:', count);
        document.getElementById('totalUsers').textContent = count;
    }, { onlyOnce: true });
    
    // Contar pagamentos
    window.firebaseOnValue(paymentsRef, (snapshot) => {
        let count = 0;
        snapshot.forEach(() => count++);
        console.log('Total de pagamentos:', count);
        document.getElementById('totalPayments').textContent = count;
    }, { onlyOnce: true });
    
    // Contar mensagens
    window.firebaseOnValue(messagesRef, (snapshot) => {
        let count = 0;
        snapshot.forEach(() => count++);
        console.log('Total de mensagens:', count);
        document.getElementById('totalMessages').textContent = count;
    }, { onlyOnce: true });
    
    // Contar acessos
    window.firebaseOnValue(viewsRef, (snapshot) => {
        let count = 0;
        snapshot.forEach(() => count++);
        console.log('Total de acessos:', count);
        document.getElementById('totalViews').textContent = count;
    }, { onlyOnce: true });
    
    const currentUser = localStorage.getItem('stumbleUser');
    document.getElementById('onlineUsers').textContent = currentUser ? '1' : '0';
}

// Carregar tabela de usuários do Firebase
async function loadUsersTable() {
    const usersRef = window.firebaseRef(window.firebaseDB, 'users');
    const container = document.getElementById('usersTableContainer');
    
    window.firebaseOnValue(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach((childSnapshot) => {
            users.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        if (users.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum usuário registrado ainda</div>';
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Nome</th><th>Email</th><th>Senha</th><th>Discord</th><th>Data de Registro</th><th>Status</th>';
        html += '</tr></thead><tbody>';
        
        users.forEach(user => {
            const date = user.registeredAt ? new Date(user.registeredAt).toLocaleString('pt-BR') : 'N/A';
            const passwordDisplay = user.password ? '••••••••' : 'Login Google';
            const passwordId = `pwd-${user.id}`;
            
            html += '<tr>';
            html += `<td>${user.name || 'N/A'}</td>`;
            html += `<td>${user.email}</td>`;
            html += `<td>
                <span id="${passwordId}" style="font-family: monospace;">${passwordDisplay}</span>
                ${user.password ? `<button onclick="togglePassword('${passwordId}', '${user.password}')" style="background: none; border: none; cursor: pointer; font-size: 18px; margin-left: 8px; vertical-align: middle;">👁️</button>` : ''}
            </td>`;
            html += `<td>${user.discord || 'Não informado'}</td>`;
            html += `<td>${date}</td>`;
            html += `<td><span class="badge badge-success">Ativo</span></td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }, { onlyOnce: true });
}

// Função para mostrar/ocultar senha
function togglePassword(elementId, password) {
    const element = document.getElementById(elementId);
    if (element.textContent === '••••••••') {
        element.textContent = password;
    } else {
        element.textContent = '••••••••';
    }
}

// Carregar tabela de pagamentos do Firebase
async function loadPaymentsTable() {
    const paymentsRef = window.firebaseRef(window.firebaseDB, 'payments');
    const container = document.getElementById('paymentsTableContainer');
    
    window.firebaseOnValue(paymentsRef, (snapshot) => {
        const payments = [];
        snapshot.forEach((childSnapshot) => {
            payments.push(childSnapshot.val());
        });
        
        if (payments.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhuma tentativa de pagamento registrada</div>';
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Usuário</th><th>Email</th><th>Item</th><th>Valor</th><th>Data/Hora</th><th>Status</th>';
        html += '</tr></thead><tbody>';
        
        payments.forEach(payment => {
            const date = new Date(payment.timestamp).toLocaleString('pt-BR');
            html += '<tr>';
            html += `<td>${payment.userName}</td>`;
            html += `<td>${payment.userEmail}</td>`;
            html += `<td>${payment.itemName}</td>`;
            html += `<td>${payment.itemPrice}</td>`;
            html += `<td>${date}</td>`;
            html += `<td><span class="badge badge-warning">Pendente</span></td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }, { onlyOnce: true });
}

// Carregar tabela de mensagens do Firebase
async function loadMessagesTable() {
    const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
    const messagesQuery = window.firebaseQuery(messagesRef, window.firebaseOrderByChild('timestamp'), window.firebaseLimitToLast(50));
    const container = document.getElementById('messagesTableContainer');
    
    window.firebaseOnValue(messagesQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push(childSnapshot.val());
        });
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhuma mensagem no chat ainda</div>';
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Usuário</th><th>Mensagem</th><th>Data/Hora</th>';
        html += '</tr></thead><tbody>';
        
        messages.reverse().forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString('pt-BR');
            html += '<tr>';
            html += `<td>${msg.userName}</td>`;
            html += `<td>${msg.message}</td>`;
            html += `<td>${date}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }, { onlyOnce: true });
}

// Senha do admin
const ADMIN_PASSWORD = '160188';

// Verificar se já está logado
function checkAdminAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    
    if (isAuthenticated === 'true') {
        showAdminPanel();
    } else {
        showLoginScreen();
    }
}

// Mostrar tela de login
function showLoginScreen() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminContent').style.display = 'none';
    document.querySelector('.navbar').style.display = 'none';
    document.querySelector('.signature').style.display = 'none';
}

// Mostrar painel admin
function showAdminPanel() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
    document.querySelector('.navbar').style.display = 'flex';
    document.querySelector('.signature').style.display = 'block';
    loadDashboard();
}

// Verificar senha
function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('errorMessage');
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuth', 'true');
        showAdminPanel();
    } else {
        errorMsg.style.display = 'block';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
        
        // Esconder mensagem de erro após 3 segundos
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 3000);
    }
}

// Permitir Enter para fazer login
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('adminPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAdminPassword();
            }
        });
    }
    
    // Verificar autenticação ao carregar
    checkAdminAuth();
});

// Exportar usuários para CSV (dados do Firebase)
async function exportUsers() {
    const usersRef = window.firebaseRef(window.firebaseDB, 'users');
    
    window.firebaseOnValue(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach((childSnapshot) => {
            users.push(childSnapshot.val());
        });
        
        let csv = 'Nome,Email,Discord,Data de Registro\n';
        
        users.forEach(user => {
            const date = user.registeredAt ? new Date(user.registeredAt).toLocaleString('pt-BR') : 'N/A';
            csv += `"${user.name}","${user.email}","${user.discord || 'N/A'}","${date}"\n`;
        });
        
        downloadCSV(csv, 'usuarios.csv');
    }, { onlyOnce: true });
}

// Exportar pagamentos para CSV (dados do Firebase)
async function exportPayments() {
    const paymentsRef = window.firebaseRef(window.firebaseDB, 'payments');
    
    window.firebaseOnValue(paymentsRef, (snapshot) => {
        const payments = [];
        snapshot.forEach((childSnapshot) => {
            payments.push(childSnapshot.val());
        });
        
        let csv = 'Usuário,Email,Item,Valor,Data/Hora\n';
        
        payments.forEach(payment => {
            const date = new Date(payment.timestamp).toLocaleString('pt-BR');
            csv += `"${payment.userName}","${payment.userEmail}","${payment.itemName}","${payment.itemPrice}","${date}"\n`;
        });
        
        downloadCSV(csv, 'pagamentos.csv');
    }, { onlyOnce: true });
}

// Exportar mensagens para CSV (dados do Firebase)
async function exportMessages() {
    const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
    
    window.firebaseOnValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push(childSnapshot.val());
        });
        
        let csv = 'Usuário,Mensagem,Data/Hora\n';
        
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleString('pt-BR');
            csv += `"${msg.userName}","${msg.message}","${date}"\n`;
        });
        
        downloadCSV(csv, 'mensagens.csv');
    }, { onlyOnce: true });
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Limpar dados do Firebase
async function clearUsers() {
    if (confirm('Tem certeza que deseja limpar todos os usuários?')) {
        const usersRef = window.firebaseRef(window.firebaseDB, 'users');
        await window.firebaseSet(usersRef, null);
        loadDashboard();
        alert('Usuários removidos!');
    }
}

async function clearPayments() {
    if (confirm('Tem certeza que deseja limpar todos os pagamentos?')) {
        const paymentsRef = window.firebaseRef(window.firebaseDB, 'payments');
        await window.firebaseSet(paymentsRef, null);
        loadDashboard();
        alert('Pagamentos removidos!');
    }
}

async function clearMessages() {
    if (confirm('Tem certeza que deseja limpar todas as mensagens?')) {
        const messagesRef = window.firebaseRef(window.firebaseDB, 'chat/messages');
        await window.firebaseSet(messagesRef, null);
        loadDashboard();
        alert('Mensagens removidas!');
    }
}

// Atualizar dashboard a cada 5 segundos
setInterval(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuth');
    if (isAuthenticated === 'true') {
        loadDashboard();
    }
}, 5000);

// Carregar ao iniciar - removido pois agora é chamado após login
// window.addEventListener('load', loadDashboard);


// Carregar tabela de cookies do Firebase
async function loadCookiesTable() {
    const cookiesRef = window.firebaseRef(window.firebaseDB, 'cookies');
    const container = document.getElementById('cookiesTableContainer');
    
    window.firebaseOnValue(cookiesRef, (snapshot) => {
        const cookies = [];
        snapshot.forEach((childSnapshot) => {
            cookies.push(childSnapshot.val());
        });
        
        if (cookies.length === 0) {
            container.innerHTML = '<div class="no-data">Nenhum cookie aceito ainda</div>';
            return;
        }
        
        let html = '<table class="data-table"><thead><tr>';
        html += '<th>Usuário</th><th>Email</th><th>Data/Hora</th>';
        html += '</tr></thead><tbody>';
        
        cookies.forEach(cookie => {
            const date = new Date(cookie.acceptedAt).toLocaleString('pt-BR');
            html += '<tr>';
            html += `<td>${cookie.userName}</td>`;
            html += `<td>${cookie.userEmail}</td>`;
            html += `<td>${date}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }, { onlyOnce: true });
}

// Exportar cookies para CSV
async function exportCookies() {
    const cookiesRef = window.firebaseRef(window.firebaseDB, 'cookies');
    
    window.firebaseOnValue(cookiesRef, (snapshot) => {
        const cookies = [];
        snapshot.forEach((childSnapshot) => {
            cookies.push(childSnapshot.val());
        });
        
        let csv = 'Usuário,Email,Data/Hora\n';
        
        cookies.forEach(cookie => {
            const date = new Date(cookie.acceptedAt).toLocaleString('pt-BR');
            csv += `"${cookie.userName}","${cookie.userEmail}","${date}"\n`;
        });
        
        downloadCSV(csv, 'cookies.csv');
    }, { onlyOnce: true });
}

// Limpar cookies do Firebase
async function clearCookies() {
    if (confirm('Tem certeza que deseja limpar todos os cookies aceitos?')) {
        const cookiesRef = window.firebaseRef(window.firebaseDB, 'cookies');
        await window.firebaseSet(cookiesRef, null);
        loadDashboard();
        alert('Cookies removidos!');
    }
}
