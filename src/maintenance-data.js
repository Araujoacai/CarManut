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
    note: 'Use óleo 10W30 (mineral/semissintético). Motor R18A — troca rigorosa preserva a corrente de comando.',
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
    note: 'Motor R18A usa velas de irídio originais Honda. NGK IZFR6K-11 é uma boa opção. Troca aos 60.000 km.',
  },
  {
    id: 'valve_adjustment',
    category: 'engine',
    name: 'Regulagem de Válvulas',
    emoji: '🔧',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'high',
    note: 'Específico do motor R18A. Regulagem evita consumo elevado e instabilidade na marcha lenta. Muito importante!',
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
    note: 'Civic 2008 tem 4 discos. Verifique espessura mínima de 2mm. Troca média a cada 30.000 km.',
  },
  {
    id: 'brake_pads_rear',
    category: 'brakes',
    name: 'Pastilhas de Freio (Traseiras)',
    emoji: '🔴',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'high',
    note: 'Traseiras desgastam mais lentamente que as dianteiras.',
  },
  {
    id: 'brake_discs',
    category: 'brakes',
    name: 'Discos de Freio',
    emoji: '⭕',
    kmInterval: 60000,
    monthInterval: null,
    severity: 'high',
    note: 'Verificar espessura mínima. Trocar junto com as pastilhas se desgastados.',
  },
  {
    id: 'brake_fluid',
    category: 'brakes',
    name: 'Fluido de Freio (DOT 3)',
    emoji: '💧',
    kmInterval: null,
    monthInterval: 36,
    severity: 'critical',
    note: 'Trocar a cada 3 anos independente da quilometragem. Fluido higroscópico perde eficiência com o tempo.',
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
    note: 'Primeira troca aos 60.000 km. Use somente Honda Long Life Coolant ou compatível. Não misture tipos.',
  },
  {
    id: 'thermostat',
    category: 'cooling',
    name: 'Válvula Termostática',
    emoji: '🌡️',
    kmInterval: 80000,
    monthInterval: null,
    severity: 'medium',
    note: 'Motor R18A1: compre a válvula original que começa a abrir aos 80°C e abre totalmente aos 95°C. Evite válvulas paralelas que abrem mais tarde, pois causam superaquecimento.',
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
    note: 'Fazer a cada troca de óleo ou ao notar desgaste irregular dos pneus.',
  },
  {
    id: 'steering_fluid',
    category: 'suspension',
    name: 'Fluido da Direção Hidráulica',
    emoji: '🔄',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'medium',
    note: 'Civic LXS 2008 tem direção hidráulica. Ponto crônico: verificar nível e possíveis vazamentos na bomba.',
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
    note: 'Suspensão independente nas 4 rodas. Verificar vazamento de óleo e ressaltos excessivos.',
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
    note: 'Use Honda MTF original. Câmbio manual — verificar nível e trocar. Torque do bujão: 39 Nm.',
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
    note: 'Medida original: 205/55 R16. Verificar sulcos (mín. 1,6mm) e calibragem a cada 15 dias.',
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
    note: 'Vida útil média de 3-5 anos. Verificar tensão (12,6V em repouso). Limpar terminais.',
  },
  {
    id: 'alternator_belt',
    category: 'electrical',
    name: 'Verificação do Alternador',
    emoji: '⚡',
    kmInterval: 40000,
    monthInterval: null,
    severity: 'medium',
    note: 'Verificar tensão de carga (13,5-14,5V com motor ligado).',
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
      'Motor R18A usa CORRENTE de comando — não requer troca periódica (se óleo em dia)',
      'Direção hidráulica — verificar nível e vazamentos regularmente',
      'Regulagem de válvulas a cada 40.000 km é muito importante neste motor',
      'Velas originais de irídio têm vida útil de 60.000 km',
    ],
    maintenanceOverrides: {
      // Sobrescreve intervalos específicos para este veículo
    }
  }
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
