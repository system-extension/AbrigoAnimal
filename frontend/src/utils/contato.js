/**
 * Contatos públicos da ONG. Um lugar só para trocar.
 * ⚠️ Confirmar o número de WhatsApp com a ONG antes de publicar.
 */
export const CONTATO = {
  whatsapp: '5547989134439',
  instagram: 'https://www.instagram.com/abrigoanimaldejoinville/',
  facebook: 'https://www.facebook.com/profile.php?id=100080446760196',
  endereco: 'Estrada Blumenau, s/n — Vila Nova, Joinville/SC',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Abrigo+Animal+Joinville',
};

export const linkWhatsApp = (texto, numero = CONTATO.whatsapp) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

/** Telefone digitado → só dígitos com DDI 55, para abrir conversa no WhatsApp. */
export const numeroWhatsApp = (telefone) => {
  const d = String(telefone || '').replace(/\D/g, '');
  if (!d) return null;
  return d.startsWith('55') ? d : `55${d}`;
};
