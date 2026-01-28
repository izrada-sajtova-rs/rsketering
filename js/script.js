// Nav bar
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.querySelector(".mobile-toggle")
  const navMenu = document.querySelector(".nav-menu")

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
  }

  document.addEventListener("click", (event) => {
    if (!navMenu || !toggleButton) return

    if (!navMenu.contains(event.target) && !toggleButton.contains(event.target) && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open")
      toggleButton.classList.remove("open")
      toggleButton.setAttribute("aria-expanded", "false")
      document.documentElement.classList.remove("nav-locked")
      document.body.classList.remove("nav-locked")
    }
  })

  // Floating Call Button - now using anchor with href and onclick
  const callBtn = document.getElementById("call-btn")

  // Floating Music Button
  const musicBtn = document.getElementById("music-btn")
  const keteringMusic = document.getElementById("ketering-music")
  let musicPlaying = false

  if (musicBtn && keteringMusic) {
    musicBtn.addEventListener("click", () => {
      if (musicPlaying) {
        keteringMusic.pause()
        musicBtn.classList.remove("playing")
        musicPlaying = false
      } else {
        keteringMusic.play()
        musicBtn.classList.add("playing")
        musicPlaying = true
      }
    })
  }

  // Show/Hide Floating Buttons on Scroll
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY
    const threshold = 500

    if (scrolled > threshold) {
      if (callBtn) callBtn.classList.add("visible")
      if (musicBtn) musicBtn.classList.add("visible")
    } else {
      if (callBtn) callBtn.classList.remove("visible")
      if (musicBtn) musicBtn.classList.remove("visible")
    }
  })

  // FAQ Toggle
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const faqItem = button.parentElement;
      const isActive = faqItem.classList.contains('active');
      
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });
      
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });

  // Animated Counter for Statistics
  const animateCounter = (element, target, duration = 2000) => {
    let current = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = Math.ceil(target);
        clearInterval(timer);
      } else {
        element.textContent = Math.ceil(current);
      }
    }, 16);
  };

  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        animateCounter(entry.target, target);
        entry.target.classList.add('animated');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.stat-number').forEach(stat => {
    observer.observe(stat);
  });
// Gallery
  const galleryItems = document.querySelectorAll(".gallery-item")
  const lightbox = document.createElement("div")
  lightbox.className = "lightbox"

  // Create Lightbox structure
  lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <button class="lightbox-nav lightbox-prev" type="button" aria-label="Prethodna slika">&#10094;</button>
    <div class="lightbox-content">
      <img src="/placeholder.svg" alt="Gallery Preview">
    </div>
    <button class="lightbox-nav lightbox-next" type="button" aria-label="Sledeća slika">&#10095;</button>
  `
  document.body.appendChild(lightbox)

  const lightboxImg = lightbox.querySelector("img")
  const closeBtn = lightbox.querySelector(".lightbox-close")
  const prevBtn = lightbox.querySelector(".lightbox-prev")
  const nextBtn = lightbox.querySelector(".lightbox-next")

  let currentIndex = 0

  const images = Array.from(galleryItems).map((item) => {
    const img = item.querySelector("img")
    return img.src
  })

  if (galleryItems.length > 0) {
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
      currentIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
      updateLightboxImage()
    })

    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      currentIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1
      updateLightboxImage()
    })

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("active")) return
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prevBtn.click()
      if (e.key === "ArrowRight") nextBtn.click()
    })
  }

  function updateLightboxImage() {
    lightboxImg.src = images[currentIndex]
  }

  function closeLightbox() {
    lightbox.classList.remove("active")
    document.body.style.overflow = ""
  }

  // Slow, infinite favicon rotation
  const startFaviconSpin = () => {
    const baseLink = document.querySelector('link[rel~="icon"][sizes="32x32"]') || document.querySelector('link[rel~="icon"]')
    if (!baseLink) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = baseLink.href

    img.onload = () => {
      const size = img.naturalWidth || 32
      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")

      let angle = 0
      let lastTime = performance.now()
      const speed = (Math.PI * 2) / 8000 // one full spin every 8s

      const render = (timestamp) => {
        const delta = timestamp - lastTime
        lastTime = timestamp
        angle = (angle + delta * speed) % (Math.PI * 2)

        ctx.clearRect(0, 0, size, size)
        ctx.save()
        ctx.translate(size / 2, size / 2)
        ctx.rotate(angle)
        ctx.drawImage(img, -size / 2, -size / 2, size, size)
        ctx.restore()

        baseLink.href = canvas.toDataURL("image/png")
        requestAnimationFrame(render)
      }

      requestAnimationFrame(render)
    }
  }

  startFaviconSpin()
})

// Praćenje klikova na .trackcall dugmad - slanje na eksterni server
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.trackcall').forEach(function (el) {
    el.addEventListener('click', function () {
      const data = {
        time: new Date().toISOString(),
        call: 1
      };
      fetch('https://bobanwebmaker.com/private/rsketering.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    });
  });
});

