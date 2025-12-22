// mở modal khi click vào action-card
document.querySelectorAll('.action-card').forEach(card => {
  card.addEventListener('click', () => {
    const id = card.getAttribute('data-modal');
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
  });
});

// đóng modal khi click X hoặc nền tối
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal') ||
        e.target.classList.contains('modal-close')) {
      modal.classList.remove('show');
    }
  });
});

const comingLinks = document.querySelectorAll(
  '.coming-soon-link[data-coming-soon="true"]'
);
const comingModal = document.getElementById('comingSoonModal');
const comingClose = comingModal?.querySelector('.modal-coming-close');

comingLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault(); // không mở link
    if (comingModal) {
      comingModal.classList.add('show');
    }
  });
});

if (comingModal) {
  comingModal.addEventListener('click', function (e) {
    if (e.target === comingModal || e.target === comingClose) {
      comingModal.classList.remove('show');
    }
  });
}


