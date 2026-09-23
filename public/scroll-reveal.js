/* =============================================
   SCROLL REVEAL - Animações de entrada
============================================= */
(function() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // Observa todos os elementos com a classe 'reveal' ou elementos de seção
  const elements = document.querySelectorAll('.reveal, .secao-dividida, .secao-role, .cartao-animal, .card, .admin-entry, .stat, .fact, .pet-card, .step');
  elements.forEach(el => observer.observe(el));
})();

/* =============================================
   HEADER SCROLL EFFECT
============================================= */
(function() {
  const cabecalho = document.querySelector('.cabecalho, header .cabecalho');
  if (!cabecalho) return;
  window.addEventListener('scroll', () => {
    cabecalho.classList.toggle('scrolled', window.scrollY > 50);
  });
})();

/* =============================================
   SUAVIZAR LINKS ANCORADOS
============================================= */
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
