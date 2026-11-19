package br.org.abrigo.plataforma;

import org.springframework.core.io.Resource;

import java.util.Optional;

/**
 * Onde as fotos ficam guardadas. É uma INTERFACE de propósito:
 * hoje a implementação grava em disco (ArmazenamentoLocal); quando a hospedagem
 * for decidida, uma implementação para Cloudflare R2/S3 substitui esta sem
 * mudar nenhum módulo de negócio.
 */
public interface ArmazenamentoArquivos {

    /**
     * Grava o conteúdo e devolve a "chave" (caminho lógico) do arquivo,
     * ex.: animais/3f2a.../a1b2....webp
     */
    String salvar(String pasta, String extensao, byte[] conteudo);

    /**
     * Grava com uma chave escolhida por quem chama (sobrescreve se já existir).
     * Usado para as versões menores de uma foto, que derivam da chave do original.
     */
    void gravar(String chave, byte[] conteudo);

    Optional<ArquivoArmazenado> obter(String chave);

    void remover(String chave);

    /** URL pública (relativa) para exibir o arquivo no navegador. */
    default String urlPublica(String chave) {
        return "/arquivos/" + chave;
    }

    record ArquivoArmazenado(Resource recurso, String contentType) {
    }
}
