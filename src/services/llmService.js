// LLM API Service for parallel queries

/**
 * Get all available model configurations
 * @returns {Array} Array of model objects with id, name, available, logo
 */
export function getAllModels() {
  return Object.entries(LLM_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name,
    available: config.available,
    logo: config.logo,
  }));
}

const LLM_CONFIGS = {
  "deepseek-chat": {
    name: "DeepSeek Chat",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
    available: true,
    logo: "/img/deepseek.png",
  },
  "gpt-4o-mini": {
    name: "GPT-4o Mini",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    apiKey: import.meta.env.VITE_GPT4O_MINI_API_KEY,
    available: true,
    logo: "/img/openai.png",
  },
  "gemini-3-flash-preview": {
    name: "Gemini 3 Flash Preview",
    endpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
    model: "gemini-3-flash-preview",
    apiKey: import.meta.env.VITE_GEMINI_FLASH_LITE_API_KEY,
    available: true,
    logo: "/img/gemini.png",
    isGemini: true,
  },
  "gpt-4o": {
    name: "GPT-4o",
    endpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o",
    apiKey: import.meta.env.VITE_GPT4O_API_KEY,
    available: false,
    logo: "/img/openai.png",
  },
  "claude-3.5": {
    name: "Claude 3.5 Sonnet",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-3-5-sonnet-20241022",
    apiKey: null,
    available: false,
    logo: "/img/anthropic.png",
  },
  "mistral-large": {
    name: "Mistral Large",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-large-latest",
    apiKey: import.meta.env.VITE_MISTRAL_API_KEY,
    available: false,
    logo: "/img/mistral.png",
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    endpoint:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
    model: "gemini-2.5-pro",
    apiKey: import.meta.env.VITE_GEMINI_PRO_API_KEY,
    available: false,
    logo: "/img/gemini.png",
    isGemini: true,
  },
};

/**
 * Query a single LLM with a question
 */
