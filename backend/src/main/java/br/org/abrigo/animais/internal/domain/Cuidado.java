package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.plataforma.EntidadeBase;
import br.org.abrigo.plataforma.RegraNegocioException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Uma aplicação de vacina ou vermífugo. Cada aplicação é um registro novo: assim fica o histórico
 * (a planilha da ONG sobrescrevia a célula e perdia a dose anterior).
 *
 * <p>Não fica dentro do agregado Animal de propósito: um animal acumula aplicações por anos e
 * carregar todas a cada edição do cadastro seria desperdício. Liga-se ao animal só pelo id.
 */
@Entity
@Table(name = "cuidado")
public class Cuidado extends EntidadeBase {

    @Column(nullable = false, updatable = false)
    private UUID animalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCuidado tipo;

    @Column(nullable = false)
    private LocalDate aplicadoEm;

    private LocalDate proximoEm;

    @Column(updatable = false)
    private UUID loteId;

    @Column(length = 200)
    private String observacao;

    protected Cuidado() {
        // exigido pelo JPA
    }

    /**
     * @param proximoEm se vier null, o sistema sugere pelo intervalo padrão do tipo (V8/raiva: +1 ano).
     */
    public static Cuidado registrar(Animal animal, TipoCuidado tipo, LocalDate aplicadoEm, LocalDate proximoEm,
                                    String observacao, UUID loteId, LocalDate hoje) {
        if (!animal.estaSobCuidadoDaOng()) {
            throw new RegraNegocioException(animal.getNome() + " não está mais sob cuidado da ONG ("
                    + animal.getSituacao().name().toLowerCase() + ").");
        }
        if (tipo == null) {
            throw new RegraNegocioException("Informe o que foi aplicado.");
        }
        if (aplicadoEm == null || aplicadoEm.isAfter(hoje)) {
            throw new RegraNegocioException("A data da aplicação é obrigatória e não pode ser futura.");
        }
        LocalDate proximo = proximoEm != null ? proximoEm : tipo.intervaloPadrao().map(aplicadoEm::plus).orElse(null);
        if (proximo != null && !proximo.isAfter(aplicadoEm)) {
            throw new RegraNegocioException("A próxima dose precisa ser depois da aplicação.");
        }
        Cuidado c = new Cuidado();
        c.animalId = animal.getId();
        c.tipo = tipo;
        c.aplicadoEm = aplicadoEm;
        c.proximoEm = proximo;
        c.loteId = loteId;
        c.observacao = observacao == null || observacao.isBlank() ? null : observacao.trim();
        return c;
    }

    public UUID getAnimalId() { return animalId; }
    public TipoCuidado getTipo() { return tipo; }
    public LocalDate getAplicadoEm() { return aplicadoEm; }
    public LocalDate getProximoEm() { return proximoEm; }
    public UUID getLoteId() { return loteId; }
    public String getObservacao() { return observacao; }
}
