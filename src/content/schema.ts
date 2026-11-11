import { z } from 'zod';

export const TOPICOS = [
  'numeros', 'inteiros', 'fracoes', 'equacoes', 'geometria', 'potencias',
  'percentagens', 'proporcionalidade', 'estatistica', 'probabilidades',
  'logica', 'decimais'
] as const;

export const worldIdSchema = z.enum([
  'mundo-1', 'mundo-2', 'mundo-3', 'mundo-4', 'mundo-5', 'mundo-6'
]);

export type WorldId = z.infer<typeof worldIdSchema>;

export const localizedTextSchema = z.object({
  'pt-PT': z.string().min(1),
  en: z.string().min(1),
  'pt-BR': z.string().min(1).optional(),
  es: z.string().min(1).optional()
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const worldSchema = z.object({
  id: worldIdSchema,
  ordem: z.number().int().min(1).max(6),
  nome: localizedTextSchema,
  descricao: localizedTextSchema,
  tema: z.string().min(1),
  cor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  corSuave: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icone: z.enum(['numeros', 'fracoes', 'geometria', 'percentagens', 'estatistica', 'logica']),
  topicos: z.array(z.enum(TOPICOS)).min(1)
});

export type World = z.infer<typeof worldSchema>;

export const levelSchema = z.object({
  id: z.string().regex(/^mundo-[1-6]-nivel-[1-6]$/),
  worldId: worldIdSchema,
  titulo: localizedTextSchema,
  boss: z.boolean(),
  tempoSugerido: z.number().int().min(30).max(600),
  questionIds: z.array(z.string().min(1)).min(1).max(10)
});

export type Level = z.infer<typeof levelSchema>;

const fractionSchema = z.object({
  n: z.number().int().min(1),
  d: z.number().int().min(2)
});

export const visualSchema = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('pizza'),
    fatias: z.number().int().min(2).max(12),
    comidas: z.number().int().min(1)
  }),
  z.object({
    tipo: z.literal('fracaoComparada'),
    a: fractionSchema,
    b: fractionSchema
  }),
  z.object({
    tipo: z.literal('desconto'),
    precoCentimos: z.number().int().positive(),
    percentagem: z.number().int().min(1).max(90)
  })
]);

export type Visual = z.infer<typeof visualSchema>;

export const questionSchema = z
  .object({
    id: z.string().regex(/^[a-z]+-[a-z]+-\d{4}$/),
    worldId: worldIdSchema,
    topico: z.enum(TOPICOS),
    subtipo: z.string().min(1),
    dificuldade: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    curriculo: z.array(z.string().min(1)).min(1),
    pergunta: localizedTextSchema,
    visual: visualSchema.optional(),
    opcoes: z.array(z.string().min(1)).min(2).max(4),
    resposta: z.number().int().min(0),
    explicacao: localizedTextSchema,
    tempoSugerido: z.number().int().min(5).max(180),
    tags: z.array(z.string().min(1)).min(1)
  })
  .superRefine((q, ctx) => {
    if (q.resposta >= q.opcoes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resposta'],
        message: 'resposta aponta para uma opção inexistente'
      });
    }
    if (new Set(q.opcoes).size !== q.opcoes.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['opcoes'],
        message: 'opções duplicadas'
      });
    }
  });

export type Question = z.infer<typeof questionSchema>;