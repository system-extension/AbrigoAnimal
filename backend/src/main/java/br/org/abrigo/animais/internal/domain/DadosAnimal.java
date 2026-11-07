package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;

import java.time.LocalDate;
import java.util.List;

/** Dados editáveis de um animal (entrada dos casos de uso cadastrar/atualizar). */
public record DadosAnimal(
        String nome,
        Especie especie,
        Sexo sexo,
        String cor,
        Porte porte,
        LocalDate dataNascimentoEstimada,
        // null = não informado
        Boolean castrado,
        String chip,
        String chipAdicional,
        String ala,
        String canil,
        boolean idoso,
        String descricao,
        List<String> temperamento,
        String medicacoes,
        String condicoesSaude) {
}
