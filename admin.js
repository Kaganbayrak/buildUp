// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const ADMIN_EMAIL = 'm.kaganbayrak@gmail.com';

// Admin kontrolü
function checkAdminAccess() {
  const adminPanel = document.getElementById('adminPanel');
  if (!adminPanel) return;

  onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
      adminPanel.style.display = 'block';
      loadAllProjects();
    } else {
      adminPanel.style.display = 'none';
      window.location.href = '/'; // Admin değilse ana sayfaya yönlendir
    }
  });
}

// Tüm projeleri yükle
async function loadAllProjects() {
  try {
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const projectsContainer = document.getElementById('adminProjectsList');
    if (!projectsContainer) return;
    
    projectsContainer.innerHTML = '';

    // Toplam proje sayısını güncelle
    const totalProjects = querySnapshot.size;
    document.getElementById('totalProjects').textContent = totalProjects;

    if (querySnapshot.empty) {
      projectsContainer.innerHTML = '<p class="no-projects">Henüz proje bulunmuyor.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const project = doc.data();
      const projectCard = createAdminProjectCard(doc.id, project);
      projectsContainer.appendChild(projectCard);
    });

  } catch (error) {
    console.error("Projeler yüklenirken hata oluştu:", error);
    const projectsContainer = document.getElementById('adminProjectsList');
    if (projectsContainer) {
      projectsContainer.innerHTML = '<p class="error-message">Projeler yüklenirken bir hata oluştu.</p>';
    }
  }
}

// Admin proje kartı oluştur
function createAdminProjectCard(projectId, project) {
  const card = document.createElement('div');
  card.className = 'admin-card';
  
  card.innerHTML = `
    <div class="project-header">
      <div class="project-info">
        <h3>${project.title}</h3>
        <p class="project-date">${new Date(project.createdAt).toLocaleDateString('tr-TR')}</p>
        <p class="project-email">İlan Sahibi: ${project.ownerEmail || 'Belirtilmemiş'}</p>
      </div>
    </div>
    <p class="project-description">${project.description}</p>
    <div class="project-skills">
      <strong>Gerekli Yetkinlikler:</strong> ${project.skills}
    </div>
    <div class="admin-actions">
      <button class="delete-btn" data-project-id="${projectId}">İlanı Sil</button>
    </div>
  `;

  // Silme butonuna tıklama olayı ekle
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        card.remove();
        showMessage('İlan başarıyla silindi.', 'success');
        
        // Toplam proje sayısını güncelle
        const currentTotal = parseInt(document.getElementById('totalProjects').textContent);
        document.getElementById('totalProjects').textContent = currentTotal - 1;
      } catch (error) {
        console.error('İlan silinirken hata:', error);
        showMessage('İlan silinirken bir hata oluştu.', 'error');
      }
    }
  });
  
  return card;
}

// Mesaj gösterme fonksiyonu
function showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 3000);
}

// EmailJS ile e-posta göndermek yerine mailto linki ile e-posta gönder
function openMailClient(to, subject, body) {
  const mailtoLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink, '_blank');
}

