import { db } from './firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

let allMentors = [];

document.addEventListener('DOMContentLoaded', () => {
  loadMentors();
  const searchInput = document.getElementById('mentorSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterMentors(this.value);
    });
  }
});

async function loadMentors() {
  const mentorsContainer = document.querySelector('#mentors .service-cards');
  if (!mentorsContainer) return;
  mentorsContainer.innerHTML = '';
  allMentors = [];
  try {
    const mentorsRef = collection(db, 'mentors');
    const q = query(mentorsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      mentorsContainer.innerHTML = '<div class="no-projects">Henüz öne çıkan mentor yok.</div>';
      return;
    }
    for (const docSnap of querySnapshot.docs) {
      const mentor = docSnap.data();
      allMentors.push(mentor);
    }
    renderMentors(allMentors);
  } catch (error) {
    mentorsContainer.innerHTML = '<div class="error-message">Mentorlar yüklenirken bir hata oluştu.</div>';
    console.error('Mentorlar yüklenirken hata:', error);
  }
}

function filterMentors(searchText) {
  searchText = searchText.trim().toLowerCase();
  const filtered = allMentors.filter(mentor =>
    (mentor.name && mentor.name.toLowerCase().includes(searchText)) ||
    (mentor.expertise && mentor.expertise.toLowerCase().includes(searchText)) ||
    (mentor.about && mentor.about.toLowerCase().includes(searchText))
  );
  renderMentors(filtered);
}

async function renderMentors(mentors) {
  const mentorsContainer = document.querySelector('#mentors .service-cards');
  mentorsContainer.innerHTML = '';
  if (mentors.length === 0) {
    mentorsContainer.innerHTML = '<div class="no-projects">Aradığınız kritere uygun mentor bulunamadı.</div>';
    return;
  }
  for (const mentor of mentors) {
    const card = await createMentorCard(mentor);
    mentorsContainer.appendChild(card);
  }
}

// Mentor kartı oluştururken GitHub API'den veri çek
async function createMentorCard(mentor) {
  let githubUsername = '';
  try {
    githubUsername = mentor.github.split('github.com/')[1].replace('/', '').trim();
  } catch (e) {}

  let githubData = {};
  if (githubUsername) {
    try {
      const res = await fetch(`https://api.github.com/users/${githubUsername}`);
      githubData = await res.json();
    } catch (e) {}
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${githubData.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="${mentor.name}">
    <h3>${mentor.name}</h3>
    <p>${mentor.about || ''}</p>
    <div class="mentor-info-table">
      <div class="mentor-info-row"><span class="label">Uzmanlıklar:</span><span class="value">${mentor.expertise || '-'}</span></div>
      <div class="mentor-info-row"><span class="label">Github:</span><span class="value">${mentor.github ? `<a href="${mentor.github}" target="_blank">${mentor.github}</a>` : '-'}</span></div>
      <div class="mentor-info-row"><span class="label">Portföy:</span><span class="value">${mentor.portfolio ? `<a href="${mentor.portfolio}" target="_blank">${mentor.portfolio}</a>` : '-'}</span></div>
      <div class="mentor-info-row"><span class="label">Bio:</span><span class="value">${githubData.bio || '-'}</span></div>
      <div class="mentor-info-row"><span class="label">Takipçi:</span><span class="value">${githubData.followers || 0}</span></div>
      <div class="mentor-info-row"><span class="label">Repo:</span><span class="value">${githubData.public_repos || 0}</span></div>
    </div>
  `;
  return card;
}

// Basit md5 fonksiyonu (Gravatar için)
function md5(str) {
  return CryptoJS.MD5(str.trim().toLowerCase()).toString();
} 