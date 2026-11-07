package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.animais.TipoVacina;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDate;

/** Uma vacina que o animal já tomou. Faz parte do cadastro: só muda junto com o Animal. */
@Embeddable
public class VacinaAnimal {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoVacina tipo;

    /** Opcional: muitas vezes a ONG sabe que tomou, mas não quando. */
    private LocalDate ultimaDose;

    protected VacinaAnimal() {
        // exigido pelo JPA
    }

    VacinaAnimal(TipoVacina tipo, LocalDate ultimaDose) {
        this.tipo = tipo;
        this.ultimaDose = ultimaDose;
    }

    public TipoVacina getTipo() {
        return tipo;
    }

    public LocalDate getUltimaDose() {
        return ultimaDose;
    }
}
