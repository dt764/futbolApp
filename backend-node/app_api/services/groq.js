const { z } = require('zod');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
const { ChatGroq } = require('@langchain/groq');

class IdealTeamService {
  constructor(model) {
    this.model = model;

    this.parser = StructuredOutputParser.fromZodSchema(
      z.object({
        formation: z.string().describe('formación táctica, ej: 4-3-3'),
        startingXI: z
          .array(
            z.object({
              name: z.string().describe('nombre del jugador'),
              position: z.string().describe('posición en el campo'),
              reason: z.string().describe('motivo breve de la selección'),
            })
          )
          .describe('11 jugadores titulares'),
        substitutes: z
          .array(
            z.object({
              name: z.string().describe('nombre del jugador'),
              position: z.string().describe('posición en el campo'),
              reason: z.string().describe('motivo breve de la selección'),
            })
          )
          .describe('jugadores suplentes'),
        coach: z.string().describe('nombre sugerido del entrenador'),
        summary: z.string().describe('explicación breve del equipo'),
      })
    );

    this.chain = RunnableSequence.from([
      new PromptTemplate({
        template: `Eres un entrenador de fútbol experto. Dada una lista de jugadores disponibles, selecciona el mejor equipo ideal posible.
{format_instructions}
Jugadores disponibles: {players}
{formation_instruction}`,
        inputVariables: ['players', 'formation_instruction'],
        partialVariables: {
          format_instructions: this.parser.getFormatInstructions(),
        },
      }),
      this.model,
      this.parser,
    ]);
  }

  async generateIdealTeam({ players, formation }) {
    const formationInstruction = formation
      ? `Formación: ${formation}`
      : 'Elige la mejor formación según los jugadores disponibles.';

    const response = await this.chain.invoke({
      players: JSON.stringify(players, null, 2),
      formation_instruction: formationInstruction,
    });

    return response;
  }
}

const createIdealTeamService = () => {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
  });
  return new IdealTeamService(model);
};

module.exports = { IdealTeamService, createIdealTeamService };
