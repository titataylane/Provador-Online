import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a virtual try-on image using Gemini.
 */
export const generateTryOn = async (
  personImageBase64: string,
  personMimeType: string,
  clothImageBase64: string,
  clothMimeType: string
): Promise<string> => {
  try {
    const personPart = {
      inlineData: {
        data: personImageBase64,
        mimeType: personMimeType,
      },
    };

    const clothPart = {
      inlineData: {
        data: clothImageBase64,
        mimeType: clothMimeType,
      },
    };

    // We explicitly instruct the model to perform a virtual try-on
    const prompt = `
      Atue como um especialista em moda e edição de imagem virtual.
      A primeira imagem é a PESSOA.
      A segunda imagem é a ROUPA.
      Gere uma imagem fotorrealista de alta qualidade da PESSOA vestindo a ROUPA.
      
      Diretrizes Críticas:
      1. Mantenha as características faciais, tom de pele, tipo de corpo e pose da PESSOA exatamente como na imagem original.
      2. Adapte a ROUPA para caber naturalmente no corpo da pessoa, respeitando sombras, dobras e iluminação.
      3. Se a roupa for uma parte de cima, mantenha a parte de baixo original da pessoa (ou vice-versa), a menos que a roupa cubra tudo.
      4. O fundo deve permanecer consistente com a imagem original da pessoa, se possível, ou ser um fundo de estúdio neutro e elegante.
      5. A imagem final deve parecer uma fotografia real, não uma colagem.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [personPart, clothPart, { text: prompt }],
      },
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Nenhuma imagem foi gerada pelo modelo.");

  } catch (error) {
    console.error("Erro ao gerar provador virtual:", error);
    throw error;
  }
};

/**
 * Edits an existing image based on a text prompt.
 */
export const editGeneratedImage = async (
  imageBase64: string,
  promptText: string
): Promise<string> => {
  try {
    // Strip the data:image/png;base64, prefix if present for the API call logic if needed,
    // but the inlineData helper usually expects pure base64.
    // If the input is a full data URL, we need to extract the base64 part.
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    // Assume PNG for generated images, or detect if feasible. defaulting to png is safe for gemini output.
    const mimeType = 'image/png'; 

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    const prompt = `Edite esta imagem com a seguinte instrução: ${promptText}. Mantenha o fotorrealismo e a alta qualidade.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [imagePart, { text: prompt }],
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("Não foi possível editar a imagem.");
  } catch (error) {
    console.error("Erro ao editar imagem:", error);
    throw error;
  }
};
