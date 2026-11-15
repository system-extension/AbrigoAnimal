package br.org.abrigo.plataforma.internal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Liga o ArmazenamentoS3 quando ARMAZENAMENTO_TIPO=s3 (ADR 0015).
 * Se faltar alguma variável, a aplicação não sobe e diz qual falta.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = "abrigo.armazenamento.tipo", havingValue = "s3")
class ConfiguracaoArmazenamentoS3 {

    @Bean(destroyMethod = "close")
    S3Client clienteS3(@Value("${abrigo.armazenamento.s3.endpoint:}") String endpoint,
                       @Value("${abrigo.armazenamento.s3.regiao:auto}") String regiao,
                       @Value("${abrigo.armazenamento.s3.bucket:}") String bucket,
                       @Value("${abrigo.armazenamento.s3.chave-acesso:}") String chaveAcesso,
                       @Value("${abrigo.armazenamento.s3.chave-secreta:}") String chaveSecreta) {
        List<String> faltando = new ArrayList<>();
        if (endpoint.isBlank()) {
            faltando.add("S3_ENDPOINT");
        }
        if (bucket.isBlank()) {
            faltando.add("S3_BUCKET");
        }
        if (chaveAcesso.isBlank()) {
            faltando.add("S3_CHAVE_ACESSO");
        }
        if (chaveSecreta.isBlank()) {
            faltando.add("S3_CHAVE_SECRETA");
        }
        if (!faltando.isEmpty()) {
            throw new IllegalStateException("ARMAZENAMENTO_TIPO=s3, mas faltam as variáveis: " + String.join(", ", faltando));
        }
        return criarCliente(endpoint, regiao, chaveAcesso, chaveSecreta);
    }

    @Bean
    ArmazenamentoS3 armazenamentoS3(S3Client s3,
                                    @Value("${abrigo.armazenamento.s3.bucket}") String bucket,
                                    @Value("${abrigo.armazenamento.s3.url-publica:}") String urlPublica,
                                    @Value("${abrigo.armazenamento.s3.criar-bucket:false}") boolean criarBucket) {
        ArmazenamentoS3 armazenamento = new ArmazenamentoS3(s3, bucket, urlPublica);
        armazenamento.verificarBucket(criarBucket);
        return armazenamento;
    }

    /**
     * Cliente S3 compatível com R2 e MinIO/Silo:
     * - endereço "por caminho" (endpoint/bucket/chave), aceito pelos dois;
     * - checksums só quando obrigatórios: os automáticos das versões novas do SDK da AWS
     *   não são aceitos por todos os serviços compatíveis com S3 (recomendação da Cloudflare para o R2).
     */
    static S3Client criarCliente(String endpoint, String regiao, String chaveAcesso, String chaveSecreta) {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(regiao))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(chaveAcesso, chaveSecreta)))
                .forcePathStyle(true)
                .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED)
                .build();
    }
}
