package br.org.abrigo.animais.internal.domain;

import br.org.abrigo.animais.Especie;
import br.org.abrigo.animais.Porte;
import br.org.abrigo.animais.Sexo;
import br.org.abrigo.animais.SituacaoAnimal;
import br.org.abrigo.plataforma.EntidadeBase;
import br.org.abrigo.plataforma.RegraNegocioException;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Animal do abrigo. As REGRAS ficam aqui (não no controller, nem no service):
 * assim são testadas com JUnit puro, sem subir Spring nem banco (ver AnimalTest).
 */
@Entity
@Table(name = "animal")
public class Animal extends EntidadeBase {

    public static final int MAXIMO_FOTOS = 10;
    public static final int MAXIMO_TEMPERAMENTOS = 8;

    @Column(nullable = false, length = 120)
    private String nome;

    /** Identificador da URL pública. Não muda quando o nome é editado (links compartilhados continuam valendo). */
    @Column(nullable = false, length = 160, updatable = false)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Especie especie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Sexo sexo;

    @Column(length = 80)
    private String cor;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Porte porte;

    private LocalDate dataNascimentoEstimada;

    /** null = não informado (as planilhas da ONG não têm esse dado). */
    private Boolean castrado;

    /** Microchip: identidade real do animal (há vários "Marley", cada um com seu chip). */
    @Column(length = 40)
    private String chip;

    /** Segundo chip, aplicado quando o primeiro parou de ler. */
    @Column(length = 40)
    private String chipAdicional;

    @Column(length = 40)
    private String ala;

    @Column(length = 40)
    private String canil;

    /** Marcado pela equipe (não há data de nascimento para calcular). Carro-chefe do apadrinhamento. */
    @Column(nullable = false)
    private boolean idoso;

    @Column(columnDefinition = "text")
    private String descricao;

    @Convert(converter = ListaTextoConverter.class)
    @Column(length = 300)
    private List<String> temperamento = new ArrayList<>();

    /** Ficha descritiva de saúde (RF-08). Texto livre, pública. NÃO é prontuário. Preenchida = medicação contínua. */
    @Column(columnDefinition = "text")
    private String medicacoes;

    @Column(columnDefinition = "text")
    private String condicoesSaude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SituacaoAnimal situacao;

    private LocalDate dataObito;

    @Column(nullable = false)
    private boolean visivelNaVitrine;

