package br.org.abrigo.animais;

import br.org.abrigo.animais.internal.MapeadorAnimal;
import br.org.abrigo.animais.internal.persistence.AnimalRepository;
import br.org.abrigo.animais.internal.persistence.EspecificacoesAnimal;
import br.org.abrigo.plataforma.Pagina;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * API PÚBLICA do módulo: o que os outros módulos podem pedir aos animais.
 * Só devolve records (AnimalResumo, AnimalVitrine), nunca a entidade interna.
 *
 * <p>Os casos de uso da equipe (cadastrar, editar, fotos...) ficam em internal/GestaoAnimais,
 * invisíveis para outros módulos.
 */
@Service
@Transactional(readOnly = true)
public class AnimalService {

    private final AnimalRepository animais;
    private final MapeadorAnimal mapeador;

    public AnimalService(AnimalRepository animais, MapeadorAnimal mapeador) {
        this.animais = animais;
        this.mapeador = mapeador;
    }

    public Optional<AnimalResumo> buscarResumo(UUID id) {
        return animais.findById(id).map(mapeador::paraResumo);
    }

    /** Resolve o slug da URL pública para o animal (só se ele estiver visível na vitrine). */
    public Optional<AnimalResumo> buscarResumoNaVitrine(String slug) {
        return animais.findBySlug(slug)
                .filter(a -> a.estaNaVitrine())
                .map(mapeador::paraResumo);
    }

    public Pagina<AnimalVitrine> listarVitrine(Especie especie, Sexo sexo, Porte porte, Boolean idoso,
                                               Pageable pageable) {
        var filtro = EspecificacoesAnimal.daVitrine(especie, sexo, porte, idoso);
        return Pagina.de(animais.findAll(filtro, pageable).map(mapeador::paraVitrine));
    }

    public Optional<AnimalVitrine> buscarVitrinePorSlug(String slug) {
        return animais.findBySlug(slug)
                .filter(a -> a.estaNaVitrine())
                .map(mapeador::paraVitrine);
    }
}
