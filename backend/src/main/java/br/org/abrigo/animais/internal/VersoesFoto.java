package br.org.abrigo.animais.internal;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;

/**
 * Versões menores de cada foto (ADR 0015), geradas no envio e gravadas ao lado do original:
 * <pre>
 *   animais/&lt;id&gt;/&lt;uuid&gt;.webp     original (até 1600 px, como chegou do celular): tela cheia
 *   animais/&lt;id&gt;/&lt;uuid&gt;-m.jpg    média (lado menor 600 px): cartões, página do animal, prévia do WhatsApp
 *   animais/&lt;id&gt;/&lt;uuid&gt;-p.jpg    mini (lado menor 240 px): miniaturas e listas do painel
 * </pre>
 * O limite vale para o LADO MENOR porque as telas mostram as fotos recortadas (quadrado, 4:5):
 * quem enche a moldura é o lado menor. Limitar o lado maior deixava uma foto em pé
 * (900x1600) com só 450 px de largura na média, e ela ficava borrada ao ser esticada.
 * As chaves das versões derivam da chave do original: o banco continua guardando uma chave só.
 * JPEG porque o Java grava JPEG sem bibliotecas extras e porque é o formato que qualquer
 * aplicativo aceita na prévia de link.
 */
final class VersoesFoto {

    enum Versao {
        MEDIA(600, "-m"),
        MINI(240, "-p");

        /** Tamanho máximo do lado menor da foto, em pixels. */
        final int ladoMenor;
        final String sufixo;

        Versao(int ladoMenor, String sufixo) {
            this.ladoMenor = ladoMenor;
            this.sufixo = sufixo;
        }
    }

    /** 0,85: a foto já chega comprimida do celular; abaixo disso a segunda compressão aparece. */
    static final float QUALIDADE_JPEG = 0.85f;

    static {
        // Registra o leitor de WEBP (TwelveMonkeys) também dentro do jar do Spring Boot,
        // onde a descoberta automática de plugins do ImageIO nem sempre enxerga as bibliotecas.
        ImageIO.scanForPlugins();
    }

    private VersoesFoto() {
    }

    /** animais/x/abc.webp + MEDIA → animais/x/abc-m.jpg */
    static String chave(String chaveOriginal, Versao versao) {
        int ponto = chaveOriginal.lastIndexOf('.');
        String base = ponto > chaveOriginal.lastIndexOf('/') ? chaveOriginal.substring(0, ponto) : chaveOriginal;
        return base + versao.sufixo + ".jpg";
    }

    /**
     * Gera a média e a mini. Vazio se o Java não conseguir ler a imagem (arquivo estranho):
     * nesse caso a foto fica só com o original, e as telas usam o original no lugar.
     */
    static Optional<Map<Versao, byte[]>> gerar(byte[] original) {
        BufferedImage imagem;
        try {
            imagem = ImageIO.read(new ByteArrayInputStream(original));
        } catch (IOException | RuntimeException e) {
            return Optional.empty();
        }
        if (imagem == null) {
            return Optional.empty();
        }
        BufferedImage base = semTransparencia(imagem);
        Map<Versao, byte[]> versoes = new EnumMap<>(Versao.class);
        for (Versao versao : Versao.values()) {
            versoes.put(versao, jpeg(reduzir(base, versao.ladoMenor)));
        }
        return Optional.of(versoes);
    }

    /**
     * Reduz até o lado menor ficar com ladoMenor, sem nunca aumentar. Vai pela metade em passos e
     * só no fim acerta o tamanho: reduzir 1600 → 240 de uma vez deixa a foto serrilhada.
     */
    static BufferedImage reduzir(BufferedImage origem, int ladoMenor) {
        int largura = origem.getWidth();
        int altura = origem.getHeight();
        double escala = Math.min(1.0, (double) ladoMenor / Math.min(largura, altura));
        int larguraFinal = Math.max(1, (int) Math.round(largura * escala));
        int alturaFinal = Math.max(1, (int) Math.round(altura * escala));

        BufferedImage atual = origem;
        while (largura / 2 >= larguraFinal && altura / 2 >= alturaFinal) {
            largura /= 2;
            altura /= 2;
            atual = redimensionar(atual, largura, altura);
        }
        if (largura != larguraFinal || altura != alturaFinal) {
            atual = redimensionar(atual, larguraFinal, alturaFinal);
        }
        return atual;
    }

    /** JPEG não tem transparência: o que for transparente (PNG/WEBP) vira fundo branco. */
    private static BufferedImage semTransparencia(BufferedImage origem) {
        BufferedImage rgb = new BufferedImage(origem.getWidth(), origem.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        try {
            g.setColor(Color.WHITE);
            g.fillRect(0, 0, rgb.getWidth(), rgb.getHeight());
            g.drawImage(origem, 0, 0, null);
        } finally {
            g.dispose();
        }
        return rgb;
    }

    private static BufferedImage redimensionar(BufferedImage origem, int largura, int altura) {
        BufferedImage destino = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = destino.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.drawImage(origem, 0, 0, largura, altura, null);
        } finally {
            g.dispose();
        }
        return destino;
    }

    private static byte[] jpeg(BufferedImage imagem) {
        ImageWriter escritor = ImageIO.getImageWritersByFormatName("jpeg").next();
        ImageWriteParam parametros = escritor.getDefaultWriteParam();
        parametros.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        parametros.setCompressionQuality(QUALIDADE_JPEG);
        ByteArrayOutputStream saida = new ByteArrayOutputStream();
        try (ImageOutputStream fluxo = ImageIO.createImageOutputStream(saida)) {
            escritor.setOutput(fluxo);
            escritor.write(null, new IIOImage(imagem, null, null), parametros);
        } catch (IOException e) {
            throw new UncheckedIOException("Falha ao gerar versão da foto", e);
        } finally {
            escritor.dispose();
        }
        return saida.toByteArray();
    }
}
