// profile.js
// Bu dosya, profil sayfasında kullanıcı bilgilerini Firestore'dan çekip göstermek ve düzenlemeye imkan vermek için kullanılır.

import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";

// Firebase yapılandırma bilgileri (login-register-fixed.js ile aynı olmalı)
const firebaseConfig = {
  apiKey: "AIzaSyDmQKyTDCSjkodorAnVWoMRz8JzlVqbeoU",
  authDomain: "build-up-1db47.firebaseapp.com",
  projectId: "build-up-1db47",
  storageBucket: "build-up-1db47.firebasestorage.app",
  messagingSenderId: "1063214648227",
  appId: "1:1063214648227:web:f1af2755dfe9f7a5a7e816",
  measurementId: "G-PW1FS31B1X"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// Kullanıcı bilgilerini ekrana yazdıran fonksiyon
async function loadProfile() {
  // Giriş yapan kullanıcının ID'sini localStorage'dan al
  const userId = localStorage.getItem("loggedInUserId");
  if (!userId) {
    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    window.location.href = "index.html";
    return;
  }
  // Firestore'dan kullanıcı bilgilerini çek
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    // HTML elementlerine bilgileri yaz
    document.getElementById("profileName").textContent = userData.name || "İsim Yok";
    document.getElementById("profileUsername").textContent = `@${userData.username || "kullaniciadi"}`;
    document.getElementById("profileLocation").textContent = userData.country || "Ülke Bilgisi Yok";
    document.getElementById("profileLanguages").textContent = userData.languages || "Dil Bilgisi Yok";
    document.getElementById("profileAbout").textContent = userData.about || "Kullanıcı hakkında açıklama yok.";
    // Profil fotoğrafı varsa göster
    if (userData.photoURL) {
      document.getElementById("profilePhoto").src = userData.photoURL;
    }
  }
}

// Profil sayfası yüklendiğinde bilgileri getir
window.addEventListener("DOMContentLoaded", loadProfile);

// Edit details butonuna tıklanınca textarea ve butonları göster
window.editProfile = function() {
  // Mevcut açıklamayı textarea'ya yaz
  document.getElementById("aboutTextarea").value = document.getElementById("profileAbout").textContent;
  document.getElementById("profileAbout").style.display = "none";
  document.getElementById("editAboutBtn").style.display = "none";
  document.getElementById("aboutEditArea").style.display = "block";
}

// Kaydet butonuna tıklanınca Firestore'a güncelle ve ekranda göster
const saveBtn = document.getElementById("saveAboutBtn");
if (saveBtn) {
  saveBtn.addEventListener("click", async function() {
    const about = document.getElementById("aboutTextarea").value;
    const userId = localStorage.getItem("loggedInUserId");
    const userRef = doc(db, "users", userId);
    try {
      // Önce doküman var mı kontrol et
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        // Doküman varsa updateDoc ile güncelle
        await updateDoc(userRef, { about: about });
      } else {
        // Doküman yoksa setDoc ile oluştur
        await setDoc(userRef, { about: about });
      }
      document.getElementById("profileAbout").textContent = about;
      document.getElementById("profileAbout").style.display = "block";
      document.getElementById("editAboutBtn").style.display = "inline-block";
      document.getElementById("aboutEditArea").style.display = "none";
      alert("Profil güncellendi!");
    } catch (error) {
      alert("Güncelleme sırasında hata oluştu: " + error.message);
    }
  });
}

// İptal butonuna tıklanınca textarea'yı gizle, eski haline dön
const cancelBtn = document.getElementById("cancelAboutBtn");
if (cancelBtn) {
  cancelBtn.addEventListener("click", function() {
    document.getElementById("profileAbout").style.display = "block";
    document.getElementById("editAboutBtn").style.display = "inline-block";
    document.getElementById("aboutEditArea").style.display = "none";
  });
}

// Portfolyo başlatma fonksiyonu (şimdilik uyarı)
window.startPortfolio = function() {
  alert("Portfolyo özelliği yakında eklenecek!");
}

// Çıkış yap butonuna tıklanınca Firebase'den çıkış yap ve ana sayfaya yönlendir
const logoutBtn = document.getElementById('logoutButton');
if (logoutBtn) {
  logoutBtn.addEventListener('click', function(e) {
    e.preventDefault(); // Sayfa yenilenmesini engelle
    auth.signOut().then(() => {
      window.location.href = 'index.html'; // Ana sayfaya yönlendir
    }).catch((error) => {
      alert('Çıkış yapılırken hata oluştu: ' + error.message);
    });
  });
}

// --- İsim düzenleme ---
const editNameBtn = document.getElementById('editNameBtn');
const nameEditArea = document.getElementById('nameEditArea');
const saveNameBtn = document.getElementById('saveNameBtn');
const cancelNameBtn = document.getElementById('cancelNameBtn');
const profileName = document.getElementById('profileName');
const nameInput = document.getElementById('nameInput');

