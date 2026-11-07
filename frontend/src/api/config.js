/**
 * De onde vêm os dados de cada ÁREA do sistema:
 *   - modo demonstração (padrão): dados no navegador (src/api/mock), nada de backend.
 *   - API real: chama o backend Spring (/api/...).
 *
 * A integração é feita por partes: liga-se a área que o backend já atende de verdade.
 * Em frontend/.env.local (ver .env.example):
 *
 *   VITE_API_REAL=vitrine           → site público (vitrine + formulário de interesse) no backend
 *   VITE_API_REAL=vitrine,painel    → tudo no backend
 *   (vazio)                          → tudo em modo demonstração
 *
 * VITE_USAR_API=true continua valendo como "tudo no backend".
 * Nenhuma tela muda: elas só conhecem as funções desta pasta.
 */
const AREAS_REAIS = new Set(
  (import.meta.env.VITE_API_REAL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const TUDO_REAL = import.meta.env.VITE_USAR_API === 'true';

/** @param {'vitrine'|'painel'} area */
export const apiReal = (area) => TUDO_REAL || AREAS_REAIS.has(area);

/** Área da equipe (login, animais, solicitações, padrinhos). */
export const USAR_API_REAL = apiReal('painel');

/** Simula a demora da rede no modo demonstração, para as telas já tratarem "carregando". */
export const ATRASO_MOCK_MS = 250;
