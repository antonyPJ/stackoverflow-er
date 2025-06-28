const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Buscar alguns question_id e tag_id existentes
  const questions = await prisma.questions.findMany({ select: { question_id: true }, take: 10 });
  const tags = await prisma.tags.findMany({ select: { tag_id: true }, take: 5 });

  if (questions.length === 0 || tags.length === 0) {
    console.log('Não há perguntas ou tags suficientes no banco para popular question_tags.');
    return;
  }

  // Gerar combinações question_id x tag_id
  const inserts = [];
  for (let i = 0; i < questions.length; i++) {
    // Cada pergunta recebe de 1 a 3 tags aleatórias
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffledTags = tags.sort(() => 0.5 - Math.random());
    for (let j = 0; j < numTags; j++) {
      inserts.push({
        question_id: questions[i].question_id,
        tag_id: shuffledTags[j].tag_id
      });
    }
  }

  // Inserir no banco (evitar duplicatas)
  for (const entry of inserts) {
    try {
      await prisma.questionTags.create({
        data: entry
      });
      console.log(`Inserido: question_id=${entry.question_id}, tag_id=${entry.tag_id}`);
    } catch (err) {
      // Se já existe, ignora
      if (err.code === 'P2002') continue;
      console.error('Erro ao inserir:', entry, err.message);
    }
  }

  console.log(`\nPopulação concluída! Foram inseridas ${inserts.length} combinações question-tag.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  }); 