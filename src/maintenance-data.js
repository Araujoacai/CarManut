// ============================================================
// maintenance-data.js — Tabelas de Manutenção
// Honda Civic 2008 LXS 1.8 (Motor R18A) + Dados Genéricos
// ============================================================

// ---- Categorias de serviço ----
export const SERVICE_CATEGORIES = [
  { id: 'oil',        label: 'Óleo & Filtros',       emoji: '🛢️' },
  { id: 'brakes',     label: 'Freios',                emoji: '🔴' },
  { id: 'tires',      label: 'Pneus & Rodas',         emoji: '⚙️' },
  { id: 'engine',     label: 'Motor & Ignição',       emoji: '🔧' },
  { id: 'cooling',    label: 'Arrefecimento',          emoji: '💧' },
  { id: 'suspension', label: 'Suspensão & Direção',   emoji: '🚗' },
  { id: 'electrical', label: 'Elétrico',              emoji: '⚡' },
  { id: 'ac',         label: 'Ar Condicionado',        emoji: '❄️' },
  { id: 'fluids',     label: 'Fluidos & Transmissão', emoji: '🔩' },
  { id: 'other',      label: 'Outros',                emoji: '🔨' },
];

// ---- Tabela principal de itens de manutenção ----
// kmInterval: km entre trocas (null = só por tempo)
// monthInterval: meses entre trocas (null = só por km)
// severity: 'critical' | 'high' | 'medium' | 'low'
// note: observação específica do veículo
export const MAINTENANCE_ITEMS = [
  // === ÓLEO & FILTROS ===
  {
    id: 'engine_oil',
    category: 'oil',
    name: 'Óleo do Motor + Filtro de Óleo',
    emoji: '🛢️',
    kmInterval: 10000,
    monthInterval: 12,
    severity: 'critical',
    note: 'Use óleo 10W30 (mineral/semissintético). Motor R18A1: capacidade com filtro é de 3,7 Litros (sem filtro 3,5 L). Troca rigorosa preserva a corrente de comando.',
  },
  {
    id: 'air_filter',
    category: 'oil',
    name: 'Filtro de Ar do Motor',
    emoji: '🌬️',
    kmInterval: 20000,
    monthInterval: 24,
    severity: 'high',
    note: 'Verifique visualmente a cada 10.000 km. Em vias com muita poeira, troque antes.',
  },
  {
    id: 'cabin_filter',
    category: 'ac',
    name: 'Filtro de Cabine (AC)',
    emoji: '❄️',
    kmInterval: 15000,
    monthInterval: 12,
    severity: 'medium',
    note: 'Melhora qualidade do ar e eficiência do AC.',
  },
  {
    id: 'fuel_filter',
    category: 'oil',
    name: 'Filtro de Combustível',
    emoji: '⛽',
    kmInterval: 80000,
    monthInterval: null,
    severity: 'medium',
    note: 'No Civic 2008, o filtro é interno ao tanque. Inspecionar após 80.000 km.',
  },

  // === IGNIÇÃO ===
  {
    id: 'spark_plugs',
    category: 'engine',
    name: 'Velas de Ignição (Irídio)',
    emoji: '⚡',
    kmInterval: 60000,
    monthInterval: null,
    severity: 'high',
    note: 'Velas de irídio NGK IZFR6K11S ou Denso SKJ20DR-M11S. Troca aos 60.000 km. Folga original de fábrica.',
  },
  {
    id: 'valve_adjustment',
    category: 'engine',
    name: 'Regulagem de Válvulas',
    emoji: '🔧',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'high',
    note: 'A FRIO — Admissão: 0,20 mm | Escape: 0,25 mm. Torque porcas de travamento: 14 Nm. Tampa de válvulas: 10 Nm. Ordem: cilindros 1-3-4-2.',
  },
  {
    id: 'accessory_belt',
    category: 'engine',
    name: 'Correia de Acessórios (Poly-V)',
    emoji: '🔩',
    kmInterval: 60000,
    monthInterval: 60,
    severity: 'high',
    note: 'O motor R18A usa CORRENTE interna (não troca periódica). A correia de acessórios aciona alternador e bomba d\'água — inspecionar a cada revisão.',
  },

  // === FREIOS ===
  {
    id: 'brake_pads_front',
    category: 'brakes',
    name: 'Pastilhas de Freio (Dianteiras)',
    emoji: '🔴',
    kmInterval: 30000,
    monthInterval: null,
    severity: 'critical',
    note: 'Espessura mínima do material de atrito: 1,6 mm. Espec. FRAS-LE PD/71. Aplicar graxa na parte traseira das pastilhas novas (sem contaminar a área de frenagem).',
  },
  {
    id: 'brake_pads_rear',
    category: 'brakes',
    name: 'Pastilhas de Freio (Traseiras)',
    emoji: '🔴',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'high',
    note: 'Traseiras desgastam mais lentamente. Espessura mínima do material de atrito: 1,6 mm.',
  },
  {
    id: 'brake_discs',
    category: 'brakes',
    name: 'Discos de Freio',
    emoji: '⭕',
    kmInterval: 60000,
    monthInterval: null,
    severity: 'high',
    note: 'Dianteiros: espessura mínima 19 mm, empenamento máximo 0,10 mm. Medir em 8 pontos com micrômetro. Torque parafusos do suporte: 108 Nm. Torque flange: 34 Nm.',
  },
  {
    id: 'brake_fluid',
    category: 'brakes',
    name: 'Fluido de Freio (DOT 3)',
    emoji: '💧',
    kmInterval: null,
    monthInterval: 36,
    severity: 'critical',
    note: 'Honda BF DOT 3. Trocar a cada 3 anos. Fluido higroscópico perde eficiência com o tempo. Após trocar pastilhas, bombear o pedal várias vezes.',
  },

  // === ARREFECIMENTO ===
  {
    id: 'coolant',
    category: 'cooling',
    name: 'Líquido de Arrefecimento',
    emoji: '🌡️',
    kmInterval: 60000,
    monthInterval: 48,
    severity: 'high',
    note: 'Honda All Season Antifreeze/Coolant Type 2 (pronto para uso, NÃO diluir em água). Ou Radiex PS2G (50% água desmineralizada). Capacidade total: 5,5 L (troca) / 7,1 L (sistema). Reservatório: entre Min e Max.',
  },
  {
    id: 'thermostat',
    category: 'cooling',
    name: 'Válvula Termostática',
    emoji: '🌡️',
    kmInterval: 80000,
    monthInterval: null,
    severity: 'medium',
    note: 'Abertura: a partir de 80°C. Totalmente aberta: 95°C (8 mm de curso). Eletroventiladores ligam a 101°C e desligam a 98°C. Evite válvulas paralelas.',
  },

  // === SUSPENSÃO & DIREÇÃO ===
  {
    id: 'alignment',
    category: 'suspension',
    name: 'Alinhamento & Balanceamento',
    emoji: '🎯',
    kmInterval: 10000,
    monthInterval: 12,
    severity: 'medium',
    note: 'Câmber: 0°10′±30′. Cáster: 6°43′±1°. Convergência: 0±2 mm. Torque parafusos da roda: 108 Nm (aperto cruzado).',
  },
  {
    id: 'steering_fluid',
    category: 'suspension',
    name: 'Fluido da Direção Hidráulica',
    emoji: '🔄',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'medium',
    note: 'Fluido Honda PSF-S. Capacidade: 0,8 L (sistema) / 0,26 L (reservatório). Verificar nível e possíveis vazamentos na bomba.',
  },
  {
    id: 'bushings',
    category: 'suspension',
    name: 'Buchas de Suspensão',
    emoji: '🚗',
    kmInterval: 60000,
    monthInterval: null,
    severity: 'medium',
    note: 'Verificar desgaste. Ruídos ao passar em buracos indicam desgaste de buchas.',
  },
  {
    id: 'shock_absorbers',
    category: 'suspension',
    name: 'Amortecedores',
    emoji: '🏎️',
    kmInterval: 80000,
    monthInterval: null,
    severity: 'medium',
    note: 'Suspensão independente: Dianteira McPherson / Traseira Double Wishbone. Verificar vazamento de óleo e ressaltos excessivos.',
  },
  {
    id: 'tie_rod_ends',
    category: 'suspension',
    name: 'Terminais de Direção & Pivôs',
    emoji: '🔗',
    kmInterval: 50000,
    monthInterval: null,
    severity: 'high',
    note: 'Inspecionar folga nos terminais. Substituir se houver vibração ou folga no volante.',
  },

  // === TRANSMISSÃO ===
  {
    id: 'transmission_fluid',
    category: 'fluids',
    name: 'Fluido de Câmbio Manual (Honda MTF)',
    emoji: '⚙️',
    kmInterval: 45000,
    monthInterval: null,
    severity: 'medium',
    note: 'Manual: Honda MTF (Torque bujão 39 Nm). Automático: Honda ATF-Z1 (Capacidade na troca: 2,4 Litros).',
  },
  {
    id: 'clutch',
    category: 'fluids',
    name: 'Embreagem',
    emoji: '🔧',
    kmInterval: 120000,
    monthInterval: null,
    severity: 'high',
    note: 'Vida útil depende muito do estilo de condução. Verificar escorregamento ou dificuldade de engate.',
  },

  // === PNEUS ===
  {
    id: 'tires',
    category: 'tires',
    name: 'Pneus (205/55 R16)',
    emoji: '🔵',
    kmInterval: 40000,
    monthInterval: 60,
    severity: 'critical',
    note: 'Medida: 205/55 R16 91V. Rodas 16×6½JJ. Pressão: 220 kPa (2,2 kgf/cm²) / 32 PSI (diant. e traseira). Sulcos mín. 1,6 mm.',
  },
  {
    id: 'tire_rotation',
    category: 'tires',
    name: 'Rodízio de Pneus',
    emoji: '🔄',
    kmInterval: 10000,
    monthInterval: null,
    severity: 'low',
    note: 'Fazer junto com o alinhamento a cada 10.000 km para desgaste uniforme.',
  },

  // === ELÉTRICO ===
  {
    id: 'battery',
    category: 'electrical',
    name: 'Bateria',
    emoji: '🔋',
    kmInterval: null,
    monthInterval: 36,
    severity: 'high',
    note: '12V — 47 Ah. Vida útil 3-5 anos. Verificar tensão: 12,6V em repouso. Limpar terminais.',
  },
  {
    id: 'alternator_belt',
    category: 'electrical',
    name: 'Verificação do Alternador',
    emoji: '⚡',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'medium',
    note: 'Alternador: 13,5V — 90A. Tensão de carga normal: 13,5-14,5V com motor ligado.',
  },
];

