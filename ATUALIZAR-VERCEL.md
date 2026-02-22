# 🚀 Como Atualizar o Site no Vercel

## Método 1: Via GitHub (Mais Fácil)

### Passo 1: Fazer commit das mudanças

Abra o terminal (CMD ou PowerShell) na pasta do projeto e execute:

```bash
git add .
git commit -m "Integração com Firebase - chat em tempo real"
git push
```

### Passo 2: Vercel atualiza automaticamente!

O Vercel está conectado ao seu GitHub, então quando você faz push, ele atualiza sozinho!

Aguarde 1-2 minutos e acesse: https://stumblehit.vercel.app

---

## Método 2: Upload Manual no Vercel

Se o método acima não funcionar:

### Passo 1: Fazer login no Vercel

1. Acesse: https://vercel.com
2. Faça login com sua conta

### Passo 2: Ir no projeto

1. Clique no projeto "stumblehit"
2. Vá na aba "Settings"
3. Role até "Git Repository"

### Passo 3: Forçar novo deploy

1. Volte para a aba "Deployments"
2. Clique nos 3 pontinhos do último deploy
3. Clique em "Redeploy"

---

## Método 3: Via Vercel CLI

### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Passo 2: Fazer login

```bash
vercel login
```

### Passo 3: Fazer deploy

```bash
vercel --prod
```

---

## ✅ Como saber se funcionou?

1. Acesse: https://stumblehit.vercel.app
2. Abra o console do navegador (F12)
3. Deve aparecer: "Firebase inicializado com sucesso! 🔥"
4. Teste o chat em 2 navegadores diferentes
5. As mensagens devem aparecer em tempo real!

---

## 🐛 Problemas?

### Erro: "git: command not found"

Você precisa instalar o Git:
- Baixe em: https://git-scm.com/download/win
- Instale e reinicie o terminal

### Erro: "Firebase não inicializado"

1. Verifique se o arquivo `firebase-config.js` existe
2. Abra o console do navegador (F12)
3. Veja se há erros em vermelho

### Chat não sincroniza

1. Abra o Firebase Console
2. Vá em "Realtime Database"
3. Verifique se as regras estão em "modo de teste"
4. Veja se aparecem dados quando você envia mensagens

---

## 📞 Precisa de ajuda?

Me mande uma mensagem com:
- Print do erro (se houver)
- O que você tentou fazer
- O que aconteceu