export async function querySingleLLM(modelId, question) {
  const config = LLM_CONFIGS[modelId];

  if (!config) {
    throw new Error(`Unknown model: ${modelId}`);
  }

  // Gemini has different API format
  if (config.isGemini) {
    const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: question,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  // OpenAI/DeepSeek format
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`${config.name} API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Analyze text for brand and competitor mentions
 */
function analyzeMentions(text, brandName, competitors) {
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  const mentions = {
    brand: 0,
    competitors: {},
  };

  // Count brand mentions (case-insensitive)
  const brandRegex = new RegExp(`\\b${lowerBrand}\\b`, "gi");
  const brandMatches = text.match(brandRegex);
  mentions.brand = brandMatches ? brandMatches.length : 0;

  // Count competitor mentions
  competitors.forEach((competitor) => {
    if (competitor.trim()) {
      const lowerComp = competitor.toLowerCase();
      const compRegex = new RegExp(`\\b${lowerComp}\\b`, "gi");
      const compMatches = text.match(compRegex);
      mentions.competitors[competitor] = compMatches ? compMatches.length : 0;
    }
  });

  return mentions;
}

/**
 * Query multiple LLMs in parallel with a single question
 */
export async function queryModelsParallel(
  modelIds,
  question,
  brandName,
  competitors
) {
  const queries = modelIds.map(async (modelId) => {
    try {
      const answer = await querySingleLLM(modelId, question);
      const mentions = analyzeMentions(answer, brandName, competitors);

      return {
        modelId,
        modelName: LLM_CONFIGS[modelId].name,
        success: true,
        answer,
        mentions,
      };
    } catch (error) {
      console.error(`Error querying ${modelId}:`, error);
      return {
        modelId,
        modelName: LLM_CONFIGS[modelId].name,
        success: false,
        error: error.message,
        answer: null,
        mentions: null,
      };
    }
  });

  return await Promise.all(queries);
}

/**
 * Query multiple LLMs with multiple questions in parallel
 */
export async function analyzeQuestionsAcrossModels(
  modelIds,
  questions,
  brandName,
  competitors,
  onProgress
) {
  const totalQueries = modelIds.length * questions.length;
  let completedQueries = 0;

  const results = {
    byModel: {},
    byQuestion: new Array(questions.length).fill(null), // Pre-allocate array with correct size
    summary: {
      totalQuestions: questions.length,
      modelsUsed: modelIds.length,
      brandMentions: 0,
      competitorMentions: {},
    },
  };

  // Initialize results structure
  modelIds.forEach((modelId) => {
    results.byModel[modelId] = {
      modelName: LLM_CONFIGS[modelId].name,
      totalBrandMentions: 0,
      totalCompetitorMentions: {},
      brandAppearances: 0, // Questions where brand appeared
      questionResults: [],
    };

    competitors.forEach((comp) => {
      if (comp.trim()) {
        results.byModel[modelId].totalCompetitorMentions[comp] = 0;
        results.summary.competitorMentions[comp] = 0;
      }
    });
  });

  // Process questions in batches to avoid overwhelming APIs
  const BATCH_SIZE = 5;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (question, batchIndex) => {
      const questionIndex = i + batchIndex;

      // Update progress with current question
      if (onProgress) {
        onProgress({
          current: questionIndex,
          total: questions.length,
          currentQuestion: question,
        });
      }

      const modelResults = await queryModelsParallel(
        modelIds,
        question,
        brandName,
        competitors
      );

      const questionResult = {
        questionIndex,
        question,
        results: modelResults,
      };

      // Update results
      modelResults.forEach((result) => {
        if (result.success && result.mentions) {
          const modelData = results.byModel[result.modelId];

          // Track brand mentions
          modelData.totalBrandMentions += result.mentions.brand;
          if (result.mentions.brand > 0) {
            modelData.brandAppearances++;
            results.summary.brandMentions++;
          }

          // Track competitor mentions
          Object.entries(result.mentions.competitors).forEach(
            ([comp, count]) => {
              modelData.totalCompetitorMentions[comp] += count;
              results.summary.competitorMentions[comp] += count;
            }
          );

          modelData.questionResults.push({
            questionIndex,
            question,
            answer: result.answer,
            mentions: result.mentions,
          });
        }
      });

      // Assign by index to maintain correct order (not push, which would be random due to async)
      results.byQuestion[questionIndex] = questionResult;

      completedQueries += modelIds.length;
      if (onProgress) {
        onProgress({
          current: questionIndex + 1,
          total: questions.length,
          currentQuestion: question,
        });
      }

      return questionResult;
    });

    await Promise.all(batchPromises);

    // Longer delay between batches to respect API rate limits (especially Gemini)
    if (i + BATCH_SIZE < questions.length) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds instead of 500ms
    }
  }

  // Calculate final summary statistics
  let totalBrandMentions = 0;
  let totalCompetitorMentions = 0;
  let totalBrandAppearances = 0;
  let totalCompetitorAppearances = 0;

  modelIds.forEach((modelId) => {
    const modelData = results.byModel[modelId];
    totalBrandMentions += modelData.totalBrandMentions;
    totalBrandAppearances += modelData.brandAppearances;

    Object.values(modelData.totalCompetitorMentions).forEach((count) => {
      totalCompetitorMentions += count;
    });
  });

  results.summary = {
    ...results.summary,
    totalBrandMentions,
    totalCompetitorMentions,
    brandAppearances: totalBrandAppearances,
    competitorAppearances: totalCompetitorAppearances,
    brandAppearanceRate:
      questions.length > 0
        ? totalBrandAppearances / (questions.length * modelIds.length)
        : 0,
  };

  return results;
}

export function getLLMConfigs() {
  return LLM_CONFIGS;
}

export function getAvailableModels() {
  return Object.entries(LLM_CONFIGS)
    .filter(([_, config]) => config.available)
    .map(([id, config]) => ({ id, ...config }));
}
