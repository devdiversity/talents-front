export const getCantonsList = (lang: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const c in cantoni) {
    console.log(c, cantoni[c]);
    result[c] = cantoni[c][lang];
  }
  return result;
};

export interface CantonOption {
  label: string;
  value: string;
}

export const getCantonsOptions = (lang: string): CantonOption[] => {
  const result: CantonOption[] = [];
  for (const c in cantoni) {
    result.push({
      label: cantoni[c][lang],
      value: c,
    });
  }
  return result;
};

export const cantoni = <Record<string, Record<string, string>>>{
  AG: {
    IT: 'Argovia',
    FR: 'Argovie',
    DE: 'Aargau',
    RO: 'Argovia',
  },
  AI: {
    IT: 'Appenzello Interno',
    FR: 'Appenzell Rhodes-Intérieures',
    DE: 'Appenzell Innerrhoden',
    RO: 'Appenzell dadens',
  },
  AR: {
    IT: 'Appenzello Esterno',
    FR: 'Appenzell Rhodes-Extérieures',
    DE: 'Appenzell Ausserrhoden',
    RO: 'Appenzell dador',
  },
  BS: {
    IT: 'Basilea-Città',
    FR: 'Bâle-Ville',
    DE: 'Basel-Stadt',
    RO: 'Basilea-Citad',
  },
  BL: {
    IT: 'Basilea-Campagna',
    FR: 'Bâle-Campagne',
    DE: 'Basel-Landschaft',
    RO: 'Basilea-Champagna',
  },
  BE: {
    IT: 'Berna',
    FR: 'Berne',
    DE: 'Bern',
    RO: 'Berna',
  },
  FR: {
    IT: 'Friburgo',
    FR: 'Fribourg',
    DE: 'Freiburg',
    RO: 'Friburg',
  },
  GE: {
    IT: 'Ginevra',
    FR: 'Genève',
    DE: 'Genf',
    RO: 'Genevra',
  },
  GL: {
    IT: 'Glarona',
    FR: 'Glaris',
    DE: 'Glarus',
    RO: 'Glaruna',
  },
  GR: {
    IT: 'Grigioni',
    FR: 'Grisons',
    DE: 'Graubünden',
    RO: 'Grischun',
  },
  JU: {
    IT: 'Giura',
    FR: 'Jura',
    DE: 'Jura',
    RO: 'Giura',
  },
  LU: {
    IT: 'Lucerna',
    FR: 'Lucerne',
    DE: 'Luzern',
    RO: 'Lucerna',
  },
  NE: {
    IT: 'Neuchâtel',
    FR: 'Neuchâtel',
    DE: 'Neuenburg',
    RO: 'Neuchâtel',
  },
  NW: {
    IT: 'Nidvaldo',
    FR: 'Nidwald',
    DE: 'Nidwalden',
    RO: 'Sutsilvania',
  },
  OW: {
    IT: 'Obvaldo',
    FR: 'Obwald',
    DE: 'Obwalden',
    RO: 'Sursilvania',
  },
  SH: {
    IT: 'Sciaffusa',
    FR: 'Schaffhouse',
    DE: 'Schaffhausen',
    RO: 'Schaffusa',
  },
  SZ: {
    IT: 'Svitto',
    FR: 'Schwyz',
    DE: 'Schwyz',
    RO: 'Sviz',
  },
  SO: {
    IT: 'Soletta',
    FR: 'Soleure',
    DE: 'Solothurn',
    RO: 'Soloturn',
  },
  SG: {
    IT: 'San Gallo',
    FR: 'Saint-Gall',
    DE: 'St. Gallen',
    RO: 'Son Gagl',
  },
  TG: {
    IT: 'Turgovia',
    FR: 'Thurgovie',
    DE: 'Thurgau',
    RO: 'Turgovia',
  },
  TI: {
    IT: 'Ticino',
    FR: 'Tessin',
    DE: 'Tessin',
    RO: 'Tessin',
  },
  UR: {
    IT: 'Uri',
    FR: 'Uri',
    DE: 'Uri',
    RO: 'Uri',
  },
  VS: {
    IT: 'Vallese',
    FR: 'Valais',
    DE: 'Wallis',
    RO: 'Vallais',
  },
  VD: {
    IT: 'Vaud',
    FR: 'Vaud',
    DE: 'Waadt',
    RO: 'Vad',
  },
  ZG: {
    IT: 'Zugo',
    FR: 'Zoug',
    DE: 'Zug',
    RO: 'Zug',
  },
  ZH: {
    IT: 'Zurigo',
    FR: 'Zurich',
    DE: 'Zürich',
    RO: 'Turitg',
  },
};
