package br.org.abrigo.vitrine.internal;

import br.org.abrigo.animais.AnimalService;
import br.org.abrigo.animais.AnimalVitrine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Quando alguém cola o link /animais/thor-3f2a1b no WhatsApp, o WhatsApp baixa o HTML
 * (sem executar JavaScript) e procura as meta tags og:*. Por isso esta rota devolve o
 * index.html do React JÁ com as tags do animal — prévia com foto, sem precisar de SSR/Next.js.
 * No navegador, o React carrega normalmente e mostra a página do animal.
 */
@RestController
class OpenGraphController {

    private static final MediaType HTML_UTF8 = new MediaType("text", "html", StandardCharsets.UTF_8);
    private static final String INDEX_MINIMO = """
            <!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1"><title>Abrigo Animal</title>
            </head><body><div id="root"></div></body></html>
            """;

    private final AnimalService animais;
    private final String urlPublica;

    OpenGraphController(AnimalService animais, @Value("${abrigo.url-publica}") String urlPublica) {
        this.animais = animais;
        this.urlPublica = urlPublica.endsWith("/") ? urlPublica.substring(0, urlPublica.length() - 1) : urlPublica;
    }

    @GetMapping(path = "/animais/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    ResponseEntity<String> pagina(@PathVariable String slug) {
        String index = lerIndex();
        Optional<AnimalVitrine> animal = animais.buscarVitrinePorSlug(slug);
        if (animal.isEmpty()) {
            // O React mostra "animal não encontrado"; status 404 para buscadores.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(HTML_UTF8).body(index);
        }
        String html = index.replace("</head>", metaTags(animal.get(), slug) + "</head>");
        return ResponseEntity.ok().contentType(HTML_UTF8).body(html);
    }

    String metaTags(AnimalVitrine a, String slug) {
        String titulo = a.nome() + " | Abrigo Animal";
        String descricao = a.descricao() == null
                ? "Conheça " + a.nome() + " e ajude: apadrinhe ou adote."
                : resumir(a.descricao(), 180);
        StringBuilder sb = new StringBuilder();
        meta(sb, "og:type", "website");
        meta(sb, "og:site_name", "Abrigo Animal");
        meta(sb, "og:title", titulo);
        meta(sb, "og:description", descricao);
        meta(sb, "og:url", urlPublica + "/animais/" + slug);
        if (a.fotoPrincipal() != null) {
            // Com as fotos no R2 por domínio próprio, o endereço já vem completo (https://...).
            String foto = a.fotoPrincipal();
            meta(sb, "og:image", foto.startsWith("http") ? foto : urlPublica + foto);
        }
        sb.append("<meta name=\"twitter:card\" content=\"summary_large_image\">\n");
        return sb.toString();
    }

    private static void meta(StringBuilder sb, String propriedade, String valor) {
        sb.append("<meta property=\"").append(propriedade).append("\" content=\"")
                .append(HtmlUtils.htmlEscape(valor)).append("\">\n");
    }

    private static String resumir(String texto, int max) {
        String limpo = texto.replaceAll("\\s+", " ").trim();
        return limpo.length() <= max ? limpo : limpo.substring(0, max - 1) + "…";
    }

    private static String lerIndex() {
        ClassPathResource index = new ClassPathResource("static/index.html");
        if (!index.exists()) {
            return INDEX_MINIMO;
        }
        try (InputStream in = index.getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return INDEX_MINIMO;
        }
    }
}
