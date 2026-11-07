package br.org.abrigo.animais.internal.domain;

import java.time.Period;
import java.util.Optional;

/**
 * O que a ONG controla hoje nas planilhas "CONTROLE DE VACINA".
 * Novo tipo (ex.: antipulgas) = novo valor aqui + no check da tabela cuidado (V6).
 */
public enum TipoCuidado {

    /** V8 / polivalente. Na planilha: revacinar = aplicação + 1 ano (239 de 241 casos). */
    V8(Period.ofYears(1), true),
    /** Antirrábica. Aplicada no mesmo dia da V8 em quase todos os casos. */
    RAIVA(Period.ofYears(1), true),
    /** A planilha não tem "próximo vermífugo": intervalo a confirmar com a ONG. */
    VERMIFUGO(null, false);

    private final Period intervaloPadrao;
    private final boolean vacina;

    TipoCuidado(Period intervaloPadrao, boolean vacina) {
        this.intervaloPadrao = intervaloPadrao;
        this.vacina = vacina;
    }

    public Optional<Period> intervaloPadrao() {
        return Optional.ofNullable(intervaloPadrao);
    }

    /** Vacinas entram no "vacinas em dia" da vitrine e no alerta de "sem registro". */
    public boolean ehVacina() {
        return vacina;
    }
}
