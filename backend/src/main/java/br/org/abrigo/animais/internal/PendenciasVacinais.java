package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.internal.domain.SituacaoVacinal;
import br.org.abrigo.animais.internal.domain.TipoCuidado;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * O que a home da equipe precisa: totais, resumo por ala (a equipe vacina por local)
 * e a lista dos animais que pedem atenção. Contagens são POR ANIMAL, pela pior vacina dele.
 */
public record PendenciasVacinais(
        LocalDate hoje,
        int diasAviso,
        Totais totais,
        List<Ala> alas,
        List<AnimalPendente> animais) {

    public record Totais(int vencidas, int vencendo, int semRegistro, int emDia) {
    }

    public record Ala(String ala, int vencidas, int vencendo, int semRegistro, int total) {
    }

    public record AnimalPendente(UUID animalId, String nome, String chip, String ala, String canil,
                                 SituacaoVacinal situacao, List<Vacina> vacinas) {
    }

    public record Vacina(TipoCuidado tipo, LocalDate aplicadoEm, LocalDate proximoEm, SituacaoVacinal situacao) {
    }
}
