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
const slider = document.querySelector(".project-slider");
const originalSlides = Array.from(document.querySelectorAll(".project-card"));
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".carousel-dots");

if (slideTrack && slider && originalSlides.length > 0 && prevButton && nextButton) {
  const slideCount = originalSlides.length;
  let trackIndex = slideCount;

  const dots = dotsContainer
    ? originalSlides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Go to project ${index + 1}`);
        dot.addEventListener("click", () => {
          trackIndex = slideCount + index;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
        return dot;
      })
    : [];

  const beforeClones = originalSlides.map((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });

  const afterClones = originalSlides.map((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  });

  beforeClones
    .slice()
    .reverse()
    .forEach((clone) => slideTrack.insertBefore(clone, slideTrack.firstChild));
  afterClones.forEach((clone) => slideTrack.appendChild(clone));

  const slides = Array.from(slideTrack.querySelectorAll(".project-card"));

  const getOriginalIndex = () => (trackIndex - slideCount + slideCount) % slideCount;

  const updateCarousel = (animate = true) => {
    slideTrack.style.transition = animate ? "" : "none";

    const activeSlide = slides[trackIndex];
    const centeredOffset =
      activeSlide.offsetLeft + activeSlide.offsetWidth / 2 - slider.clientWidth / 2;

    slideTrack.style.transform = `translateX(${-centeredOffset}px)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === getOriginalIndex());
    });

    if (!animate) {
      slideTrack.offsetHeight;
      slideTrack.style.transition = "";
    }
  };

  const showNextSlide = () => {
    trackIndex += 1;
    updateCarousel();
  };

  const showPreviousSlide = () => {
    trackIndex -= 1;
    updateCarousel();
  };

  nextButton.addEventListener("click", showNextSlide);
  prevButton.addEventListener("click", showPreviousSlide);
  const centerActiveSlide = () => updateCarousel(false);

  window.addEventListener("resize", centerActiveSlide);
  window.addEventListener("load", centerActiveSlide);
  slideTrack.addEventListener("transitionend", () => {
    if (trackIndex >= slideCount * 2) {
      trackIndex -= slideCount;
      updateCarousel(false);
    }

    if (trackIndex < slideCount) {
      trackIndex += slideCount;
      updateCarousel(false);
    }
  });

  centerActiveSlide();
  requestAnimationFrame(centerActiveSlide);
}
