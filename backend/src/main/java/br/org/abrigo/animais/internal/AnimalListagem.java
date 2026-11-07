package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;

import java.util.UUID;

/** Linha da lista de animais na tela da equipe (leve: sem descrições longas). */
public record AnimalListagem(
        UUID id,
        String nome,
        Especie especie,
        Sexo sexo,
        SituacaoAnimal situacao,
        boolean idoso,
        String chip,
        String ala,
        String canil,
        boolean visivelNaVitrine,
        String fotoPrincipal) {
}