    @OneToMany(mappedBy = "animal", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("ordem ASC")
    @BatchSize(size = 50)
    private List<FotoAnimal> fotos = new ArrayList<>();

    protected Animal() {
        // exigido pelo JPA
    }

    // ------------------------------------------------------------------ criação e edição

    public static Animal cadastrar(DadosAnimal dados) {
        Animal a = new Animal();
        a.aplicar(dados);
        a.slug = Slugs.gerar(a.nome, a.getId());
        a.situacao = SituacaoAnimal.DISPONIVEL;
        a.visivelNaVitrine = true;
        return a;
    }

    public void atualizar(DadosAnimal dados) {
        aplicar(dados);
    }

    private void aplicar(DadosAnimal d) {
        if (d.nome() == null || d.nome().isBlank()) {
            throw new RegraNegocioException("O nome do animal é obrigatório.");
        }
        if (d.especie() == null) {
            throw new RegraNegocioException("A espécie do animal é obrigatória.");
        }
        String chip = limparChip(d.chip());
        String chipAdicional = limparChip(d.chipAdicional());
        if (chipAdicional != null && chipAdicional.equals(chip)) {
            throw new RegraNegocioException("O chip adicional é igual ao chip principal.");
        }
        if (chipAdicional != null && chip == null) {
            // não faz sentido ter "o segundo" sem o primeiro
            chip = chipAdicional;
            chipAdicional = null;
        }
        List<String> etiquetas = d.temperamento() == null ? List.of()
                : d.temperamento().stream().map(Animal::limpar).filter(java.util.Objects::nonNull).distinct().toList();
        if (etiquetas.size() > MAXIMO_TEMPERAMENTOS) {
            throw new RegraNegocioException("Escolha no máximo " + MAXIMO_TEMPERAMENTOS + " características.");
        }
        if (etiquetas.stream().anyMatch(t -> t.contains(ListaTextoConverter.SEPARADOR) || t.length() > 30)) {
            throw new RegraNegocioException("Característica inválida (máximo de 30 letras, sem \"|\").");
        }

        this.nome = d.nome().trim();
        this.especie = d.especie();
        this.sexo = d.sexo() == null ? Sexo.INDEFINIDO : d.sexo();
        this.cor = limpar(d.cor());
        this.porte = d.porte();
        this.dataNascimentoEstimada = d.dataNascimentoEstimada();
        this.castrado = d.castrado();
        this.chip = chip;
        this.chipAdicional = chipAdicional;
        this.ala = limpar(d.ala());
        this.canil = limpar(d.canil());
        this.idoso = d.idoso();
        this.descricao = limpar(d.descricao());
        this.temperamento = new ArrayList<>(etiquetas);
        this.medicacoes = limpar(d.medicacoes());
        this.condicoesSaude = limpar(d.condicoesSaude());
    }

    // ------------------------------------------------------------------ situação

    public void alterarSituacao(SituacaoAnimal nova) {
        if (nova == null) {
            throw new RegraNegocioException("Informe a nova situação.");
        }
        if (this.situacao == SituacaoAnimal.OBITO) {
            throw new RegraNegocioException("Um animal com óbito registrado não pode mudar de situação.");
        }
        if (nova == SituacaoAnimal.OBITO) {
            throw new RegraNegocioException("Use o registro de óbito para informar o falecimento.");
        }
        this.situacao = nova;
    }

    /** Óbito é estado final: some da vitrine e não aceita novos apadrinhamentos. */
    public void registrarObito(LocalDate data, LocalDate hoje) {
        if (this.situacao == SituacaoAnimal.OBITO) {
            throw new RegraNegocioException("O óbito deste animal já foi registrado.");
        }
        if (data == null || data.isAfter(hoje)) {
            throw new RegraNegocioException("A data do óbito é obrigatória e não pode ser futura.");
        }
        this.situacao = SituacaoAnimal.OBITO;
        this.dataObito = data;
        this.visivelNaVitrine = false;
    }

    // ------------------------------------------------------------------ vitrine

    public void publicarNaVitrine() {
        if (this.situacao == SituacaoAnimal.OBITO) {
            throw new RegraNegocioException("Um animal com óbito registrado não pode aparecer na vitrine.");
        }
        this.visivelNaVitrine = true;
    }

    public void ocultarDaVitrine() {
        this.visivelNaVitrine = false;
    }

    public boolean estaNaVitrine() {
        return visivelNaVitrine && situacao != SituacaoAnimal.OBITO;
    }

    // ------------------------------------------------------------------ fotos

    public FotoAnimal adicionarFoto(String chaveArquivo, Instant agora) {
        if (fotos.size() >= MAXIMO_FOTOS) {
            throw new RegraNegocioException("Limite de " + MAXIMO_FOTOS + " fotos por animal atingido.");
        }
        int proximaOrdem = fotos.stream().mapToInt(FotoAnimal::getOrdem).max().orElse(-1) + 1;
        FotoAnimal foto = new FotoAnimal(this, chaveArquivo, proximaOrdem, fotos.isEmpty(), agora);
        fotos.add(foto);
        return foto;
    }

    /** Remove a foto e devolve a chave do arquivo (para apagar do armazenamento). */
    public String removerFoto(UUID fotoId) {
        FotoAnimal foto = buscarFoto(fotoId);
        fotos.remove(foto);
        if (foto.isPrincipal() && !fotos.isEmpty()) {
            fotos.get(0).marcarPrincipal(true);
        }
        return foto.getChaveArquivo();
    }

    public void definirFotoPrincipal(UUID fotoId) {
        FotoAnimal escolhida = buscarFoto(fotoId);
        fotos.forEach(f -> f.marcarPrincipal(f.equals(escolhida)));
    }

    public Optional<FotoAnimal> fotoPrincipal() {
        return fotos.stream().filter(FotoAnimal::isPrincipal).findFirst();
    }

    private FotoAnimal buscarFoto(UUID fotoId) {
        return fotos.stream()
                .filter(f -> f.getId().equals(fotoId))
                .findFirst()
                .orElseThrow(() -> new RegraNegocioException("Foto não pertence a este animal."));
    }

    // ------------------------------------------------------------------ consultas

    public Integer idadeEmAnos(LocalDate hoje) {
        if (dataNascimentoEstimada == null) {
            return null;
        }
        return Period.between(dataNascimentoEstimada, hoje).getYears();
    }

    public boolean podeSerApadrinhado() {
        return situacao != SituacaoAnimal.OBITO;
    }

    /** Recebe vacina/vermífugo? Óbito não; adotado também não (já não está sob cuidado da ONG). */
    public boolean estaSobCuidadoDaOng() {
        return situacao == SituacaoAnimal.DISPONIVEL || situacao == SituacaoAnimal.EM_TRATAMENTO;
    }

    public boolean usaMedicacaoContinua() {
        return medicacoes != null;
    }

    private static String limpar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    /** Chip é número: tira espaços internos (a planilha tem "963003002252391/ 963003002176468"). */
    public static String limparChip(String valor) {
        String v = limpar(valor);
        return v == null ? null : v.replaceAll("\\s+", "");
    }

    // ------------------------------------------------------------------ getters

    public String getNome() { return nome; }
    public String getSlug() { return slug; }
    public Especie getEspecie() { return especie; }
    public Sexo getSexo() { return sexo; }
    public String getCor() { return cor; }
    public Porte getPorte() { return porte; }
    public LocalDate getDataNascimentoEstimada() { return dataNascimentoEstimada; }
    public Boolean getCastrado() { return castrado; }
    public String getChip() { return chip; }
    public String getChipAdicional() { return chipAdicional; }
    public String getAla() { return ala; }
    public String getCanil() { return canil; }
    public boolean isIdoso() { return idoso; }
    public String getDescricao() { return descricao; }
    public List<String> getTemperamento() { return Collections.unmodifiableList(temperamento); }
    public String getMedicacoes() { return medicacoes; }
    public String getCondicoesSaude() { return condicoesSaude; }
    public SituacaoAnimal getSituacao() { return situacao; }
    public LocalDate getDataObito() { return dataObito; }
    public boolean isVisivelNaVitrine() { return visivelNaVitrine; }
    public List<FotoAnimal> getFotos() { return Collections.unmodifiableList(fotos); }
}
