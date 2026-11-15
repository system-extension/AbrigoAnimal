package br.org.abrigo.plataforma.internal;

import br.org.abrigo.plataforma.ArmazenamentoArquivos;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Locale;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementação em disco do ArmazenamentoArquivos (ARMAZENAMENTO_TIPO=disco, o padrão).
 * Serve para desenvolvimento e para uma hospedagem com volume persistente.
 * Em produção, as fotos vão para o Cloudflare R2 (ArmazenamentoS3, ADR 0015).
 */
@Component
@ConditionalOnProperty(name = "abrigo.armazenamento.tipo", havingValue = "disco", matchIfMissing = true)
class ArmazenamentoLocal implements ArmazenamentoArquivos {

    private static final Map<String, String> TIPOS = Map.of(
            "jpg", "image/jpeg",
            "jpeg", "image/jpeg",
            "png", "image/png",
            "webp", "image/webp");

    private final Path raiz;

    ArmazenamentoLocal(@Value("${abrigo.armazenamento.diretorio}") String diretorio) {
        this.raiz = Path.of(diretorio).toAbsolutePath().normalize();
        try {
            Files.createDirectories(raiz);
        } catch (IOException e) {
            throw new UncheckedIOException("Não foi possível criar o diretório de arquivos: " + raiz, e);
        }
    }

    @Override
    public String salvar(String pasta, String extensao, byte[] conteudo) {
        String chave = pasta + "/" + UUID.randomUUID() + "." + extensao;
        Path destino = resolver(chave);
        try {
            Files.createDirectories(destino.getParent());
            Files.write(destino, conteudo);
            return chave;
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao gravar arquivo " + chave, e);
        }
    }

    @Override
    public Optional<ArquivoArmazenado> obter(String chave) {
        Path caminho = resolver(chave);
        if (!Files.isRegularFile(caminho)) {
            return Optional.empty();
        }
        return Optional.of(new ArquivoArmazenado(new FileSystemResource(caminho), tipoPelaChave(chave)));
    }

    /** Tipo do arquivo (Content-Type) pela extensão da chave. Usado também pelo ArmazenamentoS3. */
    static String tipoPelaChave(String chave) {
        String extensao = chave.substring(chave.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return TIPOS.getOrDefault(extensao, "application/octet-stream");
    }

    @Override
    public void remover(String chave) {
        try {
            Files.deleteIfExists(resolver(chave));
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao remover arquivo " + chave, e);
        }
    }

    /** Impede "path traversal" (ex.: chave com ../../). */
    private Path resolver(String chave) {
        Path caminho = raiz.resolve(chave).normalize();
        if (!caminho.startsWith(raiz)) {
            throw new IllegalArgumentException("Chave de arquivo inválida");
        }
        return caminho;
    }
}
