package br.org.abrigo.animais.internal.web;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.TipoVacina;
import br.org.abrigo.animais.internal.domain.DadosAnimal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * Corpo do POST/PUT de animal. Aqui só se valida FORMATO (obrigatório, tamanho).
 * Regras de negócio (chip único, óbito...) ficam no domínio.
 *
 * <p>medicacaoContinua, se vier, é ignorado: medicação contínua = "medicacoes" preenchido.
 * vacinas: a lista enviada SUBSTITUI a anterior (lista vazia = nenhuma vacina registrada).
 */
record AnimalRequest(
        @NotBlank(message = "Informe o nome") @Size(max = 120) String nome,
        @NotNull(message = "Informe a espécie") Especie especie,
        Sexo sexo,
        @Size(max = 80) String cor,
        Porte porte,
        @PastOrPresent(message = "A data de nascimento não pode ser futura") LocalDate dataNascimentoEstimada,
        // null = não informado
        Boolean castrado,
        @Size(max = 40) String chip,
        @Size(max = 40) String chipAdicional,
        @Size(max = 40) String ala,
        @Size(max = 40) String canil,
        Boolean idoso,
        @Size(max = 5000) String descricao,
        @Size(max = 8, message = "Escolha no máximo 8 características") List<@Size(max = 30) String> temperamento,
        @Size(max = 5000) String medicacoes,
        @Size(max = 5000) String condicoesSaude,
        @Size(max = 10) List<@Valid @NotNull VacinaRequest> vacinas,
        /** Obrigatória na edição (PUT): a versão que a tela carregou. */
        Long versao) {

    DadosAnimal paraDados() {
        return new DadosAnimal(nome, especie, sexo, cor, porte, dataNascimentoEstimada, castrado,
                chip, chipAdicional, ala, canil, Boolean.TRUE.equals(idoso), descricao, temperamento,
                medicacoes, condicoesSaude,
                vacinas == null ? List.of()
                        : vacinas.stream().map(v -> new DadosAnimal.Vacina(v.tipo(), v.ultimaDose())).toList());
    }

    record VacinaRequest(
            @NotNull(message = "Informe a vacina") TipoVacina tipo,
            @PastOrPresent(message = "A data da vacina não pode ser futura") LocalDate ultimaDose) {
    }
}
