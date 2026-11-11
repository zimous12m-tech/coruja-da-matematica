const ORDINAL_PT = ['unidades', 'dezenas', 'centenas', 'milhares', 'dezenas de milhar'];
const ORDINAL_EN = ['units', 'tens', 'hundreds', 'thousands', 'ten-thousands'];

function numNat(h, d) {
  let n = 0;
  let digit = 0;
  do {
    n = h.int(d === 1 ? 1000 : 10000, d === 3 ? 999999 : 99999);
    digit = h.pick([2, 3, 4, 5, 6, 7, 8, 9]);
  } while (!String(n).includes(String(digit)));
  const index = String(n).indexOf(String(digit));
  const place = 10 ** (String(n).length - 1 - index);
  const correct = place * digit;
  return {
    subtipo: 'valor-posicional',
    pt: `No número ${n}, qual é o valor do algarismo ${digit}?`,
    en: `In the number ${n}, what is the value of the digit ${digit}?`,
    ep: `O ${digit} está na ordem das ${ORDINAL_PT[Math.log10(place)]}, por isso vale ${correct}.`,
    ee: `The ${digit} is in the ${ORDINAL_EN[Math.log10(place)]} place, so it is worth ${correct}.`,
    correct,
    wrongs: [digit, correct * 10],
    near: correct + place
  };
}

function numInt(h, d) {
  const a = h.int(d === 1 ? 1 : 5, d === 3 ? 40 : 15);
  const b = h.int(d === 1 ? 1 : 5, d === 3 ? 40 : 15);
  const correct = a - b;
  return {
    subtipo: 'soma',
    pt: `Quanto é ${a} − ${b}?`,
    en: `What is ${a} − ${b}?`,
    ep: `${a} − ${b} = ${correct}.`,
    ee: `${a} − ${b} = ${correct}.`,
    correct,
    wrongs: [a + b, -correct],
    near: correct + 1
  };
}

function fraAdd(h) {
  const den = h.pick([4, 5, 6, 8, 10]);
  const a = h.int(1, den - 2);
  const b = h.int(1, den - a);
  const correct = `${a + b}/${den}`;
  return {
    subtipo: 'adicao',
    pt: `Quanto é ${a}/${den} + ${b}/${den}?`,
    en: `What is ${a}/${den} + ${b}/${den}?`,
    ep: `Mesmo denominador: somam-se os numeradores, ${a} + ${b} = ${a + b}. Resultado ${correct}.`,
    ee: `Same denominator: add the numerators, ${a} + ${b} = ${a + b}. Result ${correct}.`,
    correct,
    wrongs: [`${a + b}/${den * 2}`, `${a * b}/${den}`],
    near: `${a + b + 1}/${den}`,
    visual: { tipo: 'pizza', fatias: den, comidas: Math.min(den, a + b) }
  };
}

function fraComp(h) {
  const den = h.pick([4, 5, 6, 8]);
  const n = h.int(1, den - 1);
  const bigger = h.pick([2, 3]);
  const correct = `${n}/${den}`;
  return {
    subtipo: 'comparacao',
    pt: `Qual destas frações é maior: ${n}/${den} ou ${n}/${den * bigger}?`,
    en: `Which is bigger: ${n}/${den} or ${n}/${den * bigger}?`,
    ep: `Com o mesmo numerador, é maior a fração de menor denominador: ${correct}.`,
    ee: `Same numerator: the smaller denominator wins: ${correct}.`,
    correct,
    wrongs: [`${n}/${den * bigger}`, `${n}/${den * bigger + 1}`],
    near: `${n + 1}/${den}`,
    visual: { tipo: 'fracaoComparada', a: { n, d: den }, b: { n, d: den * bigger } }
  };
}

function fraMult(h) {
  const a = h.int(1, 4);
  const b = h.int(2, 6);
  const c = h.int(1, 4);
  const d = h.int(2, 6);
  const correct = `${a * c}/${b * d}`;
  return {
    subtipo: 'multiplicacao',
    pt: `Quanto é ${a}/${b} × ${c}/${d}?`,
    en: `What is ${a}/${b} × ${c}/${d}?`,
    ep: `Multiplicam-se numeradores e denominadores: ${a * c}/${b * d}.`,
    ee: `Multiply numerators and denominators: ${a * c}/${b * d}.`,
    correct,
    wrongs: [`${a + c}/${b + d}`, `${a * d}/${b * c}`],
    near: `${a * c + 1}/${b * d}`
  };
}

function equRes(h) {
  const a = h.int(2, 9);
  const x = h.int(2, 12);
  const b = h.int(1, 9);
  return {
    subtipo: 'resolucao',
    pt: `Resolve a equação ${a}x + ${b} = ${a * x + b}.`,
    en: `Solve ${a}x + ${b} = ${a * x + b}.`,
    ep: `${a}x = ${a * x + b} − ${b} = ${a * x}. Então x = ${a * x} ÷ ${a} = ${x}.`,
    ee: `${a}x = ${a * x + b} − ${b} = ${a * x}. So x = ${a * x} ÷ ${a} = ${x}.`,
    correct: x,
    wrongs: [a * x + b, a * x],
    near: x + 1
  };
}

function geoAre(h, d) {
  const c = h.int(2, d === 3 ? 20 : 10);
  const l = h.int(2, d === 3 ? 20 : 10);
  const correct = c * l;
  return {
    subtipo: 'area',
    pt: `Um retângulo tem ${c} cm de comprimento e ${l} cm de largura. Qual é a área?`,
    en: `A rectangle is ${c} cm long and ${l} cm wide. What is the area?`,
    ep: `Área = comprimento × largura = ${c} × ${l} = ${correct} cm².`,
    ee: `Area = length × width = ${c} × ${l} = ${correct} cm².`,
    correct: `${correct} cm²`,
    wrongs: [`${2 * (c + l)} cm²`, `${c + l} cm²`],
    near: `${correct + c} cm²`
  };
}

