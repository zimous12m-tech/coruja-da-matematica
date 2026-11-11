import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as h from './lib.mjs';
import { TEMPLATES } from './templates.mjs';

const ROOT = 'src/content/mundos';

const MUNDOS = [
  {
    id: 'mundo-1', ordem: 1,
    nome: { 'pt-PT': 'Vale dos Números', en: 'Number Valley' },
    descricao: { 'pt-PT': 'Valor posicional e números inteiros.', en: 'Place value and integers.' },
    tema: 'numeros', cor: '#2c8fe0', corSuave: '#e7f2fc',
    icone: 'numeros', topicos: ['numeros', 'inteiros'],
    grupos: [['num-nat', 'numeros'], ['num-int', 'inteiros']]
  },
  {
    id: 'mundo-2', ordem: 2,
    nome: { 'pt-PT': 'Cozinha das Frações', en: 'Fraction Kitchen' },
    descricao: { 'pt-PT': 'Frações e equações simples.', en: 'Fractions and simple equations.' },
    tema: 'fracoes', cor: '#ff9e33', corSuave: '#fff1df',
    icone: 'fracoes', topicos: ['fracoes', 'equacoes'],
    grupos: [['fra-add', 'fracoes'], ['fra-comp', 'fracoes'], ['fra-mult', 'fracoes'], ['equ-res', 'equacoes']]
  },
  {
    id: 'mundo-3', ordem: 3,
    nome: { 'pt-PT': 'Oficina da Geometria', en: 'Geometry Workshop' },
    descricao: { 'pt-PT': 'Áreas, perímetros e potências.', en: 'Areas, perimeters and powers.' },
    tema: 'geometria', cor: '#c2458f', corSuave: '#fbe9f3',
    icone: 'geometria', topicos: ['geometria', 'potencias'],
    grupos: [['geo-are', 'geometria'], ['pot-cal', 'potencias']]
  },
  {
    id: 'mundo-4', ordem: 4,
    nome: { 'pt-PT': 'Mercado das Percentagens', en: 'Percentage Market' },
    descricao: { 'pt-PT': 'Percentagens e proporções.', en: 'Percentages and proportions.' },
    tema: 'percentagens', cor: '#1fa97a', corSuave: '#e3f7ee',
    icone: 'percentagens', topicos: ['percentagens', 'proporcionalidade'],
    grupos: [['per-cal', 'percentagens'], ['pro-dir', 'proporcionalidade']]
  },
  {
    id: 'mundo-5', ordem: 5,
    nome: { 'pt-PT': 'Observatório de Dados', en: 'Data Observatory' },
    descricao: { 'pt-PT': 'Estatística e probabilidades.', en: 'Statistics and probability.' },
    tema: 'estatistica', cor: '#0e9aa7', corSuave: '#e2f6f8',
    icone: 'estatistica', topicos: ['estatistica', 'probabilidades'],
    grupos: [['est-med', 'estatistica'], ['prob-cal', 'probabilidades']]
  },
  {
    id: 'mundo-6', ordem: 6,
    nome: { 'pt-PT': 'Gabinete da Lógica', en: 'Logic Office' },
    descricao: { 'pt-PT': 'Lógica e números decimais.', en: 'Logic and decimals.' },
    tema: 'logica', cor: '#7b4be0', corSuave: '#efe7ff',
    icone: 'logica', topicos: ['logica', 'decimais'],
    grupos: [['log-pro', 'logica'], ['dec-ope', 'decimais']]
  }
];

const NIVEIS_REGULARES = 5;
const PERGUNTAS_POR_NIVEL = 10;
const PERGUNTAS_BOSS = 10;

function gerarExercicio(prefixo, topico, mundoId, dificuldade, indice, template) {
  const base = template(h, dificuldade);
  h.assert(typeof base.pt === 'string' && base.pt.length > 0, `${prefixo}: pt vazio`);
  h.assert(typeof base.en === 'string' && base.en.length > 0, `${prefixo}: en vazio`);
  h.assert(base.correct !== undefined, `${prefixo}: sem resposta`);
  h.assert(Array.isArray(base.wrongs) && base.wrongs.length === 2, `${prefixo}: precisa de 2 distratores`);
  h.assert(base.near !== undefined, `${prefixo}: sem distrator adjacente`);
  h.assert(String(base.near) !== String(base.correct), `${prefixo}: adjacente igual à resposta`);
  for (const wrong of base.wrongs) {
    h.assert(String(wrong) !== String(base.correct), `${prefixo}: distrator igual à resposta`);
  }

  const { opcoes, resposta } = h.build(base.correct, base.wrongs, base.near);
  const id = `${prefixo}-${String(indice).padStart(4, '0')}`;

  const exercicio = {
    id,
    worldId: mundoId,
    topico,
    subtipo: base.subtipo,
    dificuldade,
    curriculo: [`PT_6ano_MAT_${topico.toUpperCase()}`],
    pergunta: {
      'pt-PT': base.pt,
      en: base.en,
      'pt-BR': base.pt,
      es: base.pt
    },
    opcoes,
    resposta,
    explicacao: {
      'pt-PT': base.ep,
      en: base.ee,
      'pt-BR': base.ep,
      es: base.ep
    },
    tempoSugerido: 20 + dificuldade * 15,
    tags: [prefixo, 'gerado']
  };

  if (base.visual) exercicio.visual = base.visual;

  return exercicio;
}

