(() => {
  const extras = JSON.parse(localStorage.getItem('abrigo_animais_admin') || '[]');
  if (!extras.length) return;
  const adicionar = () => {
    const grade = document.querySelector('#grid');
    if (!grade || grade.dataset.adminExtras) return;
    grade.dataset.adminExtras = 'true';
    extras.forEach((animal) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `<img class="photo" src="${animal.foto || '/assets/images/cao-card.png'}" alt="${animal.nome}"><div class="meta"><span class="tag">Novo no catálogo</span><span>${animal.idade} · ${animal.sexo}</span></div><h3>${animal.nome}</h3><p class="desc">${animal.descricao}</p><div class="meta"><span class="tag">${animal.porte}</span></div><a class="details" href="/solicitacao.html?tipo=adocao&pet=${encodeURIComponent(animal.nome)}">Quero adotar ${animal.nome}</a>`;
      grade.appendChild(card);
    });
  };
  setTimeout(adicionar, 700);
})();