function potCal(h) {
  const base = h.int(2, 9);
  const exp = h.int(2, 4);
  const correct = base ** exp;
  return {
    subtipo: 'calculo',
    pt: `Quanto é ${base} elevado a ${exp}?`,
    en: `What is ${base} to the power of ${exp}?`,
    ep: `${Array(exp).fill(base).join(' × ')} = ${correct}.`,
    ee: `${Array(exp).fill(base).join(' × ')} = ${correct}.`,
    correct,
    wrongs: [base * exp, correct + base],
    near: correct - base
  };
}

function perCal(h) {
  const p = h.pick([10, 20, 25, 50]);
  const total = h.pick([40, 60, 80, 100, 120]);
  const correct = (total * p) / 100;
  return {
    subtipo: 'calculo',
    pt: `Quanto é ${p} % de ${total}?`,
    en: `What is ${p} % of ${total}?`,
    ep: `${p} % é ${p} em cada 100: ${total} ÷ 100 × ${p} = ${correct}.`,
    ee: `${p} % is ${p} in every 100: ${total} ÷ 100 × ${p} = ${correct}.`,
    correct,
    wrongs: [total * p, total / p],
    near: correct + 5
  };
}

function proDir(h) {
  const unit = h.int(2, 6);
  const n = h.int(2, 5);
  const m = n + h.int(1, 4);
  const correct = unit * m;
  return {
    subtipo: 'direta',
    pt: `Se ${n} cadernos custam ${unit * n} €, quanto custam ${m} cadernos iguais?`,
    en: `If ${n} notebooks cost ${unit * n} €, how much do ${m} notebooks cost?`,
    ep: `Um caderno custa ${unit} €. Para ${m}: ${m} × ${unit} = ${correct} €.`,
    ee: `One notebook is ${unit} €. For ${m}: ${m} × ${unit} = ${correct} €.`,
    correct,
    wrongs: [unit * n, unit * n + unit],
    near: correct + unit
  };
}

function estMed(h) {
  for (let tent = 0; tent < 60; tent += 1) {
    const values = Array.from({ length: 4 }, () => h.int(4, 20));
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum % 4 !== 0) continue;
    const mean = sum / 4;
    return {
      subtipo: 'media',
      pt: `Qual é a média de ${values.join(', ')}?`,
      en: `What is the mean of ${values.join(', ')}?`,
      ep: `Soma = ${sum}. Divide por 4: ${sum} ÷ 4 = ${mean}.`,
      ee: `Sum = ${sum}. Divide by 4: ${sum} ÷ 4 = ${mean}.`,
      correct: mean,
      wrongs: [sum, mean + 2],
      near: mean + 1
    };
  }
  throw new Error('est-med: não consegui obter média inteira');
}

function probCal(h) {
  const fav = h.int(2, 7);
  const total = fav + h.int(2, 8);
  const correct = `${fav}/${total}`;
  return {
    subtipo: 'calculo',
    pt: `Um saco tem ${fav} bolas verdes e ${total - fav} azuis. Qual é a probabilidade de tirar verde?`,
    en: `A bag has ${fav} green and ${total - fav} blue balls. What is the probability of drawing green?`,
    ep: `${fav} casos favoráveis em ${total}: ${correct}.`,
    ee: `${fav} favourable out of ${total}: ${correct}.`,
    correct,
    wrongs: [`${fav}/${total - fav}`, `${total - fav}/${total}`],
    near: `${fav + 1}/${total}`
  };
}

function logPro(h) {
  const pos = h.int(2, 9);
  const gap = h.int(2, 6);
  const correct = gap - 1;
  return {
    subtipo: 'ordem',
    pt: `Numa fila, a Ana é a ${pos}.ª e o Rui é o ${pos + gap}.º. Quantas pessoas estão entre eles?`,
    en: `In a queue Ana is ${pos}th and Rui is ${pos + gap}th. How many are between them?`,
    ep: `Entre o ${pos}.º e o ${pos + gap}.º há ${correct} pessoas.`,
    ee: `Between ${pos}th and ${pos + gap}th there are ${correct} people.`,
    correct,
    wrongs: [gap, gap + 1],
    near: correct + 1
  };
}

function decOpe(h) {
  const a = h.int(10, 90) / 10;
  const b = h.int(10, 90) / 10;
  const correct = Math.round((a + b) * 10) / 10;
  return {
    subtipo: 'adicao',
    pt: `Quanto é ${h.pt(a)} + ${h.pt(b)}?`,
    en: `What is ${a} + ${b}?`,
    ep: `${h.pt(a)} + ${h.pt(b)} = ${h.pt(correct)}.`,
    ee: `${a} + ${b} = ${correct}.`,
    correct: h.pt(correct),
    wrongs: [h.pt(Math.abs(a - b)), h.pt(a)],
    near: h.pt(Math.round((correct + 1) * 10) / 10)
  };
}

export const TEMPLATES = {
  'num-nat': [numNat],
  'num-int': [numInt],
  'fra-add': [fraAdd],
  'fra-comp': [fraComp],
  'fra-mult': [fraMult],
  'equ-res': [equRes],
  'geo-are': [geoAre],
  'pot-cal': [potCal],
  'per-cal': [perCal],
  'pro-dir': [proDir],
  'est-med': [estMed],
  'prob-cal': [probCal],
  'log-pro': [logPro],
  'dec-ope': [decOpe]
};