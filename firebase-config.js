// Configuração do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Configuração do seu projeto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC-vEgvtDAAQU-v3avB4OhWRtFSEI3ELek",
    authDomain: "stumblehit.firebaseapp.com",
    databaseURL: "https://stumblehit-default-rtdb.firebaseio.com",
    projectId: "stumblehit",
    storageBucket: "stumblehit.firebasestorage.app",
    messagingSenderId: "551098241951",
    appId: "1:551098241951:web:260c470587da5c603b63aa",
    measurementId: "G-23KPH3C76W"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exportar para uso em outros arquivos
window.firebaseApp = app;
window.firebaseDB = database;
window.firebaseRef = ref;
window.firebaseSet = set;
window.firebasePush = push;
window.firebaseOnValue = onValue;
window.firebaseQuery = query;
window.firebaseOrderByChild = orderByChild;
window.firebaseLimitToLast = limitToLast;

console.log('Firebase inicializado com sucesso! 🔥');
