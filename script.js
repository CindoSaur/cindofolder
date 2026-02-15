const closeSound = new Audio("sound/iceberguser.mp3");
closeSound.volume = 0.1;

const openSound = new Audio("sound/iceberguser.mp3");
openSound.volume = 0.2;

/* WORK MODAL */
const aboutMoreBtn = document.getElementById("aboutMoreBtn");
const workModal = document.getElementById("workModal");
const workClose = document.querySelector(".modal-work-close");

if (aboutMoreBtn) {
  aboutMoreBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openSound.currentTime = 0;
    openSound.play();
    workModal.classList.add("show");
  });
}

if (workClose) {
  workClose.addEventListener("click", () => {
    closeSound.currentTime = 0;
    closeSound.play();
    workModal.classList.remove("show");
  });
}

if (workModal) {
  workModal.addEventListener("click", (e) => {
    if (e.target === workModal) {
      closeSound.currentTime = 0;
      closeSound.play();
      workModal.classList.remove("show");
    }
  });
}

/* DRAG WORK MODAL */
const modalContainer = document.querySelector(".modal-work-container");
const modalHeader = document.querySelector(".modal-work-header");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

if (modalHeader && modalContainer) {
  modalHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - modalContainer.offsetLeft;
    offsetY = e.clientY - modalContainer.offsetTop;
    modalContainer.style.position = "absolute";
  });
}

document.addEventListener("mousemove", (e) => {
  if (!isDragging || !modalContainer) return;
  modalContainer.style.left = e.clientX - offsetX + "px";
  modalContainer.style.top = e.clientY - offsetY + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

/* IMAGE PREVIEW */
const galleryImgs = document.querySelectorAll(".draw-gallery img");
const preview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const previewClose = document.querySelector(".image-preview-close");

galleryImgs.forEach(img => {
  img.addEventListener("click", () => {
    openSound.currentTime = 0;
    openSound.play();
    if (preview && previewImg) {
      preview.style.display = "flex";
      previewImg.src = img.src;
    }
  });
});

if (preview && previewClose) {
  previewClose.addEventListener("click", () => {
    closeSound.currentTime = 0;
    closeSound.play();
    preview.style.display = "none";
  });

  preview.addEventListener("click", (e) => {
    if (e.target === preview) {
      closeSound.currentTime = 0;
      closeSound.play();
      preview.style.display = "none";
    }
  });
}

/* NAV MODALS */
const navCards = document.querySelectorAll(".nav-card");
const navModals = document.querySelectorAll(".modal-nav");
const navCloses = document.querySelectorAll(".modal-nav-close");

navCards.forEach(card => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const modalId = card.dataset.modal;
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      openSound.currentTime = 0;
      openSound.play();
      targetModal.classList.add("show");
    }
  });
});

navCloses.forEach(btn => {
  btn.addEventListener("click", () => {
    const modal = btn.closest(".modal-nav");
    if (modal) {
      closeSound.currentTime = 0;
      closeSound.play();
      modal.classList.remove("show");
    }
  });
});

navModals.forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeSound.currentTime = 0;
      closeSound.play();
      modal.classList.remove("show");
    }
  });
});

/* click icon-item (icon + text) mở link */
document.addEventListener("click", (e) => {
  const iconItem = e.target.closest(".icon-item");
  if (!iconItem) return;
  const link = iconItem.dataset.link;
  if (link && link !== "#") {
    window.open(link, "_blank");
  }
});

/* DRAG NAV MODALS */
let navDragging = false;
let navOffsetX = 0;
let navOffsetY = 0;
let currentNavContainer = null;

const navHeaders = document.querySelectorAll(".modal-nav-header");

navHeaders.forEach(header => {
  header.addEventListener("mousedown", (e) => {
    const container = header.parentElement;
    if (!container) return;
    navDragging = true;
    currentNavContainer = container;
    navOffsetX = e.clientX - container.offsetLeft;
    navOffsetY = e.clientY - container.offsetTop;
    container.style.position = "absolute";
  });
});

document.addEventListener("mousemove", (e) => {
  if (!navDragging || !currentNavContainer) return;
  currentNavContainer.style.left = e.clientX - navOffsetX + "px";
  currentNavContainer.style.top = e.clientY - navOffsetY + "px";
});

document.addEventListener("mouseup", () => {
  navDragging = false;
  currentNavContainer = null;
});

/* ESC CLOSE */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (workModal) workModal.classList.remove("show");
    navModals.forEach(m => m.classList.remove("show"));
    if (preview) preview.style.display = "none";
  }
});
