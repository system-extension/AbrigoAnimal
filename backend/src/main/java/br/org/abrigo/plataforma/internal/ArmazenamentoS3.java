package br.org.abrigo.plataforma.internal;

import br.org.abrigo.plataforma.ArmazenamentoArquivos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Optional;
import java.util.UUID;

/**
 * Implementação S3 do ArmazenamentoArquivos (ARMAZENAMENTO_TIPO=s3), ADR 0015.
 * Em produção aponta para o Cloudflare R2; no desenvolvimento, para o Silo (fork do MinIO) do compose.
 * Os três falam o mesmo protocolo (S3): trocar de fornecedor é trocar variáveis de ambiente.
 *
 * <p>O banco continua guardando só a chave (ex.: animais/3f2a.../a1b2.webp). As chaves não mudam
 * entre disco e S3: migrar é copiar os arquivos, sem tocar no banco.
 *
 * <p>Endereço das fotos:
 * <ul>
 *   <li>sem {@code url-publica}: o navegador pede ao backend ({@code /arquivos/...}), que busca no bucket;</li>
 *   <li>com {@code url-publica} (domínio próprio ligado ao bucket): o navegador busca direto na
 *       Cloudflare, e o backend nem vê esse tráfego.</li>
 * </ul>
 */
class ArmazenamentoS3 implements ArmazenamentoArquivos {

    private static final Logger log = LoggerFactory.getLogger(ArmazenamentoS3.class);

    /** Cada foto tem chave única e nunca é sobrescrita: pode ficar 30 dias em cache (igual ao /arquivos). */
    static final String CACHE_DAS_FOTOS = "public, max-age=2592000, immutable";

    private final S3Client s3;
    private final String bucket;
    private final String urlPublica; // null = fotos passam pelo backend

    ArmazenamentoS3(S3Client s3, String bucket, String urlPublica) {
        this.s3 = s3;
        this.bucket = bucket;
        this.urlPublica = urlPublica == null || urlPublica.isBlank()
                ? null
                : urlPublica.strip().replaceAll("/+$", "");
    }

    /**
     * Confere na partida se o bucket existe e se as chaves dão acesso a ele. Melhor o deploy falhar
     * com uma mensagem clara do que o site subir e a primeira foto dar erro.
     */
    void verificarBucket(boolean criarSeNaoExistir) {
        try {
            s3.headBucket(b -> b.bucket(bucket));
            log.info("Fotos no bucket \"{}\" ({}).", bucket,
                    urlPublica == null ? "entregues pelo backend em /arquivos" : "entregues direto de " + urlPublica);
        } catch (S3Exception e) {
            if (e.statusCode() != 404) {
                throw semAcesso(e);
            }
            if (!criarSeNaoExistir) {
                throw new IllegalStateException("O bucket \"" + bucket + "\" não existe. Crie o bucket no painel "
                        + "da Cloudflare (R2) ou confira S3_BUCKET.", e);
            }
            s3.createBucket(b -> b.bucket(bucket));
            log.info("Bucket \"{}\" criado (S3_CRIAR_BUCKET=true, só para desenvolvimento).", bucket);
        } catch (SdkException e) {
            throw semAcesso(e);
        }
    }

    private IllegalStateException semAcesso(SdkException e) {
        return new IllegalStateException("Não foi possível acessar o bucket \"" + bucket + "\". Confira "
                + "S3_ENDPOINT, S3_BUCKET, S3_CHAVE_ACESSO e S3_CHAVE_SECRETA. Detalhe: " + e.getMessage(), e);
    }

    @Override
    public String salvar(String pasta, String extensao, byte[] conteudo) {
        String chave = pasta + "/" + UUID.randomUUID() + "." + extensao;
        gravar(chave, conteudo);
        return chave;
    }

    @Override
    public void gravar(String chave, byte[] conteudo) {
        validarChave(chave);
        s3.putObject(b -> b.bucket(bucket).key(chave)
                        .contentType(ArmazenamentoLocal.tipoPelaChave(chave))
                        .cacheControl(CACHE_DAS_FOTOS),
                RequestBody.fromBytes(conteudo));
    }

    @Override
    public Optional<ArquivoArmazenado> obter(String chave) {
        validarChave(chave);
        try {
            // Fotos têm no máximo 3 MB: ler para a memória é simples e libera a conexão na hora.
            ResponseBytes<GetObjectResponse> arquivo = s3.getObjectAsBytes(b -> b.bucket(bucket).key(chave));
            String tipo = arquivo.response().contentType();
            if (tipo == null || tipo.isBlank()) {
                tipo = ArmazenamentoLocal.tipoPelaChave(chave);
            }
            return Optional.of(new ArquivoArmazenado(new ByteArrayResource(arquivo.asByteArray()), tipo));
        } catch (NoSuchKeyException e) {
            return Optional.empty();
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                return Optional.empty();
            }
            throw e;
        }
    }

    @Override
    public void remover(String chave) {
        validarChave(chave);
        s3.deleteObject(b -> b.bucket(bucket).key(chave)); // apagar o que não existe não é erro
    }

    @Override
    public String urlPublica(String chave) {
        return urlPublica == null ? ArmazenamentoArquivos.super.urlPublica(chave) : urlPublica + "/" + chave;
    }

    /** Mesmo cuidado do disco: nada de "../", barra no início ou chave vazia. */
    private static void validarChave(String chave) {
        if (chave == null || chave.isBlank() || chave.startsWith("/") || chave.contains("..")
                || chave.contains("\\")) {
            throw new IllegalArgumentException("Chave de arquivo inválida");
        }
    }
}
