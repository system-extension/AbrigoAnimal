package br.org.abrigo.animais.internal;

import br.org.abrigo.animais.internal.VersoesFoto.Versao;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class VersoesFotoTest {

    /** 40x20, lossy (VP8) e lossless (VP8L): os dois tipos que um celular pode mandar. */
    static final String WEBP_COM_PERDA = "UklGRnAAAABXRUJQVlA4IGQAAABQBACdASooABQAPm0skkWkIqGYBABABsSgB3s/QPwAZv/uAAF72VfGqM7AAP7vmsf//SbMTZibPhFf//FhZmNZa6Cyj/4enPTEJ/4enPX6Pif7jIEG3v/7jIEfuhUcQh1wgAAA";
    static final String WEBP_SEM_PERDA = "UklGRiwAAABXRUJQVlA4TB8AAAAvJ8AEAA9wD617qB4Mef6jBQIBwn+tAwMCIvofYO0BAA==";

    @Test
    void chaveDaVersaoDerivaDaChaveDoOriginal() {
        assertThat(VersoesFoto.chave("animais/1/abc.webp", Versao.MEDIA)).isEqualTo("animais/1/abc-m.jpg");
        assertThat(VersoesFoto.chave("animais/1/abc.jpg", Versao.MINI)).isEqualTo("animais/1/abc-p.jpg");
        assertThat(VersoesFoto.chave("animais/1.x/abc", Versao.MINI)).isEqualTo("animais/1.x/abc-p.jpg");
    }

    @Test
    void reduzPeloLadoMenorMantendoAProporcao() throws IOException {
        Map<Versao, byte[]> deitada = VersoesFoto.gerar(png(1600, 1200)).orElseThrow();
        assertThat(dimensoes(deitada.get(Versao.MEDIA))).containsExactly(800, 600);
        assertThat(dimensoes(deitada.get(Versao.MINI))).containsExactly(320, 240);

        Map<Versao, byte[]> emPe = VersoesFoto.gerar(png(900, 1600)).orElseThrow(); // foto de celular
        assertThat(dimensoes(emPe.get(Versao.MEDIA))).containsExactly(600, 1067);
        assertThat(dimensoes(emPe.get(Versao.MINI))).containsExactly(240, 427);
        assertThat(deitada.get(Versao.MEDIA)).startsWith((byte) 0xFF, (byte) 0xD8, (byte) 0xFF); // JPEG
    }

    @Test
    void fotoPequenaNaoEhAumentada() throws IOException {
        Map<Versao, byte[]> versoes = VersoesFoto.gerar(png(300, 200)).orElseThrow();

        assertThat(dimensoes(versoes.get(Versao.MEDIA))).containsExactly(300, 200);
        assertThat(dimensoes(versoes.get(Versao.MINI))).containsExactly(300, 200); // 200 < 240
    }

    @Test
    void leFotoWebpComESemPerda() throws IOException {
        for (String webp : new String[] {WEBP_COM_PERDA, WEBP_SEM_PERDA}) {
            Map<Versao, byte[]> versoes = VersoesFoto.gerar(Base64.getDecoder().decode(webp)).orElseThrow();
            assertThat(dimensoes(versoes.get(Versao.MEDIA))).containsExactly(40, 20);
        }
    }

    @Test
    void arquivoQueNaoEhImagemNaoGeraVersoes() {
        assertThat(VersoesFoto.gerar("não sou imagem".getBytes())).isEmpty();
    }

    static byte[] png(int largura, int altura) throws IOException {
        BufferedImage imagem = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_ARGB); // com transparência
        ByteArrayOutputStream saida = new ByteArrayOutputStream();
        ImageIO.write(imagem, "png", saida);
        return saida.toByteArray();
    }

    private static Integer[] dimensoes(byte[] jpeg) throws IOException {
        BufferedImage imagem = ImageIO.read(new ByteArrayInputStream(jpeg));
        return new Integer[] {imagem.getWidth(), imagem.getHeight()};
    }
}
