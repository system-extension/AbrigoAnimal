package br.org.abrigo.plataforma.internal;

import br.org.abrigo.plataforma.ArmazenamentoArquivos.ArquivoArmazenado;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import software.amazon.awssdk.services.s3.S3Client;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * ArmazenamentoS3 contra um servidor S3 de verdade em Docker (Silo, fork do MinIO: a imagem
 * oficial do MinIO saiu do Docker Hub). O R2 de produção fala o mesmo protocolo.
 * Não sobe o Spring: testa a classe direto, com o mesmo cliente que a aplicação usa.
 * Container genérico (sem o módulo MinIO do Testcontainers): só precisa da porta 9000 e do usuário/senha.
 */
@Testcontainers
class ArmazenamentoS3IntegrationTest {

    static final String USUARIO = "abrigo";
    static final String SENHA = "abrigo-teste-s3";

    @Container
    static final GenericContainer<?> S3 = new GenericContainer<>(
            DockerImageName.parse("pgsty/silo:RELEASE.2026-09-16T00-00-00Z"))
            .withEnv("MINIO_ROOT_USER", USUARIO)
            .withEnv("MINIO_ROOT_PASSWORD", SENHA)
            .withCommand("server", "/data")
            .withExposedPorts(9000)
            .waitingFor(Wait.forHttp("/minio/health/live").forPort(9000));

    static String endereco() {
        return "http://" + S3.getHost() + ":" + S3.getMappedPort(9000);
    }

    static final String BUCKET = "fotos-teste";
    static final byte[] CONTEUDO = "bytes-de-uma-foto".getBytes(StandardCharsets.UTF_8);

    static S3Client cliente;
    static ArmazenamentoS3 armazenamento;

    @BeforeAll
    static void prepararBucket() {
        cliente = ConfiguracaoArmazenamentoS3.criarCliente(endereco(), "us-east-1", USUARIO, SENHA);
        armazenamento = new ArmazenamentoS3(cliente, BUCKET, "");
        armazenamento.verificarBucket(true); // cria na primeira vez (como o compose de desenvolvimento)
    }

    @AfterAll
    static void fechar() {
        cliente.close();
    }

    @Test
    void gravaLeERemove() {
        String chave = armazenamento.salvar("animais/123", "webp", CONTEUDO);
        assertThat(chave).startsWith("animais/123/").endsWith(".webp");

        Optional<ArquivoArmazenado> lido = armazenamento.obter(chave);
        assertThat(lido).isPresent();
        assertThat(lido.get().contentType()).isEqualTo("image/webp");

        armazenamento.remover(chave);
        assertThat(armazenamento.obter(chave)).isEmpty();
    }

    @Test
    void fotoGravadaVaiComCacheLongo() {
        String chave = armazenamento.salvar("animais/123", "jpg", CONTEUDO);
        var cabecalho = cliente.headObject(b -> b.bucket(BUCKET).key(chave));
        assertThat(cabecalho.cacheControl()).isEqualTo(ArmazenamentoS3.CACHE_DAS_FOTOS);
        assertThat(cabecalho.contentType()).isEqualTo("image/jpeg");
    }

    @Test
    void chaveInexistenteDaVazioERemoverNaoFalha() {
        assertThat(armazenamento.obter("animais/123/nao-existe.webp")).isEmpty();
        armazenamento.remover("animais/123/nao-existe.webp");
    }

    @Test
    void recusaChaveQueTentaSairDaPasta() {
        assertThatThrownBy(() -> armazenamento.obter("../segredo.txt")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> armazenamento.obter("/animais/x.webp")).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void enderecoDaFotoPeloBackendOuDiretoDoBucket() {
        assertThat(armazenamento.urlPublica("animais/1/a.webp")).isEqualTo("/arquivos/animais/1/a.webp");

        var comDominio = new ArmazenamentoS3(cliente, BUCKET, "https://fotos.exemplo.org/");
        assertThat(comDominio.urlPublica("animais/1/a.webp")).isEqualTo("https://fotos.exemplo.org/animais/1/a.webp");
    }

    @Test
    void bucketInexistenteImpedeAPartidaComMensagemClara() {
        var semBucket = new ArmazenamentoS3(cliente, "bucket-que-nao-existe", "");
        assertThatThrownBy(() -> semBucket.verificarBucket(false))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("bucket-que-nao-existe")
                .hasMessageContaining("não existe");
    }

    @Test
    void chaveErradaImpedeAPartidaComMensagemClara() {
        try (S3Client errado = ConfiguracaoArmazenamentoS3.criarCliente(endereco(), "us-east-1", "ninguem", "senha-errada")) {
            var semAcesso = new ArmazenamentoS3(errado, BUCKET, "");
            assertThatThrownBy(() -> semAcesso.verificarBucket(false))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("S3_CHAVE_ACESSO");
        }
    }
}
