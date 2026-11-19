package br.org.abrigo.animais.internal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Foto de um animal. Faz parte do "agregado" Animal: só é alterada através dele. */
@Entity
@Table(name = "foto_animal")
public class FotoAnimal {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "animal_id", nullable = false)
    private Animal animal;

    @Column(nullable = false, length = 300)
    private String chaveArquivo;

    @Column(nullable = false)
    private boolean principal;

    @Column(nullable = false)
    private int ordem;

    @Column(nullable = false)
    private Instant adicionadaEm;

    /** Tem as versões média e mini no armazenamento (ADR 0015)? Sem elas, as telas usam o original. */
    @Column(nullable = false)
    private boolean comVersoes;

    protected FotoAnimal() {
    }

    FotoAnimal(Animal animal, String chaveArquivo, boolean comVersoes, int ordem, boolean principal, Instant agora) {
        this.id = UUID.randomUUID();
        this.animal = animal;
        this.chaveArquivo = chaveArquivo;
        this.ordem = ordem;
        this.principal = principal;
        this.adicionadaEm = agora;
        this.comVersoes = comVersoes;
    }

    void marcarPrincipal(boolean principal) {
        this.principal = principal;
    }

    void mudarOrdem(int ordem) {
        this.ordem = ordem;
    }

    public UUID getId() {
        return id;
    }

    public String getChaveArquivo() {
        return chaveArquivo;
    }

    public boolean isPrincipal() {
        return principal;
    }

    public int getOrdem() {
        return ordem;
    }

    public boolean isComVersoes() {
        return comVersoes;
    }
}
