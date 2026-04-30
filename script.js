const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

const slideTrack = document.querySelector(".slide-track");
const slides = Array.from(document.querySelectorAll(".project-card"));
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".carousel-dots");

if (slideTrack && slides.length > 0 && prevButton && nextButton) {
  let currentSlide = 0;

  const dots = dotsContainer
    ? slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to project ${index + 1}`);
        dot.addEventListener("click", () => {
          currentSlide = index;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
        return dot;
      })
    : [];

  const updateCarousel = () => {
    slideTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  };

  const showNextSlide = () => {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
  };

  const showPreviousSlide = () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
  };

  nextButton.addEventListener("click", showNextSlide);
  prevButton.addEventListener("click", showPreviousSlide);

  updateCarousel();
}
