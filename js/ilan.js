// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// Modal fonksiyonlarını global scope'a ekle
window.closeModal = function(id) {
  document.getElementById(id).style.display = "none";
};

const publishButton = document.getElementById('publishProjectButton');

if (publishButton) {
  publishButton.addEventListener('click', async () => {
    const title = document.getElementById('projectTitle').value.trim();
    const description = document.getElementById('projectDescription').value.trim();
    const skills = document.getElementById('projectSkills').value.trim();
    const category = document.getElementById('projectCategory').value.trim();
    const ownerEmail = auth.currentUser?.email || 'm.kaganbayrak@gmail.com';

    if (!title || !description || !skills || !category) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    // Firebase'den mevcut kullanıcıyı al
    const user = auth.currentUser;
    if (!user) {
      alert("Lütfen önce giriş yapın!");
      return;
    }

    try {
      // Create a new project in Firestore
      const projectsRef = collection(db, 'projects');
      
      // Project data to be stored
      const projectData = {
        title: title,
        description: description,
        skills: skills,
        category: category,
        userId: user.uid,
        ownerEmail: ownerEmail,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Save the project data to Firestore
      await addDoc(projectsRef, projectData);

      alert('Proje başarıyla oluşturuldu!');
      window.closeModal('postAdModal');
      
      // Yeni proje eklendiğinde event tetikle
      window.dispatchEvent(new Event('projectAdded'));
    } catch (err) {
      console.error('Hata:', err);
      alert('Hata oluştu: ' + err.message);
    }
  });
}

// İlan oluşturma fonksiyonu
async function createProject(event) {
  event.preventDefault();
  
  const title = document.getElementById('projectTitle').value;
  const description = document.getElementById('projectDescription').value;
  const skills = document.getElementById('projectSkills').value;
  const category = document.getElementById('projectCategory').value;
  const ownerEmail = auth.currentUser?.email || 'm.kaganbayrak@gmail.com'; // Kullanıcının e-posta adresini al

  if (!title || !description || !skills || !category) {
    showMessage('Lütfen tüm alanları doldurun.');
    return;
  }

  try {
    const projectData = {
      title,
      description,
      skills,
      category,
      ownerEmail, // İlan sahibinin e-posta adresini ekle
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'projects'), projectData);
    
    showMessage('İlan başarıyla oluşturuldu!');
    document.getElementById('projectForm').reset();
    
    // Projelerin yeniden yüklenmesi için event tetikle
    window.dispatchEvent(new Event('projectAdded'));
    
  } catch (error) {
    console.error('İlan oluşturulurken hata:', error);
    showMessage('İlan oluşturulurken bir hata oluştu.');
  }
}