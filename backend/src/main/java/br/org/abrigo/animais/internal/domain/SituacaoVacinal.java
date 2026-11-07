package br.org.abrigo.animais.internal.domain;

import java.time.LocalDate;

/** Estado de UMA vacina de um animal, olhando a última aplicação. */
public enum SituacaoVacinal {
    /** Nunca registrada no sistema. */
    SEM_REGISTRO,
    /** Próxima dose já passou. */
    VENCIDA,
    /** Vence dentro da janela de aviso (padrão: 30 dias). */
    VENCENDO,
    EM_DIA;

    /** Gravidade para ordenar e para resumir o animal pela pior vacina. */
    public int gravidade() {
        return switch (this) {
            case VENCIDA -> 3;
            case SEM_REGISTRO -> 2;
            case VENCENDO -> 1;
            case EM_DIA -> 0;
        };
    }

    public static SituacaoVacinal de(LocalDate proximoEm, LocalDate hoje, int diasAviso) {
        if (proximoEm == null) {
            return EM_DIA; // aplicada sem próxima dose prevista (ex.: dose única)
        }
        if (proximoEm.isBefore(hoje)) {
            return VENCIDA;
        }
        if (!proximoEm.isAfter(hoje.plusDays(diasAviso))) {
            return VENCENDO;
        }
        return EM_DIA;
    }

    public static SituacaoVacinal pior(SituacaoVacinal a, SituacaoVacinal b) {
        return a.gravidade() >= b.gravidade() ? a : b;
    }
}
