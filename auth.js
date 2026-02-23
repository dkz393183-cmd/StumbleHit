// Firebase já está configurado no firebase-config.js

// Verificar se usuário está logado
function checkAuth() {
    const user = localStorage.getItem('stumbleUser');
    if (user) {
        const userData = JSON.parse(user);
        updateUserIcon(userData);
        // Se estiver na página de login, redirecionar para home
        if (window.location.pathname.includes('login.html')) {
            // Não redirecionar, apenas mostrar perfil
        }
    }
}

// Atualizar ícone do usuário
function updateUserIcon(userData) {
    const userIcons = document.querySelectorAll('.user-icon');
    userIcons.forEach(userIcon => {
        if (userData.photoURL) {
            userIcon.innerHTML = `<img src="${userData.photoURL}" alt="User" style="width: 35px; height: 35px; border-radius: 50%; border: 2px solid #000; cursor: pointer;">`;
        } else {
            userIcon.innerHTML = `<div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; border: 2px solid #000; color: white; font-size: 18px; cursor: pointer;">${userData.displayName.charAt(0)}</div>`;
        }
        userIcon.onclick = function() { window.location.href = 'login.html'; };
    });
}

// Abrir modal de login
function openAuthModal() {
    const user = localStorage.getItem('stumbleUser');
    if (user) {
        // Se já está logado, mostrar perfil
        showUserProfile();
    } else {
        // Se não está logado, mostrar login
        document.getElementById('authModal').style.display = 'flex';
    }
}

// Fechar modal de login
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Mostrar tela de cadastro
function showSignup() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.style.animation = 'slideOutLeft 0.3s ease-out';
    setTimeout(() => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        signupForm.style.animation = 'slideInRight 0.3s ease-out';
    }, 300);
}

// Mostrar tela de login
function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    signupForm.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        loginForm.style.animation = 'slideInLeft 0.3s ease-out';
    }, 300);
}

// Login com email e senha
async function loginWithEmail() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    // Verificar se Firebase está disponível
    if (!window.firebaseDB) {
        alert('Aguarde, carregando...');
        setTimeout(loginWithEmail, 500);
        return;
    }

    // Buscar usuário no Firebase
    const usersRef = window.firebaseRef(window.firebaseDB, 'users');
    
    window.firebaseOnValue(usersRef, (snapshot) => {
        let userFound = false;
        
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            if (user.email === email && user.password === password) {
                userFound = true;
                
                const userData = {
                    displayName: user.name,
                    email: user.email,
                    discord: user.discord || '',
                    photoURL: user.photoURL || null
                };
                
                localStorage.setItem('stumbleUser', JSON.stringify(userData));
                updateUserIcon(userData);
                
                // Se estiver na página de login, mostrar perfil
                if (window.location.pathname.includes('login.html')) {
                    if (typeof showUserProfile === 'function') {
                        showUserProfile();
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    closeAuthModal();
                    alert('Login realizado com sucesso! 🎉');
                }
            }
        });
        
        if (!userFound) {
            alert('Email ou senha incorretos!');
        }
    }, { onlyOnce: true });
}

// Cadastro com email e senha
async function signupWithEmail() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!name || !email || !password || !confirmPassword) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (password !== confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }

    if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    // Verificar se Firebase está disponível
    if (!window.firebaseDB) {
        alert('Aguarde, carregando...');
        setTimeout(signupWithEmail, 500);
        return;
    }

    // Verificar se email já existe no Firebase
    const usersRef = window.firebaseRef(window.firebaseDB, 'users');
    
    window.firebaseOnValue(usersRef, async (snapshot) => {
        let emailExists = false;
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().email === email) {
                emailExists = true;
            }
        });
        
        if (emailExists) {
            alert('Este email já está cadastrado!');
            return;
        }

        // Salvar usuário no Firebase
        const newUserRef = window.firebasePush(usersRef);
        const userData = {
            name: name,
            email: email,
            password: password,
            registeredAt: Date.now()
        };
        await window.firebaseSet(newUserRef, userData);
        
        // Salvar sessão local
        const userSession = {
            displayName: name,
            email: email,
            photoURL: null,
            registeredAt: Date.now()
        };
        localStorage.setItem('stumbleUser', JSON.stringify(userSession));
        updateUserIcon(userSession);
        
        // Se estiver na página de login, mostrar perfil
        if (window.location.pathname.includes('login.html')) {
            if (typeof showUserProfile === 'function') {
                showUserProfile();
            } else {
                window.location.href = 'index.html';
            }
        } else {
            closeAuthModal();
            alert('Conta criada com sucesso! 🎉');
        }
    }, { onlyOnce: true });
}

