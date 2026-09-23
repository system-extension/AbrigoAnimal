package br.com.abrigojoinville;

import br.com.abrigojoinville.controlador.ControladorApi;
import br.com.abrigojoinville.servico.ServicoAnimal;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

/**
 * Classe principal da aplicação do Abrigo Animal Joinville.
 * Inicia o servidor HTTP em Java 21 integrando a API REST JSON e o frontend.
 */
public final class App {

    private static final int PORTA = Integer.parseInt(
        System.getenv().getOrDefault("ABRIGO_PORTA", "8765")
    );
    private static final Path DIRETORIO_PUBLICO = Path.of("public").toAbsolutePath().normalize();
    private static final Map<String, String> TIPOS_MIME = Map.of(
        "html", "text/html; charset=UTF-8",
        "css", "text/css; charset=UTF-8",
        "js", "application/javascript; charset=UTF-8",
        "png", "image/png",
        "jpg", "image/jpeg",
        "jpeg", "image/jpeg",
        "svg", "image/svg+xml",
        "ico", "image/x-icon"
    );

    private App() {}

    public static void main(String[] args) throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(PORTA), 0);

        ServicoAnimal servicoAnimal = new ServicoAnimal();
        ControladorApi controladorApi = new ControladorApi(servicoAnimal);

        // Mapeia o contexto da API REST JSON
        servidor.createContext("/api", controladorApi);

        // Mapeia o contexto raiz para servir o frontend
        servidor.createContext("/", App::servirArquivosEstaticos);

        servidor.start();
        System.out.println("=================================================");
        System.out.println(" Servidor Abrigo Animal Joinville (Backend Java)");
        System.out.println(" API REST ativa em: http://localhost:" + PORTA + "/api/animais");
        System.out.println(" Informações do Abrigo: http://localhost:" + PORTA + "/api/informacoes");
        System.out.println("=================================================");
    }

    private static void servirArquivosEstaticos(HttpExchange troca) throws IOException {
        String caminhoRequisicao = troca.getRequestURI().getPath();

        // Adiciona cabeçalhos CORS também para arquivos estáticos
        troca.getResponseHeaders().set("Access-Control-Allow-Origin", "*");

        String caminhoRelativo = caminhoRequisicao.equals("/") ? "index.html" : caminhoRequisicao.substring(1);

        // 1ª tentativa: pasta public/
        Path arquivo = DIRETORIO_PUBLICO.resolve(caminhoRelativo).normalize();

        // 2ª tentativa: raiz do projeto (para assets/, css/, etc.)
        if (!arquivo.startsWith(DIRETORIO_PUBLICO) || !Files.isRegularFile(arquivo)) {
            Path raizProjeto = Path.of(".").toAbsolutePath().normalize();
            arquivo = raizProjeto.resolve(caminhoRelativo).normalize();
        }

        if (!Files.isRegularFile(arquivo)) {
            byte[] bytes = "Não encontrado".getBytes();
            troca.sendResponseHeaders(404, bytes.length);
            try (OutputStream saida = troca.getResponseBody()) { saida.write(bytes); }
            troca.close();
            return;
        }

        String extensao = extrairExtensao(arquivo.getFileName().toString());
        troca.getResponseHeaders().set("Content-Type", TIPOS_MIME.getOrDefault(extensao, "application/octet-stream"));
        
        byte[] conteudo = Files.readAllBytes(arquivo);
        if ("html".equals(extensao)) {
            String pagina = new String(conteudo, StandardCharsets.UTF_8);
            if (!pagina.contains("rel=\"icon\"")) {
                pagina = pagina.replace(
                    "</head>",
                    "<link rel=\"icon\" type=\"image/png\" href=\"/assets/images/logo.png?v=3\"></head>"
                );
                conteudo = pagina.getBytes(StandardCharsets.UTF_8);
            }
        }
        troca.sendResponseHeaders(200, conteudo.length);
        try (OutputStream saida = troca.getResponseBody()) {
            saida.write(conteudo);
        }
        troca.close();
    }

    private static String extrairExtensao(String nomeArquivo) {
        int ponto = nomeArquivo.lastIndexOf('.');
        return ponto < 0 ? "" : nomeArquivo.substring(ponto + 1).toLowerCase();
    }
}