// ---- Dados específicos do Honda Civic 2008 LXS 1.8 ----
export const VEHICLE_PRESETS = {
  'honda_civic_2008_lxs_1.8': {
    make: 'Honda',
    model: 'Civic LXS',
    year: 2008,
    engine: '1.8 R18A',
    fuel: 'flex',
    transmission: 'manual',
    tireSize: '205/55 R16',
    oilSpec: '10W30 Mineral/Semissintético',
    coolantSpec: 'Honda Long Life Coolant',
    brakeFluid: 'DOT 3',
    emoji: '🚗',
    notes: [
      'Motor R18A1 usa CORRENTE de comando — não requer troca periódica (se óleo em dia)',
      'Capacidade de óleo do motor R18A1: 3,7 Litros (com troca do filtro)',
      'Folga das Válvulas (A frio): Admissão 0.18-0.22 mm | Escape 0.23-0.27 mm',
      'Válvula termostática: Início de abertura aos 80°C / Abertura total aos 95°C',
      'Direção hidráulica — verificar nível e vazamentos regularmente',
      'Velas originais de irídio têm vida útil de 60.000 km',
    ],
    maintenanceOverrides: {}
  }
};

// ---- Dados técnicos do manual de serviço (aba Manual) ----
export const VEHICLE_TECHNICAL_DATA = {
  'honda_civic_2008_lxs_1.8': {
    sections: [
      {
        title: '🔧 Motor R18A1',
        emoji: '🔧',
        items: [
          { label: 'Tipo', value: 'SOHC i-VTEC 16V, 4 cilindros em linha' },
          { label: 'Cilindrada', value: '1.799 cm³' },
          { label: 'Razão de compressão', value: '11,5:1' },
          { label: 'Ordem de ignição', value: '1 — 3 — 4 — 2' },
          { label: 'Potência (Álcool)', value: '125 cv @ 6.200 rpm' },
          { label: 'Potência (Gasolina)', value: '125 cv @ 6.200 rpm' },
          { label: 'Torque (Álcool)', value: '17,7 kgf·m @ 4.300 rpm' },
          { label: 'Torque (Gasolina)', value: '17,5 kgf·m @ 5.000 rpm' },
          { label: 'Distribuição', value: 'Por corrente (não requer troca periódica)' },
          { label: 'Injeção', value: 'Multiponto PGM-FI' },
          { label: 'Ignição', value: 'Eletrônica mapeada (DIS)' },
        ],
      },
      {
        title: '🛢️ Lubrificantes e Fluidos',
        emoji: '🛢️',
        items: [
          { label: 'Óleo do motor', value: 'Honda SAE 10W-30 API-SL' },
          { label: 'Óleo — sem filtro', value: '3,5 Litros' },
          { label: 'Óleo — com filtro', value: '3,7 Litros' },
          { label: 'Arrefecimento (troca)', value: '5,5 Litros' },
          { label: 'Arrefecimento (total)', value: '7,1 Litros' },
          { label: 'Aditivo', value: 'Honda All Season Antifreeze/Coolant Type 2 (pronto, não diluir) ou Radiex PS2G (50% água desmineralizada)' },
          { label: 'Câmbio manual', value: 'Honda MTF' },
          { label: 'Câmbio automático (troca)', value: '5,3 Litros — Honda ATF-Z1' },
          { label: 'Câmbio automático (total)', value: '6,5 Litros' },
          { label: 'Fluido de freio', value: 'Honda BF DOT 3' },
          { label: 'Ar condicionado', value: 'Óleo SP-10 ou ND-OIL (conf. sistema)' },
          { label: 'Direção hidráulica', value: 'Honda PSF-S — 0,8 L (sist.) / 0,26 L (reserv.)' },
          { label: 'Lavador do para-brisa', value: '2,5 Litros' },
          { label: 'Tanque de combustível', value: '≈ 50 Litros' },
          { label: 'Reservatório partida a frio', value: '≈ 0,7 Litros' },
        ],
      },
      {
        title: '🔴 Freios',
        emoji: '🔴',
        items: [
          { label: 'Dianteiros', value: 'Discos ventilados' },
          { label: 'Traseiros', value: 'Discos sólidos' },
          { label: 'ABS', value: '4 canais' },
          { label: 'Espessura mín. disco dianteiro', value: '19 mm' },
          { label: 'Empenamento máx. disco', value: '0,10 mm' },
          { label: 'Espessura mín. pastilha', value: '1,6 mm (material de atrito)' },
          { label: 'Torque suporte da pinça', value: '108 Nm' },
          { label: 'Torque flange das pastilhas', value: '34 Nm' },
          { label: 'Torque parafusos da roda', value: '108 Nm (aperto cruzado)' },
        ],
      },
      {
        title: '🎯 Geometria de Direção',
        emoji: '🎯',
        items: [
          { label: 'Tipo de direção', value: 'Hidráulica — Pinhão e cremalheira' },
          { label: 'Voltas batente a batente', value: '2,83' },
          { label: 'Câmber dianteiro', value: '0°10′ ± 30′' },
          { label: 'Câmber traseiro', value: '0°10′ ± 30′' },
          { label: 'Cáster', value: '6°43′ ± 1°' },
          { label: 'Convergência dianteira', value: '0 ± 2 mm' },
          { label: 'Convergência traseira', value: '2 mm (+2 / −1 mm)' },
        ],
      },
      {
        title: '🏎️ Suspensão',
        emoji: '🏎️',
        items: [
          { label: 'Tipo', value: 'Independente nas 4 rodas' },
          { label: 'Dianteira', value: 'McPherson' },
          { label: 'Traseira', value: 'Double Wishbone (Braço duplo)' },
          { label: 'Capacidade de carga', value: '410 kg (manual) / 435 kg (automático)' },
        ],
      },
      {
        title: '🔵 Pneus e Rodas',
        emoji: '🔵',
        items: [
          { label: 'Pneus', value: '205/55 R16 91V' },
          { label: 'Rodas', value: 'Liga leve 16 × 6½ JJ' },
          { label: 'Pressão dianteira', value: '220 kPa (2,2 kgf/cm²) — 32 PSI' },
          { label: 'Pressão traseira', value: '220 kPa (2,2 kgf/cm²) — 32 PSI' },
        ],
      },
      {
        title: '⚡ Sistema Elétrico',
        emoji: '⚡',
        items: [
          { label: 'Alternador', value: '13,5V — 90A' },
          { label: 'Bateria', value: '12V — 47 Ah' },
          { label: 'Vela NGK', value: 'IZFR6K11S (Irídio)' },
          { label: 'Vela Denso', value: 'SKJ20DR-M11S' },
        ],
      },
      {
        title: '🌡️ Arrefecimento',
        emoji: '🌡️',
        items: [
          { label: 'Válvula termostática — abre', value: 'A partir de 80°C' },
          { label: 'Válvula termostática — aberta', value: '95°C (8 mm de curso)' },
          { label: 'Eletroventiladores ligam', value: '101°C' },
          { label: 'Eletroventiladores desligam', value: '98°C' },
          { label: 'Eletroventiladores', value: '2 unidades, 2 velocidades' },
        ],
      },
      {
        title: '🔩 Torques Importantes',
        emoji: '🔩',
        items: [
          { label: 'Parafusos da roda', value: '108 Nm' },
          { label: 'Suporte da pinça de freio', value: '108 Nm' },
          { label: 'Flange das pastilhas', value: '34 Nm' },
          { label: 'Porcas regulagem de válvulas', value: '14 Nm' },
          { label: 'Tampa de válvulas', value: '10 Nm' },
        ],
      },
    ],
  },
};