// Firebase já está configurado no firebase-config.js

// Login com Google usando Firebase Authentication
async function loginWithGoogle() {
    try {
        // Mostrar loading
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'googleLoginLoading';
        loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 15px; border: 5px solid #000; z-index: 10000; text-align: center; font-family: "Lilita One", cursive;';
        loadingDiv.innerHTML = '<div style="font-size: 24px; color: #667eea; margin-bottom: 10px;">🔄 Redirecionando...</div><div style="color: #666;">Você será redirecionado para o Google</div>';
        document.body.appendChild(loadingDiv);
        
        // Aguardar um pouco para garantir que Firebase carregou
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Importar Firebase Auth dinamicamente
        const { getAuth, signInWithRedirect, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        
        const auth = getAuth(window.firebaseApp);
        const provider = new GoogleAuthProvider();
        
        // Fazer login com redirect do Google
        await signInWithRedirect(auth, provider);
        
    } catch (error) {
        console.error('Erro no login:', error);
        
        // Remover loading
        const loading = document.getElementById('googleLoginLoading');
        if (loading) loading.remove();
        
        alert('Erro ao fazer login com Google. Verifique se você está acessando o site via HTTP/HTTPS (não file://)');
    }
}

// Verificar resultado do redirect ao carregar a página
async function checkGoogleRedirect() {
    try {
        // Aguardar Firebase carregar
        await new Promise(resolve => {
            const checkFirebase = setInterval(() => {
                if (window.firebaseApp) {
                    clearInterval(checkFirebase);
                    resolve();
                }
            }, 100);
            
            // Timeout após 5 segundos
            setTimeout(() => {
                clearInterval(checkFirebase);
                resolve();
            }, 5000);
        });
        
        if (!window.firebaseApp) {
            console.log('Firebase não carregou a tempo');
            return;
        }
        
        const { getAuth, getRedirectResult } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        
        const auth = getAuth(window.firebaseApp);
        const result = await getRedirectResult(auth);
        
        if (result && result.user) {
            const user = result.user;
            
            // Salvar dados do usuário
            const userData = {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                registeredAt: Date.now()
            };
            
            // Salvar no Firebase Database
            const usersRef = window.firebaseRef(window.firebaseDB, 'users');
            
            // Verificar se usuário já existe
            let userExists = false;
            await new Promise((resolve) => {
                window.firebaseOnValue(usersRef, (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        if (childSnapshot.val().email === user.email) {
                            userExists = true;
                        }
                    });
                    resolve();
                }, { onlyOnce: true });
            });
            
            // Se não existe, criar novo usuário
            if (!userExists) {
                const newUserRef = window.firebasePush(usersRef);
                await window.firebaseSet(newUserRef, {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    registeredAt: Date.now()
                });
            }
            
            // Salvar sessão local
            localStorage.setItem('stumbleUser', JSON.stringify(userData));
            updateUserIcon(userData);
            
            // Se estiver na página de login, mostrar perfil
            if (window.location.pathname.includes('login.html')) {
                if (typeof showUserProfile === 'function') {
                    showUserProfile();
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                alert('Login realizado com sucesso! 🎉');
            }
        }
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error('Erro ao verificar redirect:', error);
        }
    }
}

