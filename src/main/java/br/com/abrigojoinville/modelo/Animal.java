package br.com.abrigojoinville.modelo;

/**
 * Modelo que representa um animal resgatado pelo Abrigo Animal Joinville.
 * Todos os atributos e comentários estão definidos em Português.
 */
public class Animal {
    private String id;
    private String nome;
    private String especie; // "cachorro" ou "gato"
    private String idade;
    private String porte;   // "pequeno", "medio", "grande"
    private String sexo;    // "macho" ou "femea"
    private String descricao;
    private String urlFoto;
    private boolean vacinado;
    private boolean castrado;
    private String status;  // "disponivel", "em_processo", "adotado"
    private String temperamento;

    public Animal() {}

    public Animal(String id, String nome, String especie, String idade, String porte, 
                  String sexo, String descricao, String urlFoto, boolean vacinado, 
                  boolean castrado, String status, String temperamento) {
        this.id = id;
        this.nome = nome;
        this.especie = especie;
        this.idade = idade;
        this.porte = porte;
        this.sexo = sexo;
        this.descricao = descricao;
        this.urlFoto = urlFoto;
        this.vacinado = vacinado;
        this.castrado = castrado;
        this.status = status;
        this.temperamento = temperamento;
    }

    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getIdade() { return idade; }
    public void setIdade(String idade) { this.idade = idade; }

    public String getPorte() { return porte; }
    public void setPorte(String porte) { this.porte = porte; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public String getUrlFoto() { return urlFoto; }
    public void setUrlFoto(String urlFoto) { this.urlFoto = urlFoto; }

    public boolean isVacinado() { return vacinado; }
    public void setVacinado(boolean vacinado) { this.vacinado = vacinado; }

    public boolean isCastrado() { return castrado; }
    public void setCastrado(boolean castrado) { this.castrado = castrado; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTemperamento() { return temperamento; }
    public void setTemperamento(String temperamento) { this.temperamento = temperamento; }

    /**
     * Converte o objeto para representação JSON formatada.
     */
    public String paraJson() {
        return String.format(
            "{\"id\":\"%s\",\"nome\":\"%s\",\"especie\":\"%s\",\"idade\":\"%s\",\"porte\":\"%s\",\"sexo\":\"%s\",\"descricao\":\"%s\",\"urlFoto\":\"%s\",\"vacinado\":%b,\"castrado\":%b,\"status\":\"%s\",\"temperamento\":\"%s\"}",
            escaparJson(id),
            escaparJson(nome),
            escaparJson(especie),
            escaparJson(idade),
            escaparJson(porte),
            escaparJson(sexo),
            escaparJson(descricao),
            escaparJson(urlFoto),
            vacinado,
            castrado,
            escaparJson(status),
            escaparJson(temperamento)
        );
    }

    private String escaparJson(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
