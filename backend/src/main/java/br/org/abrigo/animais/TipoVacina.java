package br.org.abrigo.animais;

/**
 * Vacinas (e vermífugo) que a ONG registra no cadastro do animal.
 * Novo tipo = novo valor aqui + no check da tabela vacina_animal (nova migration) + rótulo no front.
 */
public enum TipoVacina {
    /** Polivalente de cães (as planilhas chamam de "V8/POLY"). */
    V8_V10,
    /** Polivalente de gatos. */
    V3_V4,
    ANTIRRABICA,
    GRIPE_CANINA,
    VERMIFUGO
}
