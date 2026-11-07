package br.org.abrigo.animais.internal.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.List;

/**
 * Guarda uma lista curta de etiquetas ("Dócil", "Brincalhão") numa coluna de texto: "Dócil|Brincalhão".
 * Mais simples que tabela própria ou array do PostgreSQL para algo que só é lido junto com o animal.
 */
@Converter
class ListaTextoConverter implements AttributeConverter<List<String>, String> {

    static final String SEPARADOR = "|";

    @Override
    public String convertToDatabaseColumn(List<String> lista) {
        return lista == null || lista.isEmpty() ? null : String.join(SEPARADOR, lista);
    }

    @Override
    public List<String> convertToEntityAttribute(String texto) {
        if (texto == null || texto.isBlank()) {
            return List.of();
        }
        return Arrays.stream(texto.split("\\" + SEPARADOR)).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