// Mostrar perfil do usuário
function showUserProfile() {
    const userData = JSON.parse(localStorage.getItem('stumbleUser'));
    const profileHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="position: relative; display: inline-block; margin-bottom: 15px;">
                ${userData.photoURL ? 
                    `<img src="${userData.photoURL}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #000;">` : 
                    `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; margin: 0 auto; border: 3px solid #000; font-size: 36px; color: white;">${userData.displayName.charAt(0)}</div>`
                }
            </div>
            <h2 style="color: #667eea; margin-bottom: 10px;">${userData.displayName}</h2>
            <p style="color: #666; margin-bottom: 10px;">${userData.email}</p>
            ${userData.discord ? `<p style="color: #5865F2; margin-bottom: 20px;">🎮 ${userData.discord}</p>` : ''}
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="editProfileModal()" style="background: linear-gradient(180deg, #FFE600, #FF9500); color: white; border: 3px solid #000; padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 10px; font-family: 'Lilita One', cursive;">
                    ✏️ Editar
                </button>
                <button onclick="logout()" style="background: linear-gradient(180deg, #FF6B6B, #FF0000); color: white; border: 3px solid #000; padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 10px; font-family: 'Lilita One', cursive;">
                    🚪 Sair
                </button>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('authModal');
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close-modal" onclick="closeAuthModal()">&times;</span>
        ${profileHTML}
    `;
    modal.style.display = 'flex';
}

// Editar perfil no modal
function editProfileModal() {
    const userData = JSON.parse(localStorage.getItem('stumbleUser'));
    const editHTML = `
        <div style="padding: 20px;">
            <h2 style="color: #667eea; margin-bottom: 20px; text-align: center;">✏️ Editar Perfil</h2>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">Nome:</label>
                <input type="text" id="modalEditName" value="${userData.displayName}" style="width: 100%; padding: 12px; border: 3px solid #000; border-radius: 10px; font-size: 16px; font-family: 'Lilita One', cursive;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">Discord:</label>
                <input type="text" id="modalEditDiscord" value="${userData.discord || ''}" placeholder="seu_usuario#1234" style="width: 100%; padding: 12px; border: 3px solid #000; border-radius: 10px; font-size: 16px; font-family: 'Lilita One', cursive;">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; color: #666; margin-bottom: 5px;">Foto de Perfil:</label>
                <button onclick="uploadModalPhoto()" style="background: linear-gradient(180deg, #667eea, #764ba2); color: white; border: 3px solid #000; padding: 10px 20px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 10px; font-family: 'Lilita One', cursive; text-shadow: 2px 2px 0 #000; margin-bottom: 10px;">
                    📁 Escolher Arquivo
                </button>
                <input type="file" id="modalPhotoInput" accept="image/png, image/jpeg, image/jpg, image/gif" style="display: none;">
                ${userData.photoURL ? `<div><img src="${userData.photoURL}" style="width: 80px; height: 80px; border-radius: 50%; margin-top: 10px; border: 3px solid #000; object-fit: cover;"></div>` : ''}
            </div>
            
            <button onclick="saveProfileModal()" style="width: 100%; background: linear-gradient(180deg, #00FF7F, #32CD32); color: white; border: 3px solid #000; padding: 15px; font-size: 20px; font-weight: bold; cursor: pointer; border-radius: 12px; font-family: 'Lilita One', cursive; text-shadow: 2px 2px 0 #000; margin-bottom: 10px;">
                ✓ Salvar
            </button>
            
            <button onclick="showUserProfile()" style="width: 100%; background: #f0f0f0; color: #333; border: 3px solid #000; padding: 12px; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 10px; font-family: 'Lilita One', cursive;">
                ✕ Cancelar
            </button>
        </div>
    `;
    
    const modal = document.getElementById('authModal');
    modal.querySelector('.modal-content').innerHTML = `
        <span class="close-modal" onclick="closeAuthModal()">&times;</span>
        ${editHTML}
    `;
}

// Upload de foto no modal
function uploadModalPhoto() {
    const input = document.getElementById('modalPhotoInput');
    input.click();
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Verificar tamanho (máx 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 2MB!');
            return;
        }
        
        // Ler arquivo e converter para base64
        const reader = new FileReader();
        reader.onload = function(event) {
            const userData = JSON.parse(localStorage.getItem('stumbleUser'));
            userData.photoURL = event.target.result;
            localStorage.setItem('stumbleUser', JSON.stringify(userData));
            updateUserIcon(userData);
            
            // Recarregar formulário para mostrar preview
            editProfileModal();
        };
        reader.readAsDataURL(file);
    };
}

// Salvar perfil do modal
async function saveProfileModal() {
    const newName = document.getElementById('modalEditName').value.trim();
    const newDiscord = document.getElementById('modalEditDiscord').value.trim();
    
    if (!newName) {
        alert('O nome não pode estar vazio!');
        return;
    }
    
    const userData = JSON.parse(localStorage.getItem('stumbleUser'));
    userData.displayName = newName;
    userData.discord = newDiscord;
    
    // Atualizar no localStorage
    localStorage.setItem('stumbleUser', JSON.stringify(userData));
    updateUserIcon(userData);
    
    // Atualizar no Firebase
    if (window.firebaseDB) {
        const usersRef = window.firebaseRef(window.firebaseDB, 'users');
        
        // Encontrar e atualizar o usuário no Firebase
        window.firebaseOnValue(usersRef, async (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                if (user.email === userData.email) {
                    const userRef = window.firebaseRef(window.firebaseDB, `users/${childSnapshot.key}`);
                    window.firebaseSet(userRef, {
                        ...user,
                        name: newName,
                        discord: newDiscord
                    });
                }
            });
        }, { onlyOnce: true });
    }
    
    alert('Perfil atualizado com sucesso! ✓');
    showUserProfile();
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('stumbleUser');
        localStorage.removeItem('stumbleUserLastActive');
        location.reload();
    }
}

// Verificar autenticação ao carregar a página
window.addEventListener('load', () => {
    checkAuth();
    checkGoogleRedirect();
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
}
