export function criarPayloadAnimalQr(bovino) {
  if (bovino?.qrPayload) return bovino.qrPayload;
  return `cowbank://animal/${encodeURIComponent(bovino.id)}`;
}

export function extrairAnimalIdDoQr(valor) {
  const texto = String(valor ?? '').trim();
  if (!texto) return null;

  try {
    const payload = JSON.parse(texto);
    if (payload?.app === 'cowbank' && payload?.tipo === 'animal' && payload?.animalId) {
      return String(payload.animalId);
    }
  } catch (_) {
    // Permite migração futura para QR em URL sem quebrar os QR Codes atuais.
  }

  const match = texto.match(/^cowbank:\/\/animal\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
