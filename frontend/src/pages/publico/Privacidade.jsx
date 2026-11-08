import './paginas.css';

export default function Privacidade() {
  return (
    <div className="container secao pt-4 formulario-largo texto-legal">
      <h1 className="titulo-secao">Privacidade e termos de uso</h1>
      <p className="texto-suave">Texto inicial, a revisar com a ONG antes da publicação.</p>

      <h2 className="h5">Que dados coletamos</h2>
      <p>
        Visitantes não criam conta. Quando você envia o formulário de interesse (apadrinhar, adotar
        ou falar com o abrigo), recebemos o seu nome, telefone e/ou e-mail e a mensagem que
        escrever.
      </p>

      <h2 className="h5">Para que usamos</h2>
      <p>
        Somente para a equipe do abrigo entrar em contato sobre o seu pedido e, se você virar
        padrinho, madrinha ou adotante, para registrar esse vínculo. Não vendemos nem compartilhamos
        seus dados.
      </p>

      <h2 className="h5">O que é público</h2>
      <p>
        Na vitrine aparecem apenas informações dos animais (fotos, idade, temperamento e saúde).
        Dados de pessoas nunca são publicados.
      </p>

      <h2 className="h5">Seus direitos</h2>
      <p>
        Pela LGPD (Lei 13.709/2018), você pode pedir para ver, corrigir ou apagar seus dados a
        qualquer momento pelos canais oficiais do abrigo.
      </p>

      <h2 className="h5">Uso do conteúdo</h2>
      <p>
        Fotos e textos dos animais servem para divulgar o trabalho do abrigo. Compartilhe à vontade!
      </p>
    </div>
  );
}
