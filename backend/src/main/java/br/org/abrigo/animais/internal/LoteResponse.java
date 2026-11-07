package br.org.abrigo.animais.internal;

import java.util.UUID;

public record LoteResponse(UUID loteId, int registrados) {
}
