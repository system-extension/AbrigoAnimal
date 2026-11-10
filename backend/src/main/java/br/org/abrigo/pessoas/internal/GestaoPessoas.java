package br.org.abrigo.pessoas.internal;

import br.org.abrigo.pessoas.internal.domain.DadosPessoa;
import br.org.abrigo.pessoas.internal.domain.Pessoa;
import br.org.abrigo.pessoas.internal.persistence.PessoaRepository;
import br.org.abrigo.plataforma.Pagina;
import br.org.abrigo.plataforma.RecursoNaoEncontradoException;
import br.org.abrigo.plataforma.RegraNegocioException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class GestaoPessoas {

    private final PessoaRepository pessoas;
    private final Clock clock;

    GestaoPessoas(PessoaRepository pessoas, Clock clock) {
        this.pessoas = pessoas;
        this.clock = clock;
    }

    public PessoaDetalhe cadastrar(DadosPessoa dados, boolean consentiu) {
        Pessoa nova = Pessoa.cadastrar(dados, consentiu ? Instant.now(clock) : null);
        validarCpfUnico(nova.getCpf(), null);
        return PessoaDetalhe.de(pessoas.saveAndFlush(nova));
    }

    public PessoaDetalhe atualizar(UUID id, DadosPessoa dados) {
        Pessoa p = carregar(id);
        p.atualizar(dados);
        validarCpfUnico(p.getCpf(), id);
        pessoas.flush(); // grava antes de responder: a resposta leva a versão nova (ver GestaoAnimais)
        return PessoaDetalhe.de(p);
    }

    @Transactional(readOnly = true)
    public PessoaDetalhe buscar(UUID id) {
        return PessoaDetalhe.de(carregar(id));
    }

    @Transactional(readOnly = true)
    public Pagina<PessoaDetalhe> listar(String busca, Pageable pageable) {
        if (busca == null || busca.isBlank()) {
            return Pagina.de(pessoas.findAll(pageable).map(PessoaDetalhe::de));
        }
        String termo = "%" + busca.trim().toLowerCase(Locale.ROOT) + "%";
        return Pagina.de(pessoas.buscar(termo, pageable).map(PessoaDetalhe::de));
    }

    private Pessoa carregar(UUID id) {
        return pessoas.findById(id).orElseThrow(() -> RecursoNaoEncontradoException.de("Pessoa", id));
    }

    private void validarCpfUnico(String cpf, UUID idAtual) {
        if (cpf == null) {
            return;
        }
        pessoas.findByCpf(cpf)
                .filter(outra -> !outra.getId().equals(idAtual))
                .ifPresent(outra -> {
                    throw new RegraNegocioException("Já existe uma pessoa cadastrada com este CPF.");
                });
    }

    public record PessoaDetalhe(UUID id, Long versao, String nome, String telefone, String email, String cpf,
                                String endereco, String observacoes, Instant consentimentoEm,
                                Instant criadoEm, String atualizadoPor) {
        static PessoaDetalhe de(Pessoa p) {
            return new PessoaDetalhe(p.getId(), p.getVersao(), p.getNome(), p.getTelefone(), p.getEmail(),
                    p.getCpf(), p.getEndereco(), p.getObservacoes(), p.getConsentimentoEm(),
                    p.getCriadoEm(), p.getAtualizadoPor());
        }
    }
}
