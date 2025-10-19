export interface Supermarket {
  id: string;
  name: string;
  color: string;
  volantino: string; // Link diretto al volantino online
}

export const SUPERMARKETS: Supermarket[] = [
  {
    id: 'lidl',
    name: 'Lidl',
    color: '#0050AA',
    volantino: 'https://www.lidl.it/c/volantino-lidl/s10018048?ar=70100',
  },
  {
    id: 'unes',
    name: 'Unes',
    color: '#FF6B35',
    volantino: 'https://www.unes.it/volantino/',
  },
  {
    id: 'crai',
    name: 'Crai',
    color: '#E31E24',
    volantino: 'https://www.crai-supermercati.it/volantino/crai-simpatia-cluster-5-88/?pdv=6191',
  },
  {
    id: 'carrefour',
    name: 'Carrefour',
    color: '#005CA9',
    volantino: 'https://www.carrefour.it/volantino',
  },
  {
    id: 'eurospin',
    name: 'Eurospin',
    color: '#E30613',
    volantino: 'https://www.eurospin.it/volantini-online/',
  },
  {
    id: 'interspar',
    name: 'Interspar',
    color: '#009640',
    volantino: 'https://www.interspar.it/volantini',
  },
  {
    id: 'conad',
    name: 'Conad',
    color: '#ED1C24',
    volantino: 'https://www.conad.it/volantino',
  },
  {
    id: 'penny',
    name: 'Penny',
    color: '#E30613',
    volantino: 'https://www.penny.it/volantino/',
  },
  {
    id: 'tigros',
    name: 'Tigros',
    color: '#FF6B00',
    volantino: 'https://www.tigros.it/volantino/',
  },
  {
    id: 'md',
    name: 'MD',
    color: '#FFD700',
    volantino: 'https://www.mdspa.it/volantino/',
  },
  {
    id: 'esselunga',
    name: 'Esselunga',
    color: '#E30613',
    volantino: 'https://www.esselunga.it/cms/volantini.html',
  },
  {
    id: 'bennet',
    name: 'Bennet',
    color: '#0066CC',
    volantino: 'https://www.bennet.com/volantino/',
  },
  {
    id: 'iperal',
    name: 'Iperal',
    color: '#0066CC',
    volantino: 'https://www.iperal.it/volantino/',
  },
  {
    id: 'ilgigante',
    name: 'Il Gigante',
    color: '#E30613',
    volantino: 'https://www.ilgigante.net/volantino',
  },
  {
    id: 'famila',
    name: 'Famila',
    color: '#0066CC',
    volantino: 'https://www.famila.it/volantino/',
  },
  {
    id: 'basko',
    name: 'Basko',
    color: '#009640',
    volantino: 'https://www.basko.it/volantino',
  },
  {
    id: 'tuaspesa',
    name: 'La Tua Spesa',
    color: '#FF6B35',
    volantino: 'https://www.latuaspesaonline.it/volantino',
  },
  {
    id: 'todis',
    name: 'Todis',
    color: '#E30613',
    volantino: 'https://www.todis.it/volantino/',
  },
  {
    id: 'dpiu',
    name: 'D Più',
    color: '#0066CC',
    volantino: 'https://www.dpiu.com/volantino/',
  },
];