function gerarMundo(mundo) {
  const dir = join(ROOT, mundo.id);
  const dirQ = join(dir, 'questoes');
  mkdirSync(dirQ, { recursive: true });

  // Manifest
  writeFileSync(
    join(dir, 'manifest.json'),
    `${JSON.stringify({
      id: mundo.id,
      ordem: mundo.ordem,
      nome: mundo.nome,
      descricao: mundo.descricao,
      tema: mundo.tema,
      cor: mundo.cor,
      corSuave: mundo.corSuave,
      icone: mundo.icone,
      topicos: mundo.topicos
    }, null, 2)}\n`
  );

  // Gerar exercícios
  const totalNecessario = NIVEIS_REGULARES * PERGUNTAS_POR_NIVEL + PERGUNTAS_BOSS;
  const exercicios = [];
  const idsUsados = new Set();
  let contador = 100;
  let tentativas = 0;

  while (exercicios.length < totalNecessario && tentativas < 5000) {
    tentativas += 1;
    const [prefixo, topico] = h.pick(mundo.grupos);
    const template = h.pick(TEMPLATES[prefixo]);
    const ratio = exercicios.length / totalNecessario;
    const dificuldade = ratio < 0.3 ? 1 : ratio < 0.75 ? 2 : 3;

    contador += 1;
    try {
      const exercicio = gerarExercicio(prefixo, topico, mundo.id, dificuldade, contador, template);
      if (idsUsados.has(exercicio.id)) continue;
      idsUsados.add(exercicio.id);
      exercicios.push(exercicio);
      writeFileSync(join(dirQ, `${exercicio.id}.json`), `${JSON.stringify(exercicio, null, 2)}\n`);
    } catch (error) {
      // colisão de opções — tenta outro
    }
  }

  h.assert(exercicios.length === totalNecessario, `${mundo.id}: só gerei ${exercicios.length} de ${totalNecessario}`);

  // Index
  writeFileSync(
    join(dir, 'index.json'),
    `${JSON.stringify(exercicios.map((e) => e.id), null, 2)}\n`
  );

  // Níveis regulares (5 × 10)
  let cursor = 0;
  for (let nivel = 1; nivel <= NIVEIS_REGULARES; nivel += 1) {
    const ids = exercicios.slice(cursor, cursor + PERGUNTAS_POR_NIVEL).map((e) => e.id);
    cursor += PERGUNTAS_POR_NIVEL;
    writeFileSync(
      join(dir, `nivel-${nivel}.json`),
      `${JSON.stringify({
        id: `${mundo.id}-nivel-${nivel}`,
        worldId: mundo.id,
        titulo: { 'pt-PT': `Nível ${nivel}`, en: `Level ${nivel}` },
        boss: false,
        tempoSugerido: 150 + nivel * 20,
        questionIds: ids
      }, null, 2)}\n`
    );
  }

  // Boss (1 × 10)
  const bossIds = exercicios.slice(cursor, cursor + PERGUNTAS_BOSS).map((e) => e.id);
  writeFileSync(
    join(dir, 'nivel-6.json'),
    `${JSON.stringify({
      id: `${mundo.id}-nivel-6`,
      worldId: mundo.id,
      titulo: { 'pt-PT': 'Boss', en: 'Boss' },
      boss: true,
      tempoSugerido: 200,
      questionIds: bossIds
    }, null, 2)}\n`
  );

  return exercicios.length;
}

function main() {
  h.setSeed(20261110);
  console.log('A gerar conteúdo…');
  let total = 0;
  for (const mundo of MUNDOS) {
    if (!existsSync(join(ROOT, mundo.id))) mkdirSync(join(ROOT, mundo.id), { recursive: true });
    const n = gerarMundo(mundo);
    console.log(`  ${mundo.id}: ${n} exercícios`);
    total += n;
  }
  console.log(`\n✅ Total: ${total} exercícios em ${MUNDOS.length} mundos.`);
  console.log(`   ${MUNDOS.length * 6} níveis (5 regulares + 1 boss por mundo).`);
}

main();