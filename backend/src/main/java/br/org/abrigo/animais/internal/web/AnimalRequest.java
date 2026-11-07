package br.org.abrigo.animais.internal.web;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.internal.domain.DadosAnimal;
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
 * <p>Campos antigos que o front ainda possa mandar (medicacaoContinua, vacinas) são ignorados:
 * medicação contínua = "medicacoes" preenchido; vacinas viraram registros em /cuidados.
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
        /** Obrigatória na edição (PUT): a versão que a tela carregou. */
        Long versao) {

    DadosAnimal paraDados() {
        return new DadosAnimal(nome, especie, sexo, cor, porte, dataNascimentoEstimada, castrado,
                chip, chipAdicional, ala, canil, Boolean.TRUE.equals(idoso), descricao, temperamento,
                medicacoes, condicoesSaude);
    }
}
