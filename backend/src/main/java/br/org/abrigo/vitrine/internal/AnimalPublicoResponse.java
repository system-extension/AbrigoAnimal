package br.org.abrigo.vitrine.internal;

import br.org.abrigo.animais.AnimalVitrine;
import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;

import java.util.List;

/**
 * DTO PRÓPRIO da API pública — segunda barreira de privacidade.
 * Mesmo que AnimalVitrine ganhe um campo amanhã, ele só aparece aqui se alguém
 * adicionar explicitamente (e o teste ApiPublicaSemDadosSensiveisTest vigia isso).
 */
record AnimalPublicoResponse(
        String nome,
        String slug,
        Especie especie,
        Sexo sexo,
        String cor,
        Porte porte,
        Integer idadeAnos,
        Boolean castrado,
        boolean idoso,
        String descricao,
        List<String> temperamento,
        boolean medicacaoContinua,
        String medicacoes,
        String condicoesSaude,
        Boolean vacinasEmDia,
        boolean disponivelParaAdocao,
        String fotoPrincipal,
        List<String> fotos) {

    static AnimalPublicoResponse de(AnimalVitrine a) {
        return new AnimalPublicoResponse(a.nome(), a.slug(), a.especie(), a.sexo(), a.cor(), a.porte(),
                a.idadeAnos(), a.castrado(), a.idoso(), a.descricao(), a.temperamento(),
                a.medicacaoContinua(), a.medicacoes(), a.condicoesSaude(), a.vacinasEmDia(),
                a.situacao() == SituacaoAnimal.DISPONIVEL, a.fotoPrincipal(), a.fotos());
    }
}
