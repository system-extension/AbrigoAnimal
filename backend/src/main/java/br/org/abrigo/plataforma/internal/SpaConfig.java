package br.org.abrigo.plataforma.internal;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Entrega o frontend (build do React em classpath:/static) e faz o "fallback de SPA":
 * qualquer rota que não seja arquivo, /api ou /actuator devolve o index.html,
 * para o React Router decidir a tela (ex.: F5 em /gestao/padrinhos/12).
 *
 * <p>Cache: os arquivos de /assets têm o "hash" do conteúdo no nome (ex.: index-B3k9.js), então
 * podem ficar 1 ano no navegador. Já o index.html (e as rotas que caem nele) é sempre revalidado:
 * assim, depois de um deploy, ninguém fica preso a um index.html antigo apontando para arquivos
 * que não existem mais (a famosa "tela branca").
 *
 * <p>Obs.: o mapeamento estático padrão do Boot está desligado em application.yml
 * (spring.web.resources.add-mappings=false) para este ser o único.
 */
@Configuration(proxyBeanMethods = false)
class SpaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/")
                .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                .resourceChain(true);

        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.noCache())
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String caminho, Resource local) throws IOException {
                        if (caminho.contains("..")) {
                            return null;
                        }
                        Resource solicitado = local.createRelative(caminho);
                        if (solicitado.exists() && solicitado.isReadable()) {
                            return solicitado;
                        }
                        boolean pareceArquivo = caminho.contains(".");
                        boolean rotaDeServidor = caminho.startsWith("api/") || caminho.startsWith("actuator/")
                                || caminho.startsWith("arquivos/");
                        if (pareceArquivo || rotaDeServidor) {
                            return null; // 404 de verdade
                        }
                        Resource index = new ClassPathResource("/static/index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
