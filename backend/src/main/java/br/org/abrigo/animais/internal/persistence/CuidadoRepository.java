package br.org.abrigo.animais.internal.persistence;

import br.org.abrigo.animais.internal.domain.Cuidado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface CuidadoRepository extends JpaRepository<Cuidado, UUID> {

    List<Cuidado> findByAnimalIdOrderByAplicadoEmDescCriadoEmDesc(UUID animalId);

    /**
     * Última aplicação de cada tipo, de cada animal (subconsulta correlacionada).
     * Se houver dois registros no mesmo dia, os dois vêm: quem chama desempata (UltimasAplicacoes).
     */
    @Query("""
            select c from Cuidado c
             where c.aplicadoEm = (select max(c2.aplicadoEm) from Cuidado c2
                                    where c2.animalId = c.animalId and c2.tipo = c.tipo)
            """)
    List<Cuidado> ultimasAplicacoes();

    @Query("""
            select c from Cuidado c
             where c.animalId in :animais
               and c.aplicadoEm = (select max(c2.aplicadoEm) from Cuidado c2
                                    where c2.animalId = c.animalId and c2.tipo = c.tipo)
            """)
    List<Cuidado> ultimasAplicacoes(@Param("animais") Collection<UUID> animais);
}
