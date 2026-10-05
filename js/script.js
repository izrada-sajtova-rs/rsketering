// Nav bar
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".mobile-toggle")
  const navMenu = document.querySelector(".nav-menu")

  const closeNav = () => {
    navMenu.classList.remove("open")
    toggleButton.classList.remove("open")
    toggleButton.setAttribute("aria-expanded", "false")
    document.documentElement.classList.remove("nav-locked")
    document.body.classList.remove("nav-locked")
  }

  if (toggleButton && navMenu) {
    toggleButton.setAttribute("aria-expanded", "false")
    toggleButton.setAttribute("aria-label", "Otvori navigaciju")
    if (!navMenu.id) {
      navMenu.id = "primary-menu"
    }
    toggleButton.setAttribute("aria-controls", navMenu.id)

    toggleButton.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open")
      toggleButton.classList.toggle("open", isOpen)
      toggleButton.setAttribute("aria-expanded", String(isOpen))
      document.documentElement.classList.toggle("nav-locked", isOpen)
      document.body.classList.toggle("nav-locked", isOpen)
    })

    document.addEventListener("click", (event) => {
      if (!navMenu.contains(event.target) && !toggleButton.contains(event.target) && navMenu.classList.contains("open")) {
        closeNav()
      }
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("open")) closeNav()
    })
  }

  // Floating Call Button - now using anchor with href and onclick
  const callBtn = document.getElementById("call-btn")

  // Floating Music Button
  const musicBtn = document.getElementById("music-btn")
  const keteringMusic = document.getElementById("ketering-music")

  if (musicBtn && keteringMusic) {
    musicBtn.setAttribute("aria-label", "Pusti ili zaustavi muziku")
    musicBtn.setAttribute("aria-pressed", "false")

    musicBtn.addEventListener("click", () => {
      if (keteringMusic.paused) {
        const started = keteringMusic.play()
        if (started && started.catch) started.catch(() => {})
      } else {
        keteringMusic.pause()
      }
    })

    // Stanje dugmeta prati stvarno stanje audio elementa
    const syncMusicBtn = () => {
      const playing = !keteringMusic.paused
      musicBtn.classList.toggle("playing", playing)
      musicBtn.setAttribute("aria-pressed", String(playing))
    }
    keteringMusic.addEventListener("play", syncMusicBtn)
    keteringMusic.addEventListener("pause", syncMusicBtn)
  }

  // Show/Hide Floating Buttons on Scroll
  let floatingVisible = false
  const updateFloating = () => {
    const shouldShow = window.scrollY > 500
    if (shouldShow === floatingVisible) return
    floatingVisible = shouldShow
    if (callBtn) callBtn.classList.toggle("visible", shouldShow)
    if (musicBtn) musicBtn.classList.toggle("visible", shouldShow)
  }
  window.addEventListener("scroll", updateFloating, { passive: true })
  updateFloating()

  // FAQ Toggle
  const faqItems = document.querySelectorAll(".faq-item")
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.setAttribute("aria-expanded", "false")
    button.addEventListener("click", () => {
      const faqItem = button.parentElement
      const isActive = faqItem.classList.contains("active")

      faqItems.forEach((item) => {
        item.classList.remove("active")
        const q = item.querySelector(".faq-question")
        if (q) q.setAttribute("aria-expanded", "false")
      })

      if (!isActive) {
        faqItem.classList.add("active")
        button.setAttribute("aria-expanded", "true")
      }
    })
  })

  // Animated Counter for Statistics
  const animateCounter = (element, target, duration = 2000) => {
    const start = performance.now()
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      element.textContent = Math.ceil(progress * target)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  const statNumbers = document.querySelectorAll(".stat-number")
  if (statNumbers.length > 0) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = parseInt(entry.target.getAttribute("data-target"), 10)
          if (!isNaN(target)) animateCounter(entry.target, target)
          observer.unobserve(entry.target)
        })
      }, { threshold: 0.5 })

      statNumbers.forEach((stat) => observer.observe(stat))
    } else {
      statNumbers.forEach((stat) => {
        stat.textContent = stat.getAttribute("data-target")
      })
    }
  }

  // Gallery
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item")).filter((item) => item.querySelector("img"))

  if (galleryItems.length > 0) {
    const lightbox = document.createElement("div")
    lightbox.className = "lightbox"
    lightbox.setAttribute("role", "dialog")
    lightbox.setAttribute("aria-modal", "true")
    lightbox.setAttribute("aria-label", "Galerija slika")

    // Create Lightbox structure
    lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Zatvori">&times;</button>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Prethodna slika">&#10094;</button>
    <div class="lightbox-content">
      <img alt="">
    </div>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Sledeća slika">&#10095;</button>
  `
    document.body.appendChild(lightbox)

    const lightboxImg = lightbox.querySelector("img")
    const closeBtn = lightbox.querySelector(".lightbox-close")
    const prevBtn = lightbox.querySelector(".lightbox-prev")
    const nextBtn = lightbox.querySelector(".lightbox-next")

    let currentIndex = 0

    // Bira varijantu iz <picture> koja odgovara ekranu (lazy slike još nemaju currentSrc)
    const pickSource = (img) => {
      const picture = img.closest("picture")
      if (picture) {
        const sources = picture.querySelectorAll("source[srcset]")
        for (const source of sources) {
          if (!source.media || window.matchMedia(source.media).matches) {
            return source.srcset.split(",")[0].trim().split(/\s+/)[0]
          }
        }
      }
      return img.currentSrc || img.src
    }

    const updateLightboxImage = () => {
      const img = galleryItems[currentIndex].querySelector("img")
      lightboxImg.src = pickSource(img)
      lightboxImg.alt = img.alt || ""
    }

    const closeLightbox = () => {
      lightbox.classList.remove("active")
      document.body.style.overflow = ""
    }

    const showPrev = () => {
      currentIndex = currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1
      updateLightboxImage()
    }

    const showNext = () => {
      currentIndex = currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1
      updateLightboxImage()
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        currentIndex = index
        updateLightboxImage()
        lightbox.classList.add("active")
        document.body.style.overflow = "hidden"
      })
    })

    closeBtn.addEventListener("click", closeLightbox)

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox()
    })

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      showPrev()
    })

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      showNext()
    })

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") showPrev()
      if (e.key === "ArrowRight") showNext()
    })
  }

  // Praćenje klikova na .trackcall dugmad - slanje na eksterni server
  document.querySelectorAll(".trackcall").forEach(function (el) {
    el.addEventListener("click", function () {
      const payload = JSON.stringify({
        time: new Date().toISOString(),
        call: 1
      });

      fetch("https://bobanwebmaker.com/private/rsketering.php", {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
        keepalive: true
      }).catch(() => {});
    });
  });
})
