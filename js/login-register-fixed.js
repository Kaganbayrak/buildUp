// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmQKyTDCSjkodorAnVWoMRz8JzlVqbeoU",
  authDomain: "build-up-1db47.firebaseapp.com",
  projectId: "build-up-1db47",
  storageBucket: "build-up-1db47.firebasestorage.app",
  messagingSenderId: "1063214648227",
  appId: "1:1063214648227:web:f1af2755dfe9f7a5a7e816",
  measurementId: "G-PW1FS31B1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(); // Global olarak tanımlayın

// Kullanıcı giriş durumunu kontrol eden fonksiyon
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Kullanıcı giriş yapmış
            document.getElementById('notLoggedIn').style.display = 'none';
            document.getElementById('loggedIn').style.display = 'flex';
            localStorage.setItem("loggedInUserId", user.uid);
            
            // Admin kontrolü
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = user.email === 'm.kaganbayrak@gmail.com' ? 'inline-block' : 'none';
            }
        } else {
            // Kullanıcı giriş yapmamış
            document.getElementById('notLoggedIn').style.display = 'flex';
            document.getElementById('loggedIn').style.display = 'none';
            localStorage.removeItem("loggedInUserId");
        }
    });
}

// Sayfa yüklendiğinde auth durumunu kontrol et
checkAuthState();

// Çıkış yapma fonksiyonu
document.getElementById('logoutButton').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Çıkış yapılırken hata oluştu:", error);
    });
});

function showMessage(message,divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.innerHTML = message;
    messageDiv.style.display = "block";
    messageDiv.style.opacity = 1;
    setTimeout(function() {
        messageDiv.style.opacity = 0;
    }, 5000);

}



// Burada kayıt olduğumuzda kullanıcı bilgilerinin firebase veri tabanına kayıt olmasını sağladık

const signUp = document.getElementById("registerButton");

signUp.addEventListener("click",function(event){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const db = getFirestore(app);

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Kullanıcı başarıyla oluşturuldu
        const user = userCredential.user;
        // Kullanıcı bilgilerini Firestore veritabanına kaydet
        setDoc(doc(db, "users", user.uid), {
            name: name,
            username: username,
            email: email
        })
        .then(() => {
            // Başarı mesajı göster ve ana sayfaya yönlendir
            showMessage('User created successfully!','registerMessage');
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("error writing document", error);
        });
    })
    .catch((error) => {
        // Hata durumlarını kontrol et ve uygun mesajı göster
        const errorCode = error.code; 
        if(errorCode == 'auth/email-already-in-use'){
            showMessage('Email address already exist!!!' ,'registerMessage');
        }
        else{
            showMessage('Unable to create user' , 'registerMessage');
        }
    });

    
    event.preventDefault();
});

const signIn = document.getElementById("loginButton");

signIn.addEventListener("click" , function(event){
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        
        // Admin kontrolü
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = email === 'm.kaganbayrak@gmail.com' ? 'inline-block' : 'none';
        }
        
        showMessage('User logged in successfully!','loginMessage');
        localStorage.setItem("loggedInUserId", user.uid);
        window.location.href = "index.html";
    })
    .catch((error) => { 
        event.preventDefault();
        const errorCode = error.code;
        if(errorCode === 'auth/wrong-password'){
            showMessage('Wrong password!!!' ,'loginMessage');
        }
        else if(errorCode === 'auth/user-not-found'){
            showMessage('User not found!!!' ,'loginMessage');
        }
        else{
            showMessage('Unable to login user' , 'loginMessage');
        }
    });
});

// Profil linkine tıklandığında profile.html sayfasına yönlendir
const profileLink = document.getElementById('profileLink');
if (profileLink) {
  profileLink.addEventListener('click', function(e) {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    window.location.href = 'profile.html'; // Profil sayfasına git
  });
}

// Giriş yapma işlemi
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Admin kontrolü
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = email === 'm.kaganbayrak@gmail.com' ? 'inline-block' : 'none';
            }

            // Giriş başarılı mesajı
            showMessage('Giriş başarılı!');
            
            // Modal'ı kapat
            closeModal('loginModal');
            
            // Form'u temizle
            loginForm.reset();
            
            // Kullanıcı arayüzünü güncelle
            updateUIForLoggedInUser(user);
            
        } catch (error) {
            console.error('Giriş hatası:', error);
            showMessage('Giriş yapılamadı: ' + error.message, 'error');
        }
    });
}