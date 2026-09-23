package br.com.abrigojoinville.controlador;

import br.com.abrigojoinville.modelo.Animal;
import br.com.abrigojoinville.servico.ServicoAnimal;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

public class ControladorApi implements HttpHandler {
    private final ServicoAnimal servicoAnimal;
    public ControladorApi(ServicoAnimal servicoAnimal) { this.servicoAnimal = servicoAnimal; }
    @Override public void handle(HttpExchange troca) throws IOException {
        adicionarCabecalhosCors(troca);
        if ("OPTIONS".equalsIgnoreCase(troca.getRequestMethod())) { troca.sendResponseHeaders(204, -1); troca.close(); return; }
        String caminho = troca.getRequestURI().getPath(); String metodo = troca.getRequestMethod();
        try { if ("GET".equalsIgnoreCase(metodo)) tratarRequisicaoGet(troca,caminho); else if ("POST".equalsIgnoreCase(metodo)) tratarRequisicaoPost(troca,caminho); else responderJson(troca,450,"{\"erro\":\"Método não suportado\"}"); }
        catch(Exception e){e.printStackTrace();responderJson(troca,500,"{\"erro\":\"Erro interno do servidor\"}");}
    }
    private void tratarRequisicaoGet(HttpExchange t,String c)throws IOException{
        if("/api/animais".equalsIgnoreCase(c)){List<Animal> l=servicoAnimal.listarAnimais(extrairParametro(t.getRequestURI().getQuery(),"especie"));responderJson(t,200,servicoAnimal.converterListaAnimaisParaJson(l));}
        else if(c.startsWith("/api/animais/")){Optional<Animal>a=servicoAnimal.buscarAnimalPorId(c.substring("/api/animais/".length()));responderJson(t,a.isPresent()?200:404,a.map(Animal::paraJson).orElse("{\"erro\":\"Animal não encontrado\"}"));}
        else if("/api/destaques".equalsIgnoreCase(c))responderJson(t,200,servicoAnimal.converterListaDestaquesParaJson(servicoAnimal.listarDestaques()));
        else if("/api/informacoes".equalsIgnoreCase(c))responderJson(t,200,servicoAnimal.obterInformacoesAbrigoJson());
        else responderJson(t,404,"{\"erro\":\"Endpoint de API não encontrado\"}");
    }
    private void tratarRequisicaoPost(HttpExchange t,String c)throws IOException{
        if("/api/adocoes".equalsIgnoreCase(c)){InputStream e=t.getRequestBody();String corpo=new String(e.readAllBytes(),StandardCharsets.UTF_8);System.out.println("Solicitação de adoção recebida: "+corpo);responderJson(t,200,"{\"sucesso\":true,\"mensagem\":\"Sua solicitação foi recebida com sucesso!\"}");}
        else responderJson(t,404,"{\"erro\":\"Endpoint POST não encontrado\"}");
    }
    private void adicionarCabecalhosCors(HttpExchange t){t.getResponseHeaders().set("Access-Control-Allow-Origin","*");t.getResponseHeaders().set("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");t.getResponseHeaders().set("Access-Control-Allow-Headers","Content-Type, Authorization, X-Requested-With");}
    private void responderJson(HttpExchange t,int c,String j)throws IOException{t.getResponseHeaders().set("Content-Type","application/json; charset=UTF-8");byte[]b=j.getBytes(StandardCharsets.UTF_8);t.sendResponseHeaders(c,b.length);OutputStream s=t.getResponseBody();s.write(b);s.flush();t.close();}
    private String extrairParametro(String q,String k){if(q==null||q.isBlank())return null;for(String p:q.split("&")){String[]v=p.split("=");if(v.length==2&&v[0].equalsIgnoreCase(k))return v[1];}return null;}
}
