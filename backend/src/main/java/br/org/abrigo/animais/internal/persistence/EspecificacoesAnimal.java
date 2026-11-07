package br.org.abrigo.animais.internal.persistence;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.internal.domain.Animal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Filtros dinâmicos (só entram no WHERE os filtros que vieram preenchidos).
 * Criteria API em vez de JPQL com "(:param is null or ...)", que dá problema de tipo no PostgreSQL.
 */
public final class EspecificacoesAnimal {

    private EspecificacoesAnimal() {
    }

    /** O que o público pode ver: visível e sem óbito. */
    public static Specification<Animal> daVitrine(Especie especie, Sexo sexo, Porte porte, Boolean idoso) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            p.add(cb.isTrue(root.<Boolean>get("visivelNaVitrine")));
            p.add(cb.notEqual(root.get("situacao"), SituacaoAnimal.OBITO));
            if (especie != null) {
                p.add(cb.equal(root.get("especie"), especie));
            }
            if (sexo != null) {
                p.add(cb.equal(root.get("sexo"), sexo));
            }
            if (porte != null) {
                p.add(cb.equal(root.get("porte"), porte));
            }
            if (idoso != null) {
                p.add(cb.equal(root.<Boolean>get("idoso"), idoso));
            }
            return cb.and(p.toArray(Predicate[]::new));
        };
    }

    /** Listagem interna da equipe. */
    public static Specification<Animal> daGestao(FiltroAnimais f) {
        return (root, query, cb) -> {
            List<Predicate> p = new ArrayList<>();
            if (f.busca() != null && !f.busca().isBlank()) {
                String termo = "%" + f.busca().trim().toLowerCase(Locale.ROOT) + "%";
                // chip sem espaços: quem digita "963 003 000..." também encontra
                String chip = "%" + f.busca().replaceAll("\\s+", "") + "%";
                p.add(cb.or(
                        cb.like(cb.lower(root.<String>get("nome")), termo),
                        cb.like(root.<String>get("chip"), chip),
                        cb.like(root.<String>get("chipAdicional"), chip)));
            }
            if (f.especie() != null) {
                p.add(cb.equal(root.get("especie"), f.especie()));
            }
            if (f.situacao() != null) {
                p.add(cb.equal(root.get("situacao"), f.situacao()));
            }
            if (f.ala() != null && !f.ala().isBlank()) {
                p.add(cb.equal(cb.lower(root.<String>get("ala")), f.ala().trim().toLowerCase(Locale.ROOT)));
            }
            if (f.idoso() != null) {
                p.add(cb.equal(root.<Boolean>get("idoso"), f.idoso()));
            }
            return cb.and(p.toArray(Predicate[]::new));
        };
    }

    public record FiltroAnimais(String busca, Especie especie, SituacaoAnimal situacao, String ala, Boolean idoso) {
    }
}