// ---- Marcas disponíveis ----
export const CAR_BRANDS = [
  'Acura', 'Audi', 'BMW', 'Chevrolet', 'Chery', 'Citroën',
  'Fiat', 'Ford', 'Honda', 'Hyundai', 'JAC', 'Jeep',
  'Kia', 'Lexus', 'Mercedes-Benz', 'Mitsubishi', 'Nissan',
  'Peugeot', 'Renault', 'Subaru', 'Suzuki', 'Toyota',
  'Volkswagen', 'Volvo', 'BYD', 'Caoa Chery', 'GWM',
  'Outro'
];

// ---- Tipos de combustível ----
export const FUEL_TYPES = [
  { id: 'flex',     label: 'Flex (Gasolina/Etanol)' },
  { id: 'gasoline', label: 'Gasolina' },
  { id: 'diesel',   label: 'Diesel' },
  { id: 'electric', label: 'Elétrico' },
  { id: 'hybrid',   label: 'Híbrido' },
  { id: 'cng',      label: 'GNV' },
];

// ---- Tipos de câmbio ----
export const TRANSMISSION_TYPES = [
  { id: 'manual',    label: 'Manual' },
  { id: 'automatic', label: 'Automático' },
  { id: 'cvt',       label: 'CVT' },
  { id: 'dct',       label: 'Automático de Dupla Embreagem (DCT)' },
];

