package br.org.abrigo.identidade.internal.domain;

import br.org.abrigo.plataforma.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UsuarioTest {

    @Test
    void aceitaEmailCompletoEGuardaNormalizado() {
        for (String email : new String[] {"maria@gmail.com", "Ana.Souza@Abrigo.org.br", " joao@exemplo.invalid "}) {
            Usuario u = Usuario.criar("Maria", email, "hash");
            assertThat(u.getEmail()).as(email).isEqualTo(email.strip().toLowerCase(Locale.ROOT));
        }
    }

    @Test
    void recusaEmailIncompletoOuComErroDeDigitacao() {
        for (String email : new String[] {"maria@abrigo", "maria@.com", "maria @gmail.com", "maria@gmail..com",
                "maria@gmail.c", "@gmail.com", "maria@@gmail.com", "maria"}) {
            assertThatThrownBy(() -> Usuario.criar("Maria", email, "hash"))
                    .as(email)
                    .isInstanceOf(RegraNegocioException.class)
                    .hasMessageContaining("E-mail inválido");
        }
    }
}
