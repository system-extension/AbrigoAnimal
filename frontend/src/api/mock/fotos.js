import { FOTOS_DEMO } from './dados-iniciais';
/**
 * Fotos do modo demonstração: guardadas no IndexedDB do navegador
 * (o localStorage não comporta imagens). No modo API real, quem guarda é o backend.
 */
const BANCO = 'abrigo-demo-fotos';
const TABELA = 'fotos';
const urls = new Map(); // id → URL temporária (blob:) para usar no <img>

function abrir() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(TABELA);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function operar(modo, fn) {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(TABELA, modo);
    const req = fn(tx.objectStore(TABELA));
    tx.oncomplete = () => resolve(req?.result);
    tx.onerror = () => reject(tx.error);
  });
}

export async function salvarFoto(id, blob) {
  await operar('readwrite', (t) => t.put(blob, id));
  urls.set(id, URL.createObjectURL(blob));
}

export async function removerFoto(id) {
  await operar('readwrite', (t) => t.delete(id));
  const url = urls.get(id);
  if (url) URL.revokeObjectURL(url);
  urls.delete(id);
}

/** Carrega uma vez todas as fotos salvas e cria as URLs temporárias. */
let carregado = null;
export function carregarFotos() {
  carregado ??= (async () => {
    try {
      const db = await abrir();
      await new Promise((resolve) => {
        const req = db.transaction(TABELA).objectStore(TABELA).openCursor();
        req.onsuccess = () => {
          const c = req.result;
          if (!c) return resolve();
          urls.set(c.key, URL.createObjectURL(c.value));
          c.continue();
        };
        req.onerror = () => resolve();
      });
    } catch {
      /* Navegador sem IndexedDB: segue só com as fotos de exemplo. */
    }
  })();
  return carregado;
}

/** 'idb:abc' → blob:..., 'demo:mural1' → arquivo do site, qualquer outra URL passa direto. */
export const urlDaFoto = (ref) => {
  if (ref?.startsWith('idb:')) return urls.get(ref.slice(4)) ?? null;
  if (ref?.startsWith('demo:')) return FOTOS_DEMO[ref.slice(5)] ?? null;
  return ref;
};
