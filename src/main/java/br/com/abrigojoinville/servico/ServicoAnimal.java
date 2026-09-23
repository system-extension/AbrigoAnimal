package br.com.abrigojoinville.servico;

import br.com.abrigojoinville.modelo.Animal;
import br.com.abrigojoinville.modelo.Destaque;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Serviço responsável por gerenciar os dados dos animais e informações do Abrigo Joinville.
 */
public class ServicoAnimal {

    private final List<Animal> animais = new ArrayList<>();
    private final List<Destaque> destaques = new ArrayList<>();

    public ServicoAnimal() {
        carregarDadosIniciais();
    }

    private void carregarDadosIniciais() {
        // Inicializa animais para adoção
        animais.add(new Animal(
            "1",
            "Thor",
            "cachorro",
            "2 anos",
            "grande",
            "macho",
            "Thor é um vira-lata brincalhão, muito carinhoso e cheio de energia. Adora correr no gramado e se dá super bem com crianças.",
            "/assets/images/cao-card.png",
            true,
            true,
            "disponivel",
            "Brincalhão, dócil e protetor"
        ));

        animais.add(new Animal(
            "2",
            "Mel",
            "cachorro",
            "3 anos",
            "medio",
            "femea",
            "Mel é uma cachorrinha alegre e muito afetuosa. Ela gosta de companhia, passeios tranquilos e está pronta para conhecer sua nova família.",
            "/assets/images/cao-card.png",
            true,
            true,
            "disponivel",
            "Carinhosa, sociável e brincalhona"
        ));

        animais.add(new Animal(
            "3",
            "Pipoca",
            "cachorro",
            "6 meses",
            "medio",
            "femea",
            "Pipoca é uma filhotinha resgatada muito sociável e inteligente. Perfeita para quem busca um novo amigo para a família.",
            "/assets/images/cao-card.png",
            true,
            false,
            "disponivel",
            "Ativa, sociável e brincalhona"
        ));

        animais.add(new Animal(
            "4",
            "Max",
            "cachorro",
            "8 anos",
            "grande",
            "macho",
            "Max é um cãozinho idoso, extremamente dócil e companheiro. Precisa de um lar tranquilo e amoroso para passar sua aposentadoria.",
            "/assets/images/cao-card.png",
            true,
            true,
            "disponivel",
            "Tranquilo, carinhoso e amável"
        ));

        animais.add(new Animal(
            "5",
            "Bento",
            "cachorro",
            "4 anos",
            "pequeno",
            "macho",
            "Bento é um cãozinho tranquilo que adora ficar perto das pessoas. Ele procura uma família paciente e cheia de carinho.",
            "/assets/images/cao-card.png",
            true,
            true,
            "disponivel",
            "Calmo, dócil e companheiro"
        ));

        animais.add(new Animal(
            "6",
            "Nina",
            "cachorro",
            "7 anos",
            "pequeno",
            "femea",
            "Nina é uma cachorrinha meiga e observadora. Gosta de carinho, caminhas confortáveis e de uma rotina tranquila ao lado de quem ama.",
            "/assets/images/cao-card.png",
            true,
            true,
            "disponivel",
            "Meiga, tranquila e companheira"
        ));

        adicionarMaisCaesParaAdocao();
        animais.forEach(animal -> animal.setUrlFoto("/assets/images/cao-card.jpg"));

        // Inicializa destaques para o carrossel da tela principal
        destaques.add(new Destaque(
            "d1",
            "Adote um Amigo em Joinville",
            "Cães resgatados esperam por um lar amoroso",
            "Venha visitar o abrigo e encontre seu parceiro para a vida toda. Todos os animais são castrados e vacinados.",
            "https://images.unsplash.com/photo-1450778869186-39d32b810d60?w=1000&auto=format&fit=crop",
            "ver_animais"
        ));

        destaques.add(new Destaque(
            "d2",
            "Apadrinhamento de Animais Idosos",
            "Apoie os cuidados com os cães idosos",
            "A contribuição mensal ajuda na alimentação especial e na medicação dos cães idosos.",
            "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=1000&auto=format&fit=crop",
            "apadrinhar"
        ));

        destaques.add(new Destaque(
            "d3",
            "Faça uma Doação via PIX",
            "Sua ajuda salva vidas diariamente",
            "Utilize nossa chave PIX CNPJ 12.345.678/0001-99 para apoiar compras de ração, vacinas e tratamentos médicos.",
            "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1000&auto=format&fit=crop",
            "doar_pix"
        ));
    }

