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
const prevButton = document.querySelector(".prev-btn");
const nextButton = document.querySelector(".next-btn");
const dotsContainer = document.querySelector(".carousel-dots");

const createProjectCard = ({ href, title, image, imageAlt, imageClass = "" }) => {
  const card = document.createElement("a");
  card.href = href;
  card.className = "project-card";

  const img = document.createElement("img");
  img.src = image;
  img.alt = imageAlt || title;
  if (imageClass) {
    img.className = imageClass;
  }

  const overlay = document.createElement("div");
  overlay.className = "project-overlay";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const copy = document.createElement("p");
  copy.textContent = "Click to view project";

  overlay.append(heading, copy);
  card.append(img, overlay);

  return card;
};

const getProjectImage = (project) => {
  const explicitImage = project.dataset.projectImage;

  if (explicitImage) {
    return {
      src: explicitImage,
      alt: project.dataset.projectImageAlt || project.querySelector("h2, h3")?.textContent.trim() || "Project image",
      className: project.dataset.projectImageClass || "",
    };
  }

  const image = project.querySelector("img");

  return {
    src: image?.getAttribute("src") || "",
    alt: image?.getAttribute("alt") || project.querySelector("h2, h3")?.textContent.trim() || "Project image",
    className: image?.className || "",
  };
};

const getProjectsFromDocument = (doc) =>
  Array.from(doc.querySelectorAll("[data-carousel-project], .other-projects .project-info-card"))
    .map((project) => {
      const title = project.querySelector("h2, h3")?.textContent.trim();
      const id = project.dataset.projectId || project.id;
      const image = getProjectImage(project);

      if (!title || !id || !image.src) {
        return null;
      }

      return {
        href: `projects.html#${id}`,
        title,
        image: image.src,
        imageAlt: image.alt,
        imageClass: image.className,
      };
    })
    .filter(Boolean);

const populateCarouselFromProjects = async () => {
  if (!slideTrack || !window.DOMParser || window.location.protocol === "file:") {
    return;
  }

  try {
    const response = await fetch("projects.html", { cache: "no-cache" });

    if (!response.ok) {
      return;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const projects = getProjectsFromDocument(doc);

    if (projects.length > 0) {
      slideTrack.replaceChildren(...projects.map(createProjectCard));
    }
  } catch (error) {
    // Keep the static carousel cards if projects.html cannot be read locally.
  }
};

const initializeCarousel = () => {
  const originalSlides = Array.from(slideTrack.querySelectorAll(".project-card"));

  if (!slideTrack || !slider || originalSlides.length === 0 || !prevButton || !nextButton) {
    return;
  }

  dotsContainer?.replaceChildren();

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
};

if (slideTrack && slider && prevButton && nextButton) {
  populateCarouselFromProjects().finally(initializeCarousel);
}

const projectSections = Array.from(document.querySelectorAll(".project-detail-page[id]"));
const projectIds = new Set(projectSections.map((section) => section.id));
const projectSwitchLinks = Array.from(
  document.querySelectorAll(".project-switch-card[href^='#'], .other-projects a[href^='#']")
);

const setActiveProject = (projectId, updateHash = true) => {
  const activeProject = projectSections.find((section) => section.id === projectId);

  if (!activeProject) {
    return false;
  }

  projectSections.forEach((section) => {
    section.classList.toggle("active", section === activeProject);
  });

  projectSwitchLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${projectId}`);
  });

  activeProject.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });

  if (updateHash) {
    history.replaceState(null, "", `#${projectId}`);
  }

  return true;
};

const initialProjectId = window.location.hash.slice(1);

if (projectIds.has(initialProjectId)) {
  setActiveProject(initialProjectId, false);
}

document.querySelectorAll(".project-sidebar a[href^='#'], .other-projects a[href^='#'], .secondary-button[href^='#'], .project-switch-card[href^='#']").forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const projectId = targetId ? targetId.slice(1) : "";

    if (projectIds.has(projectId)) {
      event.preventDefault();
      setActiveProject(projectId);
      return;
    }

    const targetSection = targetId ? document.querySelector(targetId) : null;

    if (!targetSection) {
      return;
    }

    event.preventDefault();
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    history.replaceState(null, "", targetId);
  });
});
