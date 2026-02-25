// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const db = getFirestore(app);

let isShowingAllProjects = false;

// Projeleri getir ve göster
async function loadProjects(showAll = false) {
  try {
    const projectsRef = collection(db, 'projects');
    const q = showAll 
      ? query(projectsRef, orderBy('createdAt', 'desc'))
      : query(projectsRef, orderBy('createdAt', 'desc'), limit(6));
    
    const querySnapshot = await getDocs(q);
    
    const projectsContainer = document.querySelector('.service-cards');
    if (!projectsContainer) {
      console.error('Proje kartları container\'ı bulunamadı');
      return;
    }
    
    projectsContainer.innerHTML = ''; // Mevcut içeriği temizle

    if (querySnapshot.empty) {
      projectsContainer.innerHTML = '<p class="no-projects">Henüz proje bulunmuyor.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const project = doc.data();
      const projectCard = createProjectCard(project);
      projectsContainer.appendChild(projectCard);
    });

    // Tüm projeleri gör butonunu güncelle
    updateViewAllButton(showAll, querySnapshot.size);

  } catch (error) {
    console.error("Projeler yüklenirken hata oluştu:", error);
    const projectsContainer = document.querySelector('.service-cards');
    if (projectsContainer) {
      projectsContainer.innerHTML = '<p class="error-message">Projeler yüklenirken bir hata oluştu.</p>';
    }
  }
}

// Tüm projeleri gör butonunu güncelle
function updateViewAllButton(showAll, totalProjects) {
  let viewAllButton = document.querySelector('.view-all-btn');
  
  if (!viewAllButton) {
    viewAllButton = document.createElement('button');
    viewAllButton.className = 'view-all-btn';
    document.querySelector('.services').appendChild(viewAllButton);
  }

  if (totalProjects <= 6) {
    viewAllButton.style.display = 'none';
    return;
  }

  viewAllButton.style.display = 'block';
  viewAllButton.textContent = showAll ? 'Daha Az Göster' : 'Tüm Projeleri Gör';
  
  viewAllButton.onclick = () => {
    isShowingAllProjects = !isShowingAllProjects;
    loadProjects(isShowingAllProjects);
  };
}

// Proje kartı oluştur
function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'card';
  
  card.innerHTML = `
    <div class="project-header">
      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Profil" class="project-avatar">
      <div class="project-info">
        <h3>${project.title}</h3>
        <p class="project-date">${new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
      </div>
    </div>
    <p class="project-description">${project.description}</p>
    <div class="project-skills">
      <strong>Gerekli Yetkinlikler:</strong> ${project.skills}
    </div>
    <button class="request-btn" data-email="${project.ownerEmail || 'm.kaganbayrak@gmail.com'}">Projeye Katılmayı Talep Et</button>
  `;

  // Talep butonuna tıklama olayı ekle
  const requestBtn = card.querySelector('.request-btn');
  requestBtn.addEventListener('click', () => {
    const email = requestBtn.dataset.email;
    const subject = encodeURIComponent(`${project.title} Projesi Hakkında`);
    const body = encodeURIComponent(`Merhaba,\n\n${project.title} projenize katılmak istiyorum. Detaylı bilgi alabilir miyim?\n\nSaygılarımla,`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  });
  
  return card;
}

// Sayfa yüklendiğinde projeleri getir
document.addEventListener('DOMContentLoaded', () => loadProjects(false));

// İlan eklendiğinde projeleri yeniden yükle
window.addEventListener('projectAdded', () => loadProjects(isShowingAllProjects));

// Kategori butonlarına tıklama eventi ekle
const categoryItems = document.querySelectorAll('.category-item');
categoryItems.forEach(item => {
  item.addEventListener('click', function() {
    const selectedCategory = this.textContent.trim();
    filterProjectsByCategory(selectedCategory);
    // Seçili kategoriye görsel vurgu ekle
    categoryItems.forEach(btn => btn.classList.remove('active-category'));
    this.classList.add('active-category');
  });
});

// Kategoriye göre projeleri filtrele ve göster
async function filterProjectsByCategory(category) {
  const projectsContainer = document.querySelector('#projects .service-cards');
  projectsContainer.innerHTML = '<div class="no-projects">Yükleniyor...</div>';
  // Firestore'dan sadece seçili kategoriye ait projeleri çek
  const q = query(collection(db, 'projects'), where('category', '==', category), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  projectsContainer.innerHTML = '';
  if (querySnapshot.empty) {
    projectsContainer.innerHTML = '<div class="no-projects">Bu kategoride henüz proje yok.</div>';
    return;
  }
  querySnapshot.forEach(docSnap => {
    const project = docSnap.data();
    // Burada mevcut kart oluşturma fonksiyonunu kullan
    const card = createProjectCard(project); // Eğer fonksiyonun farklıysa burayı güncelle
    projectsContainer.appendChild(card);
  });
} 