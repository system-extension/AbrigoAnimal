/**
 * Compressão de fotos no próprio celular, antes de enviar (RNF-07).
 * Uma foto de 5 MB da câmera vira ~200–400 KB: sobe rápido no 4G
 * e fica abaixo do limite de 3 MB do backend.
 */
const LADO_MAXIMO = 1600;
const QUALIDADE = 0.82;

export async function comprimirFoto(arquivo) {
  if (!arquivo.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.');

  // createImageBitmap respeita a orientação da foto (celular "deitado/em pé").
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('Não foi possível ler esta foto. Tente outra.');
  });

  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close?.();

  const blob = (await paraBlob(canvas, 'image/webp')) ?? (await paraBlob(canvas, 'image/jpeg')); // Safari antigo
  if (!blob) throw new Error('Não foi possível preparar a foto.');
  return blob;
}

const paraBlob = (canvas, tipo) =>
  new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b && b.type === tipo ? b : null), tipo, QUALIDADE),
  );
