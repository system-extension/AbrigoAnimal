package br.org.abrigo.animais.internal.persistence;

import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.animais.internal.domain.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalRepository extends JpaRepository<Animal, UUID>, JpaSpecificationExecutor<Animal> {

    Optional<Animal> findBySlug(String slug);

    /** Procura o número nos DOIS campos de chip (o leitor pode ler qualquer um deles). */
    @Query("select a from Animal a where a.chip = :chip or a.chipAdicional = :chip")
    List<Animal> buscarPorChip(@Param("chip") String chip);

    List<Animal> findBySituacaoIn(Collection<SituacaoAnimal> situacoes);
}
