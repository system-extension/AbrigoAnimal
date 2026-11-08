package br.org.abrigo.solicitacoes.internal.web;

import br.org.abrigo.plataforma.IpDoCliente;
import br.org.abrigo.solicitacoes.TipoSolicitacao;
import br.org.abrigo.solicitacoes.internal.GestaoSolicitacoes;
import br.org.abrigo.solicitacoes.internal.GestaoSolicitacoes.FormularioInteresse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Formulário PÚBLICO (sem login). A resposta devolve apenas o protocolo —
 * nunca ecoa os dados pessoais enviados.
 */
@RestController
class SolicitacaoPublicaController {

    private final GestaoSolicitacoes gestao;
    private final IpDoCliente ipDoCliente;

    SolicitacaoPublicaController(GestaoSolicitacoes gestao, IpDoCliente ipDoCliente) {
        this.gestao = gestao;
        this.ipDoCliente = ipDoCliente;
    }

    @PostMapping("/api/public/solicitacoes")
    @ResponseStatus(HttpStatus.CREATED)
    Protocolo enviar(@Valid @RequestBody FormularioRequest req, HttpServletRequest http) {
        var form = new FormularioInteresse(req.tipo(), req.animalSlug(), req.nome(), req.telefone(),
                req.email(), req.mensagem(), Boolean.TRUE.equals(req.consentimento()));
        return new Protocolo(gestao.receber(form, ipDoCliente.de(http), req.site()));
    }

    record FormularioRequest(
            @NotNull(message = "Informe o tipo") TipoSolicitacao tipo,
            @Size(max = 160) String animalSlug,
            @NotBlank(message = "Informe seu nome") @Size(max = 150) String nome,
            @Size(max = 20) String telefone,
            @Email(message = "E-mail inválido") @Size(max = 200) String email,
            @Size(max = 2000) String mensagem,
            @NotNull(message = "É preciso autorizar o uso dos dados")
            @AssertTrue(message = "É preciso autorizar o uso dos dados") Boolean consentimento,
            /** Campo isca (honeypot): fica escondido no formulário. */
            String site) {
    }

    record Protocolo(UUID protocolo) {
    }
}
