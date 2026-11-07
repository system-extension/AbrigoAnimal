package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.TipoVacina;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Visão completa (interna) de um animal para a equipe da ONG. */
public record AnimalDetalhe(
        UUID id,
        Long versao,
        String nome,
        String slug,
        Especie especie,
        Sexo sexo,
        String cor,
        Porte porte,
        LocalDate dataNascimentoEstimada,
        Integer idadeAnos,
        Boolean castrado,
        String chip,
        String chipAdicional,
        String ala,
        String canil,
        boolean idoso,
        String descricao,
        List<String> temperamento,
        // derivado (medicações preenchidas); mantido porque o formulário usa um interruptor
        boolean medicacaoContinua,
        String medicacoes,
        String condicoesSaude,
        List<Vacina> vacinas,
        SituacaoAnimal situacao,
        LocalDate dataObito,
        boolean visivelNaVitrine,
        List<Foto> fotos,
        Instant criadoEm,
        Instant atualizadoEm,
        String atualizadoPor) {

    public record Foto(UUID id, String url, boolean principal) {
    }

    public record Vacina(TipoVacina tipo, LocalDate ultimaDose) {
    }
}
