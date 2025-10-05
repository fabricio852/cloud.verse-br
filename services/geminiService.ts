
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateScenarioQuiz = async (scenario: string): Promise<{ questions: Question[], diagramUrl: string | null }> => {
    const questionsPromise = generateQuestionsForScenario(scenario);
    const diagramPromise = generateDiagramForScenario(scenario);

    const [questions, diagramUrl] = await Promise.all([questionsPromise, diagramPromise]);

    return { questions, diagramUrl };
};

const generateQuestionsForScenario = async (scenario: string): Promise<Question[]> => {
    const systemPrompt = "Você é um especialista em criar questões para a certificação AWS Solutions Architect Associate (SAA-C03). Sua tarefa é gerar um quiz em JSON baseado em um cenário descrito pelo usuário. As questões devem ser realistas, desafiadoras e relevantes para o cenário, cobrindo diferentes domínios (SECURE, RESILIENT, PERFORMANCE, COST).";
    const userQuery = `Gere 5 questões de múltipla escolha (4 opções) para a certificação AWS SAA-C03 com base neste cenário: "${scenario}". As questões e alternativas realmente dvem espelhar o padrão dessa prova, com sua carga de complexidade específica. Para cada questão, forneça um ID único, o domínio, o enunciado (stem), as opções (options), a chave da resposta correta (answerKey) e uma explicação detalhada (explanation_detailed). Certifique-se de que as explicações sejam claras e úteis para o estudo.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userQuery }] }],
            config: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    domain: { type: Type.STRING, enum: ["SECURE", "RESILIENT", "PERFORMANCE", "COST"] },
                                    stem: { type: Type.STRING },
                                    options: {
                                        type: Type.OBJECT,
                                        properties: { A: { type: Type.STRING }, B: { type: Type.STRING }, C: { type: Type.STRING }, D: { type: Type.STRING } },
                                        required: ["A", "B", "C", "D"]
                                    },
                                    answerKey: { type: Type.STRING },
                                    explanation_detailed: { type: Type.STRING }
                                },
                                required: ["id", "domain", "stem", "options", "answerKey", "explanation_detailed"]
                            }
                        }
                    },
                    required: ["questions"]
                }
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson.questions && parsedJson.questions.length > 0) {
            return parsedJson.questions;
        }
        throw new Error("A IA não conseguiu gerar questões para este cenário.");
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Falha ao gerar questões. Tente um cenário diferente.");
    }
};

const generateDiagramForScenario = async (scenario: string): Promise<string | null> => {
    const prompt = `Crie um diagrama de arquitetura da AWS claro e simples para o cenário: "${scenario}". Use ícones oficiais da AWS e um estilo limpo, sem texto explicativo na imagem.`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (err) {
        console.error("Falha na geração do diagrama:", err);
        return null;
    }
};

export const getAiExplanation = async (questao: Question): Promise<string> => {
    const systemPrompt = `Você é um especialista em AWS e um excelente professor. Sua tarefa é explicar a resposta para uma questão de certificação da AWS em português do Brasil. Forneça uma explicação detalhada, mas fácil de entender. Foque apenas na resposta correta e não precisa se estender muito. Use uma analogia do mundo real e do cotidiano para ilustrar o conceito principal. Crucial: Identifique os principais serviços ou conceitos da AWS mencionados e adicione hiperlinks para a documentação oficial da AWS em português do Brasil usando o formato markdown [texto do link](URL). Formate sua resposta usando markdown simples (negrito, itálico) e não use cabeçalhos.`;
    const userQuery = `Por favor, explique a resposta para a seguinte questão:\n\n**Questão:** ${questao.stem}\n\n**Opções:**\nA: ${questao.options.A}\nB: ${questao.options.B}\nC: ${questao.options.C}\nD: ${questao.options.D}\n\n**Resposta Correta:** ${questao.answerKey}\n\n**Explicação Original:** ${questao.explanation_detailed}\n\nForneça uma nova explicação detalhada com uma analogia do mundo real e links para a documentação.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userQuery }] }],
            config: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                tools: [{ googleSearch: {} }],
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI explanation:", error);
        throw new Error("Ocorreu um erro ao buscar a explicação da IA.");
    }
};

export const generateFlashcard = async (topic: string): Promise<{ front: string, back: string }> => {
    const systemPrompt = "Você é um especialista em AWS. Crie um flashcard sobre o tópico fornecido. O flashcard deve ter uma pergunta concisa na 'frente' e uma resposta clara e informativa no 'verso'. Seja direto e foque no conceito principal.";
    const userQuery = `Tópico: ${topic}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userQuery }] }],
            config: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
                    required: ["front", "back"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error creating card:", error);
        throw new Error("Falha ao criar o flashcard.");
    }
};

export const getAiAnalysis = async (studyData: object): Promise<string> => {
    const report = JSON.stringify(studyData, null, 2);
    const systemPrompt = "Você é um treinador especialista em certificação AWS. Analise o relatório de progresso de um aluno em formato JSON. Forneça uma análise muito concisa e motivacional, sem se alongar. Identifique o principal ponto forte e a principal área para melhoria. Finalize com um plano de estudos prático e direto com no máximo 2 passos.";
    const userQuery = `Analise meu progresso e me dê um plano de estudos. Aqui está meu relatório:\n\n${report}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: userQuery }] }],
            config: {
                systemInstruction: { parts: [{ text: systemPrompt }] },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        throw new Error("Ocorreu um erro ao buscar a análise.");
    }
};
