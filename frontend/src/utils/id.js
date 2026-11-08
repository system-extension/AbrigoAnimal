/**
 * Gera um identificador único.
 * crypto.randomUUID() só existe em HTTPS ou localhost; abrindo pelo IP da rede
 * (ex.: http://192.168.0.10:5173 no celular) ele não existe. getRandomValues funciona nos dois.
 */
export function novoId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
