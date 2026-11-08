package br.org.abrigo.identidade.internal;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

/**
 * Regras de acesso — UM lugar só, nenhum controller precisa "lembrar" de checar login.
 *
 * <ul>
 *   <li>/api/public/** → aberto (vitrine e formulário de interesse)</li>
 *   <li>/api/usuarios/** → só o administrador (gerenciar a equipe, ADR 0012)</li>
 *   <li>/api/** → exige sessão (equipe da ONG)</li>
 *   <li>resto (arquivos do React, fotos, /animais/{slug}) → aberto</li>
 * </ul>
 *
 * <p>Sessão com cookie httpOnly (decisão T1): o navegador guarda o cookie, o JavaScript não o lê.
 * Como cookie é enviado automaticamente, é preciso proteção CSRF: o front lê o cookie XSRF-TOKEN
 * e devolve no header X-XSRF-TOKEN em todo POST/PUT/PATCH/DELETE.
 */
@Configuration(proxyBeanMethods = false)
class SegurancaConfig {

    @Bean
    SecurityFilterChain filtroSeguranca(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(regras -> regras
                        .requestMatchers("/api/public/**", "/api/auth/csrf").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/api/usuarios", "/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/**", "/actuator/**").authenticated()
                        .anyRequest().permitAll())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        // formulário público não tem sessão para "sequestrar"
                        .ignoringRequestMatchers("/api/public/**"))
                .formLogin(login -> login
                        .loginPage("/login") // tela do React; desliga a página padrão do Spring
                        .loginProcessingUrl("/api/auth/login") // recebe username + password (form-urlencoded)
                        .successHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_NO_CONTENT))
                        .failureHandler((req, res, erro) -> res.setStatus(HttpServletResponse.SC_UNAUTHORIZED))
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_NO_CONTENT)))
                // API responde 401 em vez de redirecionar para uma página de login
                .exceptionHandling(erros -> erros
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));
        return http.build();
    }

    /** Hash com prefixo do algoritmo ({bcrypt}...), permite trocar o algoritmo no futuro. */
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }
}
