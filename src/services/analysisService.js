import { analyzeQuestionsAcrossModels } from "./llmService";
import {
  getProjectById,
  getBrandById,
  getCompetitorsByBrandId,
  getQueriesByProjectId,
  getProjectSettings,
  createResult,
  createAnalysisRun,
  completeAnalysisRun,
} from "../utils/db";

/**
 * Extract URLs from LLM response text
 */
function extractURLs(text) {
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  const matches = text.match(urlPattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Analyze sentiment towards brand in LLM response
 * Returns a score from -1 (negative) to 1 (positive)
 */
function analyzeSentiment(text, brandName) {
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  // Check if brand is mentioned
  if (!lowerText.includes(lowerBrand)) {
    return 0;
  }

  // Simple sentiment analysis based on keywords
  const positiveWords = [
    "best",
    "excellent",
    "great",
    "good",
    "top",
    "leading",
    "recommended",
    "popular",
    "trusted",
    "reliable",
    "outstanding",
    "superior",
    "innovative",
  ];
  const negativeWords = [
    "worst",
    "bad",
    "poor",
    "weak",
    "limited",
    "expensive",
    "difficult",
    "problematic",
    "inferior",
    "disappointing",
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  // Find sentences mentioning the brand
  const sentences = text.split(/[.!?]/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (lowerSentence.includes(lowerBrand)) {
      positiveWords.forEach((word) => {
        if (lowerSentence.includes(word)) positiveScore++;
      });
      negativeWords.forEach((word) => {
        if (lowerSentence.includes(word)) negativeScore++;
      });
    }
  }

  // Calculate normalized score
  const total = positiveScore + negativeScore;
  if (total === 0) return 0;

  return (positiveScore - negativeScore) / total;
}

/**
 * Detect brand rank/position in response
 * Returns position (1-based) or null if not in a ranked list
 */
function detectRankPosition(text, brandName) {
  const lowerText = text.toLowerCase();
  const lowerBrand = brandName.toLowerCase();

  // Pattern to detect numbered lists: "1.", "1)", "1:", "#1", etc.
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    if (lowerLine.includes(lowerBrand)) {
      // Check for rank patterns at start of line
      const rankPatterns = [
        /^\s*(\d+)[.)\]:]/, // 1. or 1) or 1:
        /^\s*#(\d+)/, // #1
        /^\s*\((\d+)\)/, // (1)
        /^\s*\[(\d+)\]/, // [1]
      ];

      for (const pattern of rankPatterns) {
        const match = line.match(pattern);
        if (match) {
          return parseInt(match[1], 10);
        }
      }
    }
  }

  return null;
}

/**
 * Run analysis for a project
 * This function queries all LLMs with all questions and stores the results
 */
export async function runProjectAnalysis(projectId, onProgress) {
  try {
    // Get project data
    const project = getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Get brand
    const brand = getBrandById(project.brandId);
    if (!brand) {
      throw new Error("Brand not found");
    }

    // Get competitors
    const competitors = getCompetitorsByBrandId(brand.id);
    const competitorNames = competitors.map((c) => c.name);

    // Get queries
    const queries = getQueriesByProjectId(projectId);
    if (queries.length === 0) {
      throw new Error("No queries found for this project");
    }

    // Get project settings
    const settings = getProjectSettings(projectId);
    if (!settings || settings.enginesEnabled.length === 0) {
      throw new Error("No engines configured for this project");
    }

    // Extract just the question texts
    const questionTexts = queries.map((q) => q.text);

    // Create a new analysis run
    const analysisRun = createAnalysisRun(
      projectId,
      settings.enginesEnabled,
      queries.length
    );

    // Run analysis
    const results = await analyzeQuestionsAcrossModels(
      settings.enginesEnabled,
      questionTexts,
      brand.name,
      competitorNames,
      onProgress
    );

    // Store results in database with runId
    let resultsCount = 0;
    results.byQuestion.forEach((questionResult, index) => {
      const query = queries[index];

      questionResult.results.forEach((modelResult) => {
        if (modelResult.success && modelResult.mentions) {
          // Extract NLP features
          const citedUrls = extractURLs(modelResult.answer);
          const sentimentScore = analyzeSentiment(
            modelResult.answer,
            brand.name
          );
          const rankPosition = detectRankPosition(
            modelResult.answer,
            brand.name
          );

          const analysis = {
            isBrandMentioned: modelResult.mentions.brand > 0,
            mentionedCompetitors: Object.entries(
              modelResult.mentions.competitors
            )
              .filter(([_, count]) => count > 0)
              .map(([name]) => name),
            citedUrls: citedUrls,
            sentimentScore: sentimentScore,
            rankPosition: rankPosition,
          };

          createResult(
            query.id,
            modelResult.modelId,
            modelResult.answer,
            analysis,
            analysisRun.id
          );
          resultsCount++;
        }
      });
    });

    // Mark run as completed
    completeAnalysisRun(analysisRun.id, resultsCount);

    return { ...results, runId: analysisRun.id };
  } catch (error) {
    console.error("Error running project analysis:", error);
    throw error;
  }
}

/**
 * Analyze a single query across selected models
 */
export async function analyzeSingleQuery(
  queryText,
  brandName,
  competitors,
  modelIds,
  onProgress
) {
  try {
    const results = await analyzeQuestionsAcrossModels(
      modelIds,
      [queryText],
      brandName,
      competitors,
      onProgress
    );

    return results;
  } catch (error) {
    console.error("Error analyzing single query:", error);
    throw error;
  }
}

/**
 * Schedule recurring analysis jobs
 * In a real implementation, this would use a job scheduler
 * For now, this is just a placeholder
 */
export function scheduleProjectAnalysis(projectId, frequency) {
  console.log(
    `Scheduled analysis for project ${projectId} with frequency: ${frequency}`
  );

  // In production, this would:
  // 1. Create a cron job or use a job scheduler
  // 2. Run runProjectAnalysis at the specified frequency
  // 3. Send notifications when analysis is complete

  return {
    projectId,
    frequency,
    nextRun: getNextRunDate(frequency),
  };
}

function getNextRunDate(frequency) {
  const now = new Date();

  switch (frequency) {
    case "daily":
      now.setDate(now.getDate() + 1);
      break;
    case "twice_weekly":
      // Next Monday or Thursday
      const dayOfWeek = now.getDay();
      if (dayOfWeek < 1) {
        now.setDate(now.getDate() + (1 - dayOfWeek));
      } else if (dayOfWeek < 4) {
        now.setDate(now.getDate() + (4 - dayOfWeek));
      } else {
        now.setDate(now.getDate() + (8 - dayOfWeek));
      }
      break;
    case "weekly":
      now.setDate(now.getDate() + 7);
      break;
    default:
      now.setDate(now.getDate() + 7);
  }

  return now.toISOString();
}
