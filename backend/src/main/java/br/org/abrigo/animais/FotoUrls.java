package br.org.abrigo.animais;

/**
 * Endereços de uma foto em três tamanhos (ADR 0015). Cada tela usa o menor que serve:
 * {@code mini} em miniaturas e listas do painel, {@code media} na página e nos cartões,
 * {@code grande} só na tela cheia. Foto antiga sem versões: os três apontam para o original.
 */
public record FotoUrls(String grande, String media, String mini) {
}