if (editNameBtn) {
  editNameBtn.addEventListener('click', function() {
    nameInput.value = profileName.textContent;
    profileName.style.display = 'none';
    editNameBtn.style.display = 'none';
    nameEditArea.style.display = 'block';
  });
}
if (saveNameBtn) {
  saveNameBtn.addEventListener('click', async function() {
    const newName = nameInput.value.trim();
    if (!newName) return alert('İsim boş olamaz!');
    const userId = localStorage.getItem('loggedInUserId');
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { name: newName });
      profileName.textContent = newName;
      profileName.style.display = 'block';
      editNameBtn.style.display = 'inline-block';
      nameEditArea.style.display = 'none';
      alert('İsim güncellendi!');
    } catch (error) {
      alert('Güncelleme sırasında hata oluştu: ' + error.message);
    }
  });
}
if (cancelNameBtn) {
  cancelNameBtn.addEventListener('click', function() {
    profileName.style.display = 'block';
    editNameBtn.style.display = 'inline-block';
    nameEditArea.style.display = 'none';
  });
}

// --- Profil fotoğrafı düzenleme ---
const editPhotoBtn = document.getElementById('editPhotoBtn');
const photoEditArea = document.getElementById('photoEditArea');
const savePhotoBtn = document.getElementById('savePhotoBtn');
const cancelPhotoBtn = document.getElementById('cancelPhotoBtn');
const profilePhoto = document.getElementById('profilePhoto');
const photoUrlInput = document.getElementById('photoUrlInput');
const photoFileInput = document.getElementById('photoFileInput');

if (editPhotoBtn) {
  editPhotoBtn.addEventListener('click', function() {
    photoEditArea.style.display = 'flex';
    editPhotoBtn.style.display = 'none';
  });
}
if (cancelPhotoBtn) {
  cancelPhotoBtn.addEventListener('click', function() {
    photoEditArea.style.display = 'none';
    editPhotoBtn.style.display = 'inline-block';
    photoUrlInput.value = '';
    photoFileInput.value = '';
  });
}
if (savePhotoBtn) {
  savePhotoBtn.addEventListener('click', async function() {
    let photoURL = photoUrlInput.value.trim();
    // Eğer dosya seçildiyse onu kullan (base64 olarak yükle)
    if (photoFileInput.files && photoFileInput.files[0]) {
      const file = photoFileInput.files[0];
      const reader = new FileReader();
      reader.onload = async function(e) {
        photoURL = e.target.result;
        await savePhoto(photoURL);
      };
      reader.readAsDataURL(file);
    } else if (photoURL) {
      await savePhoto(photoURL);
    } else {
      alert('Lütfen bir fotoğraf URLsi girin veya dosya seçin!');
    }
  });
}
// Fotoğrafı Firestore'a kaydet ve ekranda göster
async function savePhoto(photoURL) {
  const userId = localStorage.getItem('loggedInUserId');
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, { photoURL: photoURL });
    profilePhoto.src = photoURL;
    photoEditArea.style.display = 'none';
    editPhotoBtn.style.display = 'inline-block';
    photoUrlInput.value = '';
    photoFileInput.value = '';
    alert('Profil fotoğrafı güncellendi!');
  } catch (error) {
    alert('Fotoğraf güncellenirken hata oluştu: ' + error.message);
  }
}

// --- Portfolyo dosya yükleme özelliği ---
const portfolioFileInput = document.getElementById('portfolioFileInput');
const uploadPortfolioBtn = document.getElementById('uploadPortfolioBtn');
const portfolioFilesList = document.getElementById('portfolioFilesList');
let selectedPortfolioFiles = [];

if (portfolioFileInput) {
  portfolioFileInput.addEventListener('change', function() {
    selectedPortfolioFiles = Array.from(portfolioFileInput.files);
    showPortfolioFiles();
  });
}
if (uploadPortfolioBtn) {
  uploadPortfolioBtn.addEventListener('click', function() {
    if (selectedPortfolioFiles.length === 0) {
      alert('Lütfen önce dosya seçin!');
      return;
    }
    // Şimdilik sadece dosya adlarını ekranda gösteriyoruz
    showPortfolioFiles();
    alert('Dosyalar başarıyla yüklendi (simülasyon)!');
    // Gerçek yükleme için Firebase Storage veya başka bir sistem entegre edilebilir
  });
}
function showPortfolioFiles() {
  if (!portfolioFilesList) return;
  portfolioFilesList.innerHTML = '';
  selectedPortfolioFiles.forEach(file => {
    const div = document.createElement('div');
    div.textContent = file.name;
    div.style.color = '#43c6ff';
    div.style.marginBottom = '4px';
    portfolioFilesList.appendChild(div);
  });
} 