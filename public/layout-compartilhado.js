(function () {
  function configurar() {
    const usuario = JSON.parse(localStorage.getItem('abrigo_usuario') || 'null');
    const principal = document.querySelector('.botao-cabecalho');
    const perfil = document.querySelector('.botao-perfil');
    if (principal) {
      principal.textContent = usuario ? 'Adotar' : 'Entrar';
      principal.href = usuario ? '/animais.html' : '/login.html';
    }
    if (perfil) {
      perfil.textContent = 'Meu perfil';
      perfil.href = usuario ? '/perfil.html' : '/login.html';
    }
    const menu = document.querySelector('#botao-menu');
    const nav = document.querySelector('#navegacao');
    if (menu && nav) {
      const fechar = () => {
        nav.classList.remove('aberto');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Abrir menu');
      };
      menu.addEventListener('click', () => {
        const aberto = nav.classList.toggle('aberto');
        menu.setAttribute('aria-expanded', String(aberto));
        menu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      });
      nav.addEventListener('click', (evento) => {
        if (evento.target.closest('a')) fechar();
      });
      addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') fechar();
      });
    }
    const cabecalho = document.querySelector('.cabecalho');
    if (cabecalho) addEventListener('scroll', () => cabecalho.classList.toggle('scrolled', scrollY > 24), { passive: true });
    const copiar = document.querySelector('#botao-copiar-pix');
    if (copiar) copiar.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(document.querySelector('#chave-pix').textContent);
        const texto = copiar.querySelector('span');
        texto.textContent = 'Chave copiada';
        setTimeout(() => texto.textContent = 'Copiar chave', 2200);
      } catch {}
    });
  }

  fetch('/')
    .then(resposta => resposta.text())
    .then(html => {
      const inicio = new DOMParser().parseFromString(html, 'text/html');
      const cabecalho = inicio.querySelector('header.cabecalho');
      const rodape = inicio.querySelector('footer.rodape');
      const atualCabecalho = document.querySelector('body > header');
      const atualRodape = document.querySelector('body > footer');
      if (cabecalho) {
        const novo = cabecalho.cloneNode(true);
        if (atualCabecalho) atualCabecalho.replaceWith(novo);
        else document.body.prepend(novo);
      }
      if (rodape) {
        const novo = rodape.cloneNode(true);
        if (atualRodape) atualRodape.replaceWith(novo);
        else document.body.append(novo);
      }
      configurar();
    });
})();