// Mentor başvurularını yükle
async function loadMentorApplications() {
  try {
    const mentorAppsRef = collection(db, 'mentorApplications');
    const q = query(mentorAppsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const mentorAppsContainer = document.getElementById('mentorApplicationsList');
    if (!mentorAppsContainer) return;
    mentorAppsContainer.innerHTML = '';
    if (querySnapshot.empty) {
      mentorAppsContainer.innerHTML = '<p class="no-projects">Henüz mentor başvurusu yok.</p>';
      return;
    }
    querySnapshot.forEach((docSnap) => {
      const app = docSnap.data();
      const card = document.createElement('div');
      card.className = 'admin-card';
      card.innerHTML = `
        <div class="project-header">
          <div class="project-info">
            <h3>${app.name}</h3>
            <p class="project-date">${app.createdAt && app.createdAt.toDate ? app.createdAt.toDate().toLocaleDateString('tr-TR') : ''}</p>
            <p class="project-email">E-posta: ${app.email}</p>
          </div>
        </div>
        <p class="project-description">${app.about}</p>
        <div class="project-skills"><strong>Uzmanlıklar:</strong> ${app.expertise}</div>
        <div class="project-skills"><strong>Github:</strong> <a href="${app.github}" target="_blank">${app.github}</a></div>
        ${app.portfolio ? `<div class="project-skills"><strong>Portföy:</strong> <a href="${app.portfolio}" target="_blank">${app.portfolio}</a></div>` : ''}
        <div class="admin-actions">
          <button class="approve-btn" ${app.status === 'approved' || app.status === 'rejected' ? 'disabled' : ''}>Onayla</button>
          <button class="reject-btn" ${app.status === 'approved' || app.status === 'rejected' ? 'disabled' : ''}>Reddet</button>
          <span class="status-label">${app.status === 'pending' ? 'Beklemede' : app.status === 'approved' ? 'Onaylandı' : app.status === 'rejected' ? 'Reddedildi' : app.status}</span>
        </div>
      `;
      // Onayla butonu
      const approveBtn = card.querySelector('.approve-btn');
      const rejectBtn = card.querySelector('.reject-btn');
      approveBtn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'mentorApplications', docSnap.id), { status: 'approved' });
        // Mentor zaten ekli mi kontrol et
        const mentorRef = doc(db, 'mentors', docSnap.id);
        const mentorSnap = await getDoc(mentorRef);
        if (!mentorSnap.exists()) {
          await setDoc(mentorRef, {
            name: app.name,
            email: app.email,
            expertise: app.expertise,
            portfolio: app.portfolio,
            github: app.github,
            about: app.about,
            createdAt: app.createdAt || new Date(),
            status: 'active'
          });
        }
        openMailClient(app.email, 'Mentorlük Başvurunuz Onaylandı', `Tebrikler ${app.name}, mentorlük başvurunuz onaylandı! En kısa sürede sizinle iletişime geçeceğiz.`);
        showMessage('Başvuru onaylandı. Mentor koleksiyonuna eklendi. E-posta göndermek için e-posta uygulamanız açıldı.');
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        loadMentorApplications();
      });
      // Reddet butonu
      rejectBtn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'mentorApplications', docSnap.id), { status: 'rejected' });
        openMailClient(app.email, 'Mentorlük Başvurunuz Hakkında', `Merhaba ${app.name}, mentorlük başvurunuz bu aşamada uygun bulunmadı. İlginiz için teşekkür ederiz, ileride tekrar başvurabilirsiniz.`);
        showMessage('Başvuru reddedildi. E-posta göndermek için e-posta uygulamanız açıldı.');
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        loadMentorApplications();
      });
      mentorAppsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Mentor başvuruları yüklenirken hata oluştu:', error);
    const mentorAppsContainer = document.getElementById('mentorApplicationsList');
    if (mentorAppsContainer) {
      mentorAppsContainer.innerHTML = '<p class="error-message">Mentor başvuruları yüklenirken bir hata oluştu.</p>';
    }
  }
}

// Tüm onaylı başvuruları mentors koleksiyonuna ekle (eksik olanları)
async function syncApprovedMentors() {
  const mentorAppsRef = collection(db, 'mentorApplications');
  const q = query(mentorAppsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  for (const docSnap of querySnapshot.docs) {
    const app = docSnap.data();
    if (app.status === 'approved') {
      const mentorRef = doc(db, 'mentors', docSnap.id);
      const mentorSnap = await getDoc(mentorRef);
      if (!mentorSnap.exists()) {
        await setDoc(mentorRef, {
          name: app.name,
          email: app.email,
          expertise: app.expertise,
          portfolio: app.portfolio,
          github: app.github,
          about: app.about,
          createdAt: app.createdAt || new Date(),
          status: 'active'
        });
      }
    }
  }
}

// Sayfa yüklendiğinde admin kontrolü yap
document.addEventListener('DOMContentLoaded', async () => {
  checkAdminAccess();
  await syncApprovedMentors();
  loadMentorApplications();
}); 