    private void adicionarMaisCaesParaAdocao() {
        String[] nomes = {"Amora", "Bob", "Cacau", "Dengo", "Estrela", "Fubá", "Gaia", "Hugo", "Ivy", "Joca", "Kiara", "Lola", "Maya", "Nino", "Olívia", "Pingo", "Quincas", "Rita", "Sol", "Teca", "Uva", "Valente", "Xodó", "Yara", "Zeca", "Ayla", "Bóris", "Cora", "Duque", "Frida"};
        String[] idades = {"8 anos", "9 anos", "10 anos", "11 anos", "12 anos", "8 anos", "9 anos", "10 anos", "11 anos", "12 anos", "8 anos", "9 anos"};
        String[] portes = {"pequeno", "medio", "grande"};
        String[] fotosNaturais = {
            "/assets/images/cao-card.png",
            "/assets/images/cao-card.png",
            "/assets/images/cao-card.png",
            "/assets/images/cao-card.png",
            "/assets/images/cao-card.png",
            "/assets/images/cao-card.png"
        };

        // Max, já cadastrado acima, mais estes 15 cães formam os 16 idosos do abrigo.
        for (int i = 0; i < 15; i++) {
            boolean femea = i % 2 == 0;
            animais.add(new Animal(
                String.valueOf(i + 7), nomes[i], "cachorro", idades[i % idades.length],
                portes[i % portes.length], femea ? "femea" : "macho",
                nomes[i] + " é um cão resgatado cheio de carinho, pronto para viver uma nova história ao lado de uma família amorosa.",
                fotosNaturais[i % fotosNaturais.length], true, i % 4 != 0, "disponivel",
                i % 3 == 0 ? "Tranquilo e companheiro" : "Carinhoso e sociável"
            ));
        }
    }

    public List<Animal> listarAnimais(String especie) {
        if (especie == null || especie.isBlank() || especie.equalsIgnoreCase("todos")) {
            return animais;
        }
        return animais.stream()
            .filter(a -> a.getEspecie().equalsIgnoreCase(especie))
            .collect(Collectors.toList());
    }

    public Optional<Animal> buscarAnimalPorId(String id) {
        return animais.stream().filter(a -> a.getId().equals(id)).findFirst();
    }

    public List<Destaque> listarDestaques() {
        return destaques;
    }

    public String obterInformacoesAbrigoJson() {
        return "{"
            + "\"nomeAbrigo\":\"Abrigo Animal Joinville\","
            + "\"cidade\":\"Joinville - SC\","
            + "\"chavePix\":\"12.345.678/0001-99\","
            + "\"banco\":\"Banco do Brasil\","
            + "\"titular\":\"Associação de Proteção Animal Joinville\","
            + "\"endereco\":\"Estrada Mário Bächtold, 445, Joinville, Santa Catarina\","
            + "\"horarioVisita\":\"Segunda a Sábado, das 09h às 17h\","
            + "\"totalAnimaisResgatados\":124,"
            + "\"telefone\":\"(47) 99999-8888\","
            + "\"email\":\"contato@abrigojoinville.org.br\""
            + "}";
    }

    public String converterListaAnimaisParaJson(List<Animal> lista) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            json.append(lista.get(i).paraJson());
            if (i < lista.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");
        return json.toString();
    }

    public String converterListaDestaquesParaJson(List<Destaque> lista) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < lista.size(); i++) {
            json.append(lista.get(i).paraJson());
            if (i < lista.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");
        return json.toString();
    }
}
