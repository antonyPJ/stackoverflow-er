// Configuração dos offsets dos labels das linhas de relacionamento
// Modifique estes valores para mover os textos das linhas

export const labelOffsets: { [key: string]: { x: number; y: number } } = {
  // USERS → QUESTIONS
  'users-questions': { 
    x: 0,      // Move horizontalmente (positivo = direita, negativo = esquerda)
    y: -5     // Move verticalmente (positivo = baixo, negativo = cima)
  },
  
  // USERS → ANSWERS
  'users-answers': { 
    x: 0,     // Move 30px para direita
    y: 0       // Não move verticalmente
  },
  
  // QUESTIONS → ANSWERS
  'questions-answers': { 
    x: -30,    // Move 30px para esquerda
    y: -30       // Não move verticalmente
  },
  
  // USERS → COMMENTS
  'users-comments': { 
    x: 15,      // Não move horizontalmente
    y: -40      // Move 20px para baixo
  },
  
  // ANSWERS → COMMENTS
  'answers-comments': { 
    x: -50,      // Não move horizontalmente
    y: 25     // Move 15px para cima
  },
  
  // TAGS → QUESTION_TAGS
  'tags-question_tags': { 
    x: 0,      // Não move horizontalmente
    y: -10     // Move 10px para cima
  },
  
  // QUESTIONS → QUESTION_TAGS
  'questions-question_tags': { 
    x: 0,      // Não move horizontalmente
    y: 10      // Move 10px para baixo
  },
};

// Exemplos de como usar:
// 
// Para mover um label para cima: y: -20
// Para mover um label para baixo: y: 20
// Para mover um label para direita: x: 30
// Para mover um label para esquerda: x: -30
// Para não mover: x: 0, y: 0
//
// Valores típicos:
// - Pequeno ajuste: 10-20px
// - Médio ajuste: 30-50px
// - Grande ajuste: 60-100px 