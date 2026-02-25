import { db } from './firebase.js';
import { addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Mentor başvuru formu gönderimi
const mentorApplyButton = document.getElementById('mentorApplyButton');
if (mentorApplyButton) {
  mentorApplyButton.addEventListener('click', async function(event) {
    event.preventDefault();
    const name = document.getElementById('mentorName').value.trim();
    const email = document.getElementById('mentorEmail').value.trim();
    const expertise = document.getElementById('mentorExpertise').value.trim();
    const portfolio = document.getElementById('mentorPortfolio').value.trim();
    const github = document.getElementById('mentorGithub').value.trim();
    const about = document.getElementById('mentorAbout').value.trim();
    const messageDiv = document.getElementById('mentorApplyMessage');

    // Temel validasyon
    if (!name || !email || !expertise || !github || !about) {
      messageDiv.textContent = 'Lütfen tüm zorunlu alanları doldurun.';
      messageDiv.style.display = 'block';
      return;
    }

    messageDiv.textContent = 'Başvurunuz gönderiliyor...';
    messageDiv.style.display = 'block';

    try {
      // Firestore'a başvuru kaydı
      await addDoc(collection(db, 'mentorApplications'), {
        name,
        email,
        expertise,
        portfolio,
        github,
        about,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      messageDiv.textContent = 'Başvurunuz başarıyla gönderildi!';
      messageDiv.style.display = 'block';
      alert('Başvurunuz başarıyla gönderildi!');
      // Formu temizle
      document.getElementById('mentorName').value = '';
      document.getElementById('mentorEmail').value = '';
      document.getElementById('mentorExpertise').value = '';
      document.getElementById('mentorPortfolio').value = '';
      document.getElementById('mentorGithub').value = '';
      document.getElementById('mentorAbout').value = '';
    } catch (error) {
      console.error('Başvuru gönderilemedi:', error);
      messageDiv.textContent = 'Başvuru gönderilirken bir hata oluştu.';
      messageDiv.style.display = 'block';
    }
  });
} 