package br.com.abrigojoinville.modelo;

/**
 * Modelo para exibição de campanhas e destaques no carrossel da aplicação.
 */
public class Destaque {
    private String id;
    private String titulo;
    private String subtitulo;
    private String descricao;
    private String imagemUrl;
    private String acao;

    public Destaque() {}

    public Destaque(String id, String titulo, String subtitulo, String descricao, String imagemUrl, String acao) {
        this.id = id;
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.descricao = descricao;
        this.imagemUrl = imagemUrl;
        this.acao = acao;
    }

    public String getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getSubtitulo() { return subtitulo; }
    public String getDescricao() { return descricao; }
    public String getImagemUrl() { return imagemUrl; }
    public String getAcao() { return acao; }

    public String paraJson() {
        return String.format(
            "{\"id\":\"%s\",\"titulo\":\"%s\",\"subtitulo\":\"%s\",\"descricao\":\"%s\",\"imagemUrl\":\"%s\",\"acao\":\"%s\"}",
            escapar(id), escapar(titulo), escapar(subtitulo), escapar(descricao), escapar(imagemUrl), escapar(acao)
        );
    }

    private String escapar(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }
}
