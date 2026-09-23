const dbKey='abrigo_contas_demo',reqKey='abrigo_solicitacoes_demo';
function contas(){const lista=JSON.parse(localStorage.getItem(dbKey)||'[]');if(!lista.some(x=>x.email==='demo@abrigojoinville.org.br'))lista.push({nome:'Visitante do Abrigo',telefone:'(47) 99999-8888',email:'demo@abrigojoinville.org.br',senha:'abrigo123'});if(!lista.some(x=>x.email==='admin@abrigo.com.br'))lista.push({nome:'Administração do Abrigo',telefone:'(47) 99999-8888',email:'admin@abrigo.com.br',senha:'123456',admin:true});localStorage.setItem(dbKey,JSON.stringify(lista));return lista}
function salvarContas(lista){localStorage.setItem(dbKey,JSON.stringify(lista))}
function usuarioAtual(){try{return JSON.parse(localStorage.getItem('abrigo_usuario')||'null')}catch{return null}}
function notice(message,error=false){const e=document.querySelector('#alert');if(!e)return;e.textContent=message;e.className='alert'+(error?' error':'');e.style.display='block'}
function exigirLogin(destino=location.href){if(!usuarioAtual()){location.href='/login.html?voltar='+encodeURIComponent(destino);return false}return true}
function sair(){localStorage.removeItem('abrigo_usuario');location.href='/login.html'}
function salvarSolicitacao(item){const lista=JSON.parse(localStorage.getItem(reqKey)||'[]');lista.unshift(item);localStorage.setItem(reqKey,JSON.stringify(lista))}
function minhasSolicitacoes(){const u=usuarioAtual();return JSON.parse(localStorage.getItem(reqKey)||'[]').filter(x=>x.email===u?.email)}


function inicializarDadosExemplo(){
  const ler=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};
  const garantir=(chave,exemplos)=>{const lista=ler(chave); exemplos.forEach(exemplo=>{if(!lista.some(item=>item.id===exemplo.id))lista.push(exemplo)}); localStorage.setItem(chave,JSON.stringify(lista));};
  garantir('abrigo_animais_admin',[
    {id:'exemplo-animal-bento',nome:'Bento',idade:'7 anos',sexo:'Macho',porte:'Médio',vacinado:'sim',castrado:'sim',descricao:'Bento é tranquilo, companheiro e adora um passeio calmo.',foto:'/assets/images/cao-card.png'},
    {id:'exemplo-animal-lola',nome:'Lola',idade:'10 anos',sexo:'Fêmea',porte:'Pequeno',vacinado:'sim',castrado:'sim',descricao:'Lola é uma cadelinha idosa, doce e muito carinhosa.',foto:'/assets/images/cao-card.png'}
  ]);
  garantir('abrigo_solicitacoes_demo',[
    {id:'exemplo-adocao-1',tipo:'adocao',pet:'Bento',nomeUsuario:'Mariana Souza',email:'mariana.exemplo@teste.com',telefone:'(47) 99911-2233',cpf:'123.456.789-00',endereco:'Rua das Flores, 120 - Centro, Joinville',cep:'89201-000',mensagem:'Tenho uma rotina tranquila e gostaria de conhecer o Bento.',status:'Recebida',data:'20/09/2026'},
    {id:'exemplo-adocao-2',tipo:'adocao',pet:'Lola',nomeUsuario:'Rafael Lima',email:'rafael.exemplo@teste.com',telefone:'(47) 98877-6655',cpf:'987.654.321-00',endereco:'Rua do Sol, 45 - América, Joinville',cep:'89204-100',mensagem:'Minha família está preparada para dar muito carinho à Lola.',status:'Em análise',data:'19/09/2026'},
    {id:'exemplo-apadrinhamento-1',tipo:'apadrinhamento',pet:'Lola',nomeUsuario:'Ana Martins',email:'ana.exemplo@teste.com',telefone:'(47) 99742-1100',cpf:'321.654.987-00',endereco:'Rua das Palmeiras, 78 - Saguaçu, Joinville',cep:'89221-000',mensagem:'Quero ajudar com os cuidados mensais da Lola.',status:'Recebida',data:'20/09/2026'},
    {id:'exemplo-apadrinhamento-2',tipo:'apadrinhamento',pet:'Bento',nomeUsuario:'Carlos Pereira',email:'carlos.exemplo@teste.com',telefone:'(47) 99120-8877',cpf:'456.789.123-00',endereco:'Rua da Paz, 360 - Anita Garibaldi, Joinville',cep:'89203-320',mensagem:'Gostaria de ser padrinho do Bento e acompanhar sua história.',status:'Em análise',data:'18/09/2026'}
  ]);
}
contas();inicializarDadosExemplo();