// ---- Calcular status de um item de manutenção ----
// Retorna: { status: 'ok'|'warning'|'overdue', percent: 0-100+, kmLeft: number, label: string }
export function calcMaintenanceStatus(item, lastServiceKm, lastServiceDate, currentKm) {
  let kmStatus = null, dateStatus = null;

  // KM check
  if (item.kmInterval && lastServiceKm != null) {
    const nextKm = lastServiceKm + item.kmInterval;
    const kmLeft = nextKm - currentKm;
    const pct = Math.min(((currentKm - lastServiceKm) / item.kmInterval) * 100, 110);
    const warnThreshold = item.kmInterval * 0.15; // 15% antes
    kmStatus = {
      nextKm,
      kmLeft,
      percent: pct,
      status: pct >= 100 ? 'overdue' : pct >= 85 ? 'warning' : 'ok',
      label: pct >= 100 ? `${Math.abs(kmLeft).toLocaleString('pt-BR')} km atrasado` :
             `${kmLeft.toLocaleString('pt-BR')} km restantes`,
    };
  }

  // Date check
  if (item.monthInterval && lastServiceDate) {
    const last = new Date(lastServiceDate);
    const next = new Date(last);
    next.setMonth(next.getMonth() + item.monthInterval);
    const now = new Date();
    const totalMs = next - last;
    const elapsedMs = now - last;
    const pct = Math.min((elapsedMs / totalMs) * 100, 110);
    const monthsLeft = Math.round((next - now) / (1000 * 60 * 60 * 24 * 30));
    dateStatus = {
      nextDate: next,
      monthsLeft,
      percent: pct,
      status: pct >= 100 ? 'overdue' : pct >= 85 ? 'warning' : 'ok',
      label: pct >= 100 ? `${Math.abs(monthsLeft)} mês(es) atrasado` :
             `${monthsLeft} mês(es) restante(s)`,
    };
  }

  // Merge: worst status wins
  if (!kmStatus && !dateStatus) {
    return { status: 'ok', percent: 0, label: 'Nunca registrado' };
  }

  const statuses = [kmStatus, dateStatus].filter(Boolean);
  const worst = statuses.reduce((a, b) => {
    const order = { overdue: 3, warning: 2, ok: 1 };
    return order[a.status] >= order[b.status] ? a : b;
  });

  return {
    status: worst.status,
    percent: Math.round(worst.percent),
    label: worst.label,
    kmLeft: kmStatus?.kmLeft,
    nextKm: kmStatus?.nextKm,
    nextDate: dateStatus?.nextDate,
  };
}

// ---- Formatar KM ----
export function formatKm(km) {
  return Number(km).toLocaleString('pt-BR') + ' km';
}

// ---- Formatar moeda ----
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---- Formatar data ----
export function formatDate(date) {
  if (!date) return '—';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('pt-BR');
}
