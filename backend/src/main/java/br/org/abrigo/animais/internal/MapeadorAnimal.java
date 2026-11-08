package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.AnimalResumo;
import br.org.abrigo.animais.AnimalVitrine;
import br.org.abrigo.animais.internal.domain.Animal;
import br.org.abrigo.animais.internal.domain.FotoAnimal;
import br.org.abrigo.animais.internal.domain.VacinaAnimal;
import br.org.abrigo.plataforma.ArmazenamentoArquivos;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;

/**
 * Converte a entidade em records de saída. Centralizado para que a decisão
 * "o que é público" esteja num lugar só (paraVitrine).
 */
@Component
public class MapeadorAnimal {

    private final ArmazenamentoArquivos armazenamento;
    private final Clock clock;

    MapeadorAnimal(ArmazenamentoArquivos armazenamento, Clock clock) {
        this.armazenamento = armazenamento;
        this.clock = clock;
    }

    public AnimalResumo paraResumo(Animal a) {
        return new AnimalResumo(a.getId(), a.getNome(), a.getSlug(), a.getEspecie(),
                a.getSituacao(), a.isVisivelNaVitrine());
    }

    public AnimalVitrine paraVitrine(Animal a) {
        return new AnimalVitrine(
                a.getNome(), a.getSlug(), a.getEspecie(), a.getSexo(), a.getCor(), a.getPorte(),
                a.idadeEmAnos(hoje()), a.getCastrado(), a.isIdoso(), a.getDescricao(), a.getTemperamento(),
                a.usaMedicacaoContinua(), a.getMedicacoes(), a.getCondicoesSaude(),
                a.getVacinas().stream().map(VacinaAnimal::getTipo).toList(),
                a.getSituacao(),
                a.fotoPrincipal().map(this::url).orElse(null),
                a.getFotos().stream().map(this::url).toList());
    }

    public AnimalListagem paraListagem(Animal a) {
        return new AnimalListagem(a.getId(), a.getNome(), a.getEspecie(), a.getSexo(), a.getSituacao(),
                a.isIdoso(), a.getChip(), a.getAla(), a.getCanil(), a.isVisivelNaVitrine(),
                a.fotoPrincipal().map(this::url).orElse(null));
    }

    public AnimalDetalhe paraDetalhe(Animal a) {
        return new AnimalDetalhe(
                a.getId(), a.getVersao(), a.getNome(), a.getSlug(), a.getEspecie(), a.getSexo(), a.getCor(),
                a.getPorte(), a.getDataNascimentoEstimada(), a.idadeEmAnos(hoje()), a.getCastrado(),
                a.getChip(), a.getChipAdicional(), a.getAla(), a.getCanil(), a.isIdoso(),
                a.getDescricao(), a.getTemperamento(), a.usaMedicacaoContinua(), a.getMedicacoes(),
                a.getCondicoesSaude(),
                a.getVacinas().stream().map(v -> new AnimalDetalhe.Vacina(v.getTipo(), v.getUltimaDose())).toList(),
                a.getSituacao(), a.getDataObito(), a.isVisivelNaVitrine(),
                a.getFotos().stream()
                        .map(f -> new AnimalDetalhe.Foto(f.getId(), url(f), f.isPrincipal()))
                        .toList(),
                a.getCriadoEm(), a.getAtualizadoEm(), a.getAtualizadoPor());
    }

    private String url(FotoAnimal f) {
        return armazenamento.urlPublica(f.getChaveArquivo());
    }

    private LocalDate hoje() {
        return LocalDate.now(clock);
    }
}
