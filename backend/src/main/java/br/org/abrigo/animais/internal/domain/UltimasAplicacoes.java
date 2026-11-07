package br.org.abrigo.animais.internal.domain;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Índice "animal → tipo → última aplicação", montado a partir da consulta do repositório.
 * Concentra a regra de "vacinas em dia" num lugar só (usada pelo painel e pela vitrine).
 */
public final class UltimasAplicacoes {

    private final Map<UUID, Map<TipoCuidado, Cuidado>> porAnimal = new HashMap<>();

    public UltimasAplicacoes(List<Cuidado> cuidados) {
        // desempate de registros no mesmo dia: a próxima dose mais distante vale (é a mais otimista e recente)
        Comparator<Cuidado> maisRecente = Comparator.comparing(Cuidado::getAplicadoEm)
                .thenComparing(c -> c.getProximoEm() == null ? LocalDate.MIN : c.getProximoEm());
        for (Cuidado c : cuidados) {
            porAnimal.computeIfAbsent(c.getAnimalId(), id -> new EnumMap<>(TipoCuidado.class))
                    .merge(c.getTipo(), c, (a, b) -> maisRecente.compare(a, b) >= 0 ? a : b);
        }
    }

    public Optional<Cuidado> ultima(UUID animalId, TipoCuidado tipo) {
        return Optional.ofNullable(porAnimal.getOrDefault(animalId, Map.of()).get(tipo));
    }

    public SituacaoVacinal situacao(UUID animalId, TipoCuidado tipo, LocalDate hoje, int diasAviso) {
        return ultima(animalId, tipo)
                .map(c -> SituacaoVacinal.de(c.getProximoEm(), hoje, diasAviso))
                .orElse(SituacaoVacinal.SEM_REGISTRO);
    }

    /**
     * Para a vitrine: true = todas as vacinas em dia; false = alguma vencida;
     * null = sem registro (não afirmamos nada ao público).
     */
    public Boolean vacinasEmDia(UUID animalId, LocalDate hoje) {
        boolean algumaSemRegistro = false;
        for (TipoCuidado tipo : TipoCuidado.values()) {
            if (!tipo.ehVacina()) {
                continue;
            }
            SituacaoVacinal s = situacao(animalId, tipo, hoje, 0);
            if (s == SituacaoVacinal.VENCIDA) {
                return false;
            }
            algumaSemRegistro |= s == SituacaoVacinal.SEM_REGISTRO;
        }
        return algumaSemRegistro ? null : true;
    }
}
