package br.org.abrigo.animais;

import java.util.List;

/**
 * Somente os dados PÚBLICOS de um animal (primeira barreira da LGPD/privacidade).
 * Não contém chip, canil, ala nem dados de auditoria.
 */
public record AnimalVitrine(
        String nome,
        String slug,
        Especie especie,
        Sexo sexo,
        String cor,
        Porte porte,
        Integer idadeAnos,
        // null = não informado
        Boolean castrado,
        boolean idoso,
        String descricao,
        List<String> temperamento,
        boolean medicacaoContinua,
        String medicacoes,
        String condicoesSaude,
        // só QUAIS vacinas tomou (as datas ficam no painel)
        List<TipoVacina> vacinas,
        SituacaoAnimal situacao,
        String fotoPrincipal,
        List<String> fotos) {
}
