package br.org.abrigo.plataforma;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static br.org.abrigo.plataforma.IpDoCliente.Modo.CONEXAO;
import static br.org.abrigo.plataforma.IpDoCliente.Modo.X_FORWARDED_FOR_PRIMEIRO;
import static br.org.abrigo.plataforma.IpDoCliente.Modo.X_FORWARDED_FOR_ULTIMO;
import static br.org.abrigo.plataforma.IpDoCliente.Modo.X_REAL_IP;
import static org.assertj.core.api.Assertions.assertThat;

class IpDoClienteTest {

    /** Visitante forjou "6.6.6.6"; o proxy acrescentou o IP real 200.1.2.3 no fim. */
    private static MockHttpServletRequest viaProxy() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr("100.64.0.7"); // o proxy da hospedagem
        req.addHeader("X-Forwarded-For", "6.6.6.6, 200.1.2.3");
        req.addHeader("X-Real-IP", "200.1.2.3");
        return req;
    }

    private static String ip(IpDoCliente.Modo modo, MockHttpServletRequest req) {
        return new IpDoCliente(modo, false).de(req);
    }

    @Test
    void conexaoIgnoraOsCabecalhos() {
        assertThat(ip(CONEXAO, viaProxy())).isEqualTo("100.64.0.7");
    }

    @Test
    void ultimoDoXForwardedForEhOQueOProxyEscreveu() {
        assertThat(ip(X_FORWARDED_FOR_ULTIMO, viaProxy())).isEqualTo("200.1.2.3");
    }

    @Test
    void primeiroDoXForwardedForEhOQueOVisitanteMandou() {
        // por isso esse modo só serve se o proxy apagar o cabeçalho do visitante
        assertThat(ip(X_FORWARDED_FOR_PRIMEIRO, viaProxy())).isEqualTo("6.6.6.6");
    }

    @Test
    void xRealIp() {
        assertThat(ip(X_REAL_IP, viaProxy())).isEqualTo("200.1.2.3");
    }

    @Test
    void semOCabecalhoOuComLixoUsaAConexao() {
        MockHttpServletRequest semCabecalho = new MockHttpServletRequest();
        semCabecalho.setRemoteAddr("10.0.0.9");
        assertThat(ip(X_FORWARDED_FOR_ULTIMO, semCabecalho)).isEqualTo("10.0.0.9");

        MockHttpServletRequest lixo = new MockHttpServletRequest();
        lixo.setRemoteAddr("10.0.0.9");
        lixo.addHeader("X-Forwarded-For", "<script>alert(1)</script>");
        assertThat(ip(X_FORWARDED_FOR_ULTIMO, lixo)).isEqualTo("10.0.0.9");
    }

    @Test
    void ipv6() {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRemoteAddr("100.64.0.7");
        req.addHeader("X-Forwarded-For", "2001:db8::1");
        assertThat(ip(X_FORWARDED_FOR_ULTIMO, req)).isEqualTo("2001:db8::1");
    }
}
