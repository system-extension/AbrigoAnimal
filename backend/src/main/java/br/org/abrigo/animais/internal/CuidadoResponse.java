package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.internal.domain.TipoCuidado;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Uma aplicação no histórico do animal. */
public record CuidadoResponse(
        UUID id,
        UUID animalId,
        TipoCuidado tipo,
        LocalDate aplicadoEm,
        LocalDate proximoEm,
        UUID loteId,
        String observacao,
        Instant criadoEm,
        String criadoPor) {
}
