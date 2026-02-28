// UF Service - fetches from mindicador.cl

export interface UFData {
  valor: number;
  fecha: string;
  fuente: string;
}

export async function fetchUF(): Promise<UFData> {
  const res = await fetch('https://mindicador.cl/api/uf');
  if (!res.ok) throw new Error(`Error obteniendo UF: ${res.status}`);
  const json = await res.json();
  const serie = json?.serie;
  if (!Array.isArray(serie) || serie.length === 0) throw new Error('Datos UF no disponibles');
  return {
    valor: serie[0].valor,
    fecha: serie[0].fecha,
    fuente: 'mindicador.cl (Banco Central de Chile)',
  };
}
