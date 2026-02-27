import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import {
  getWorkspaceByUserId,
  getBrandsByWorkspaceId,
  getProjectsByBrandId,
  getProjectAnalytics,
  getQueriesByProjectId,
  getResultsByProjectId,
  getCompetitorsByBrandId,
  getProjectSettings,
  updateProjectSettings,
  createQuery,
  deleteQuery,
  getAnalysisRunsByProjectId,
  getResultsByRunId,
} from "../utils/db";
import { runProjectAnalysis } from "../services/analysisService";
import { getAvailableModels, querySingleLLM } from "../services/llmService";

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    workspace,
    setWorkspace,
    currentBrand,
    setCurrentBrand,
    currentProject,
    setCurrentProject,
  } = useWorkspace();

  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [queries, setQueries] = useState([]);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [selectedQueryType, setSelectedQueryType] = useState("all"); // all, branded, category, comparative

  // Model selection state
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Question management state
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("category");
  const [showGenerateQuestions, setShowGenerateQuestions] = useState(false);
  const [questionGenCount, setQuestionGenCount] = useState("10");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generateQuestionsError, setGenerateQuestionsError] = useState("");

  // Response history state
  const [expandedResponses, setExpandedResponses] = useState({});
  const [responseFilter, setResponseFilter] = useState("all"); // all, mentioned, not-mentioned

  // Analysis runs state
  const [analysisRuns, setAnalysisRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [compareRunId, setCompareRunId] = useState(null);

  // AI article engine state
  const [articleCompanyName, setArticleCompanyName] = useState("");
  const [articleCompanyUrl, setArticleCompanyUrl] = useState("");
  const [articleLanguage, setArticleLanguage] = useState("en-US");
  const [articleCountry, setArticleCountry] = useState("US");
  const [articleCount, setArticleCount] = useState("8");
  const [articlePriceUsd, setArticlePriceUsd] = useState("6");
  const [publishEndpoint, setPublishEndpoint] = useState(
    import.meta.env.VITE_DEMO_BLOG_UPLOAD_ENDPOINT ||
      "http://localhost:8787/api/blog/upload"
  );
  const [companyContext, setCompanyContext] = useState("");
  const [trendyKeywords, setTrendyKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [generatedArticles, setGeneratedArticles] = useState([]);
  const [isLoadingContextKeywords, setIsLoadingContextKeywords] =
    useState(false);
  const [isGeneratingArticles, setIsGeneratingArticles] = useState(false);
  const [isPublishingArticles, setIsPublishingArticles] = useState(false);
  const [articleEngineError, setArticleEngineError] = useState("");
  const [articleEngineStatus, setArticleEngineStatus] = useState("");

  const brandActivities =
    [
      currentBrand?.sector && `Sector: ${currentBrand.sector}`,
      currentProject?.targetAudience &&
        `Audience: ${currentProject.targetAudience}`,
      currentProject?.targetCountry &&
        `Country: ${currentProject.targetCountry}`,
      currentBrand?.website && `Website: ${currentBrand.website}`,
    ]
      .filter(Boolean)
      .join("; ") || "General brand activities";

  // Load available models on mount
  useEffect(() => {
    const models = getAvailableModels();
    setAvailableModels(models);
  }, []);

  useEffect(() => {
    if (!currentBrand) return;
    setArticleCompanyName((prev) => prev || currentBrand.name || "");
    setArticleCompanyUrl((prev) => prev || currentBrand.website || "");
  }, [currentBrand]);

  // Load workspace data
  useEffect(() => {
    if (user) {
      const ws = getWorkspaceByUserId(user.id);

      if (!ws) {
        // User hasn't completed onboarding
        setNeedsOnboarding(true);
        navigate("/onboarding");
        return;
      }

      setWorkspace(ws);

      // Load brands
      const brandsList = getBrandsByWorkspaceId(ws.id);
      setBrands(brandsList);

      if (brandsList.length > 0) {
        const brand = currentBrand || brandsList[0];
        setCurrentBrand(brand);

        // Load competitors
        const comps = getCompetitorsByBrandId(brand.id);
        setCompetitors(comps);

        // Load projects
        const projectsList = getProjectsByBrandId(brand.id);
        setProjects(projectsList);

        if (projectsList.length > 0) {
          const project = currentProject || projectsList[0];
          setCurrentProject(project);

          // Load analytics
          const stats = getProjectAnalytics(project.id);
          setAnalytics(stats);

          // Load queries and results
          const qs = getQueriesByProjectId(project.id);
          setQueries(qs);

          const res = getResultsByProjectId(project.id);
          setResults(res);

          // Load project settings (selected models)
          const settings = getProjectSettings(project.id);
          if (settings && settings.enginesEnabled) {
            setSelectedModels(settings.enginesEnabled);
          }

          // Load analysis runs
          const runs = getAnalysisRunsByProjectId(project.id);
          setAnalysisRuns(runs);
          if (runs.length > 0) {
            setSelectedRunId(runs[0].id); // Select most recent run
          }
        }
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleModelToggle = (modelId) => {
    setSelectedModels((prev) => {
      const newSelection = prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId];

      // Update project settings in database
      if (currentProject) {
        updateProjectSettings(currentProject.id, {
          enginesEnabled: newSelection,
        });
      }

      return newSelection;
    });
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim() || !currentProject) return;

    createQuery(
      currentProject.id,
      newQuestionText.trim(),
      newQuestionType,
      currentBrand.language || "en"
    );

    // Reload queries
    const qs = getQueriesByProjectId(currentProject.id);
    setQueries(qs);

    // Reset form
    setNewQuestionText("");
    setNewQuestionType("category");
    setShowAddQuestion(false);
  };

  const handleGenerateQuestions = async () => {
    if (!currentProject || !currentBrand) return;

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      setGenerateQuestionsError(
        "Missing VITE_DEEPSEEK_API_KEY. Please add it to your environment."
      );
      return;
    }

    setIsGeneratingQuestions(true);
    setGenerateQuestionsError("");

    try {
      const desiredCount = Math.max(
        1,
        Math.min(30, Number.parseInt(questionGenCount, 10) || 10)
      );
      const competitorNames = competitors
        .map((comp) => comp.name)
        .filter(Boolean);
      const competitorList =
        competitorNames.length > 0
          ? competitorNames.join(", ")
          : "No competitors provided";
      const competitorRule =
        competitorNames.length > 0
          ? ` or any competitor names (${competitorNames.join(", ")})`
          : "";

      const prompt = `You are an expert at generating search queries that potential customers naturally ask when looking for solutions in a specific industry. Focus on questions that would lead people to discover and compare companies in that sector.

Generate exactly ${desiredCount} strategic questions that potential customers or stakeholders would ask when researching solutions in the following sector:

Brand Context: ${currentBrand.name}
Sector/Activities: ${brandActivities}
Competitors in space: ${competitorList}

CRITICAL Guidelines:
1. DO NOT mention "${currentBrand.name}"${competitorRule} in the questions
2. Questions should be discovery-oriented - what people ask when looking for solutions in this space
3. Focus on questions that would naturally lead to company recommendations or comparisons
4. Include questions about:
   - Best companies/platforms/solutions in this sector
   - Who are the leaders/top providers for specific use cases
   - Recommendations for specific problems this sector solves
   - Comparisons between different approaches in the sector
   - "Which tool/platform/company for [use case]"
5. Make questions specific enough that an AI would mention company names in answers
6. Questions should span: vendor selection, product comparison, market leaders, solution recommendations

Output ONLY the questions, numbered 1-${desiredCount}, one per line.

Format:
1. [Question]
2. [Question]
...
${desiredCount}. [Question]`;

      const response = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content:
                  "You generate high-quality, discovery-oriented questions for market research.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `DeepSeek API error: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || "";
      const questionList = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && /^\d+\./.test(line))
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);

      if (questionList.length === 0) {
        throw new Error("No questions generated. Please try again.");
      }

      const requested = questionList.slice(0, desiredCount);
      const existingQuestions = new Set(
        queries.map((q) => q.text.trim().toLowerCase())
      );
      const toCreate = requested.filter(
        (question) => !existingQuestions.has(question.trim().toLowerCase())
      );

      if (toCreate.length === 0) {
        setGenerateQuestionsError(
          "All generated questions already exist in this project."
        );
        return;
      }

      toCreate.forEach((question) => {
        createQuery(
          currentProject.id,
          question,
          "category",
          currentBrand.language || "en"
        );
      });

      const qs = getQueriesByProjectId(currentProject.id);
      setQueries(qs);

      const stats = getProjectAnalytics(currentProject.id);
      setAnalytics(stats);

      setShowGenerateQuestions(false);
    } catch (error) {
      setGenerateQuestionsError(
        `Failed to generate questions: ${error.message}`
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleDeleteQuestion = (queryId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    deleteQuery(queryId);

    // Reload queries and results
    const qs = getQueriesByProjectId(currentProject.id);
    setQueries(qs);

    const res = getResultsByProjectId(currentProject.id);
    setResults(res);

    // Reload analytics
    const stats = getProjectAnalytics(currentProject.id);
    setAnalytics(stats);
  };

  const handleRunAnalysis = async () => {
    if (!currentProject) return;

    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: queries.length });

    try {
      await runProjectAnalysis(currentProject.id, (progress) => {
        setAnalysisProgress(progress);
      });

      // Reload analytics after analysis
      const stats = getProjectAnalytics(currentProject.id);
      setAnalytics(stats);

      const res = getResultsByProjectId(currentProject.id);
      setResults(res);

      // Reload analysis runs and select the new one
      const runs = getAnalysisRunsByProjectId(currentProject.id);
      setAnalysisRuns(runs);
      if (runs.length > 0) {
        setSelectedRunId(runs[0].id);
      }

      // Redirect to analysis complete page
      navigate(`/analysis-complete?project_id=${currentProject.id}`);
    } catch (error) {
      console.error("Error running analysis:", error);
      alert("Analysis error. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const handleFetchContextAndKeywords = async () => {
    if (!articleCompanyName.trim() || !articleCompanyUrl.trim()) {
      setArticleEngineError("Company name and URL are required.");
      return;
    }

    let normalizedUrl = "";
    try {
      normalizedUrl = new URL(articleCompanyUrl.trim()).toString();
    } catch {
      setArticleEngineError("Company URL must be a valid absolute URL.");
      return;
    }

    const contextEndpoint = (
      import.meta.env.VITE_GET_CONTEXT_ENDPOINT || ""
    ).trim();
    const keywordsEndpoint = (
      import.meta.env.VITE_GET_TRENDY_KEYWORDS_ENDPOINT || ""
    ).trim();
    const hasBackendEndpoints = Boolean(contextEndpoint && keywordsEndpoint);

    setIsLoadingContextKeywords(true);
    setArticleEngineError("");
    setArticleEngineStatus("");

    try {
      let resolvedContext = "";
      const keywordCandidates = [];
      let sourceLabel = "local GPT-4o fallback";
      let usedLocalFallback = false;
      const localResearchModelId = "gpt-4o";

      const runLocalFallback = async (backendErrorMessage = "") => {
        const localGptKey = (import.meta.env.VITE_GPT_API_KEY || "").trim();
        if (!localGptKey) {
          if (backendErrorMessage) {
            throw new Error(
              `Backend path failed (${backendErrorMessage}) and local fallback is not configured. Missing VITE_GPT_API_KEY.`
            );
          }
          throw new Error(
            "Missing VITE_GPT_API_KEY. Add it to your .env to generate context and keywords with GPT-4o."
          );
        }

        if (backendErrorMessage) {
          setArticleEngineStatus(
            `Backend path failed (${backendErrorMessage}). Using local GPT-4o fallback...`
          );
        }

        usedLocalFallback = true;
        sourceLabel = backendErrorMessage
          ? "local GPT-4o fallback (backend path failed)"
          : "local GPT-4o fallback";
        resolvedContext = "";
        keywordCandidates.length = 0;

        const contextPrompt = `You are a company research analyst.
Company: ${articleCompanyName.trim()}
Website: ${normalizedUrl}
Language: ${articleLanguage}
Country: ${articleCountry}

Write a concise business context summary (120-220 words) covering:
1) sector and positioning
2) products/services
3) target audience
4) key differentiators
5) likely customer intent keywords.`;

        resolvedContext = (
          await querySingleLLM(localResearchModelId, contextPrompt, {
            maxTokens: 900,
            temperature: 0.5,
          })
        ).trim();

        if (!resolvedContext) {
          throw new Error("Local context generation returned an empty context.");
        }

        const keywordPrompt = `Based on this company context, generate exactly 20 trendy SEO keyword ideas.
Company: ${articleCompanyName.trim()}
Website: ${normalizedUrl}
Language: ${articleLanguage}
Country: ${articleCountry}

Context:
${resolvedContext}

Return ONLY one keyword per line, no numbering, no bullets, no extra text.`;

        const rawKeywordResponse = await querySingleLLM(
          localResearchModelId,
          keywordPrompt,
          { maxTokens: 900, temperature: 0.6 }
        );

        keywordCandidates.push(
          ...rawKeywordResponse
            .split("\n")
            .map((line) =>
              line.replace(/^[-*•\d\.\)\s]+/, "").replace(/^"|"$/g, "").trim()
            )
            .filter(Boolean)
        );
      };

      if (hasBackendEndpoints) {
        try {
          const contextResponse = await fetch(contextEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: articleCompanyName.trim(),
              url: normalizedUrl,
              language: articleLanguage,
              country: articleCountry,
            }),
          });

          if (!contextResponse.ok) {
            const errorText = await contextResponse.text();
            throw new Error(
              `get_context failed (${contextResponse.status}): ${errorText || "No details"}`
            );
          }

          const contextData = await contextResponse.json();

          resolvedContext =
            typeof contextData === "string"
              ? contextData
              : contextData?.context ||
                contextData?.summary ||
                contextData?.analysis ||
                contextData?.result ||
                "";

          if (!resolvedContext) {
            throw new Error("get_context returned an empty context.");
          }

          const backendFocusKeywords = Array.isArray(contextData?.focusKeywords)
            ? contextData.focusKeywords
            : [];

          const keywordSeeds = [
            articleCompanyName.trim(),
            ...(backendFocusKeywords.length > 0
              ? backendFocusKeywords
              : [
                  ...(currentBrand?.sector ? [currentBrand.sector] : []),
                  ...(currentProject?.targetAudience
                    ? [currentProject.targetAudience]
                    : []),
                ]),
          ];

          const keywordsResponse = await fetch(keywordsEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: articleCompanyName.trim(),
              url: normalizedUrl,
              language: articleLanguage,
              country: articleCountry,
              rawKeywords: keywordSeeds,
            }),
          });

          if (!keywordsResponse.ok) {
            const errorText = await keywordsResponse.text();
            throw new Error(
              `get_trendy_keywords failed (${keywordsResponse.status}): ${errorText || "No details"}`
            );
          }

          const keywordsData = await keywordsResponse.json();

          if (Array.isArray(keywordsData?.keywords)) {
            keywordCandidates.push(...keywordsData.keywords);
          }
          if (Array.isArray(keywordsData?.trendyKeywords)) {
            keywordCandidates.push(...keywordsData.trendyKeywords);
          }
          if (Array.isArray(keywordsData?.topKeywords)) {
            keywordCandidates.push(...keywordsData.topKeywords);
          }
          if (Array.isArray(keywordsData)) {
            keywordsData.forEach((entry) => {
              if (Array.isArray(entry)) {
                keywordCandidates.push(...entry);
                return;
              }
              if (entry && typeof entry === "object") {
                Object.values(entry).forEach((value) => {
                  if (Array.isArray(value)) {
                    keywordCandidates.push(...value);
                  }
                });
              }
            });
          }
          if (keywordsData && typeof keywordsData === "object") {
            Object.values(keywordsData).forEach((value) => {
              if (Array.isArray(value)) {
                keywordCandidates.push(...value);
              }
            });
          }

          if (keywordCandidates.length === 0) {
            throw new Error(
              "get_trendy_keywords returned no related Google Trends keywords."
            );
          }

          sourceLabel = "python backend endpoints";
        } catch (backendError) {
          await runLocalFallback(backendError?.message || "Failed to fetch");
        }
      } else {
        await runLocalFallback();
      }

      const dedupedKeywords = [];
      keywordCandidates.forEach((candidate) => {
        const keyword = String(candidate || "").trim();
        if (!keyword) return;
        if (dedupedKeywords.some((existing) => existing.toLowerCase() === keyword.toLowerCase())) {
          return;
        }
        dedupedKeywords.push(keyword);
      });

      if (dedupedKeywords.length === 0) {
        throw new Error(
          usedLocalFallback
            ? "Local keyword generation returned no keywords."
            : "get_trendy_keywords returned no keywords."
        );
      }

      setCompanyContext(resolvedContext);
      setTrendyKeywords(dedupedKeywords);
      setSelectedKeywords(dedupedKeywords.slice(0, Math.min(12, dedupedKeywords.length)));
      setGeneratedArticles([]);
      setArticleEngineStatus(
        `Loaded context and ${dedupedKeywords.length} trendy keywords (${sourceLabel}).`
      );
    } catch (error) {
      setArticleEngineError(error.message || "Failed to load context and keywords.");
    } finally {
      setIsLoadingContextKeywords(false);
    }
  };

  const handleGenerateArticles = async () => {
    if (!companyContext.trim()) {
      setArticleEngineError(
        "Fetch context and keywords first before generating articles."
      );
      return;
    }

    const requestedCount = Math.max(
      1,
      Math.min(50, Number.parseInt(articleCount, 10) || 1)
    );
    const keywordsPool =
      selectedKeywords.length > 0 ? selectedKeywords : trendyKeywords;

    if (keywordsPool.length === 0) {
      setArticleEngineError("Select at least one keyword before generating.");
      return;
    }

    const articleKeywords = Array.from({ length: requestedCount }, (_, index) => {
      return keywordsPool[index % keywordsPool.length];
    });

    setIsGeneratingArticles(true);
    setArticleEngineError("");
    setArticleEngineStatus("");

    try {
      const generationEndpoint = import.meta.env.VITE_MASS_ARTICLE_ENDPOINT || "";
      const localArticleModelId = "gpt-4o";
      let nextArticles = [];
      let sourceLabel = "local GPT-4o writer";

      if (generationEndpoint) {
        const generationResponse = await fetch(generationEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: articleCompanyName.trim(),
            companyUrl: articleCompanyUrl.trim(),
            context: companyContext,
            keywords: articleKeywords,
            articleCount: requestedCount,
            language: articleLanguage,
            country: articleCountry,
            pricePerArticleUsd:
              Math.max(0, Number.parseFloat(articlePriceUsd) || 0),
          }),
        });

        if (!generationResponse.ok) {
          const errorText = await generationResponse.text();
          throw new Error(
            `Mass article endpoint failed (${generationResponse.status}): ${errorText || "No details"}`
          );
        }

        const generationData = await generationResponse.json();
        const rawArticles = Array.isArray(generationData?.articles)
          ? generationData.articles
          : Array.isArray(generationData?.posts)
            ? generationData.posts
            : Array.isArray(generationData?.data)
              ? generationData.data
              : [];

        if (rawArticles.length === 0) {
          throw new Error("Mass article endpoint returned no articles.");
        }

        nextArticles = rawArticles.slice(0, requestedCount).map((article, idx) => {
          return {
            id: `article-${idx + 1}`,
            title:
              article?.title ||
              `How ${articleCompanyName.trim()} wins on ${articleKeywords[idx]}`,
            keyword: article?.keyword || articleKeywords[idx],
            content:
              article?.content || article?.body || article?.text || "",
          };
        });
        sourceLabel = "backend AI endpoint";
      } else {
        const LOCAL_GENERATION_MAX = 15;
        const localGptKey = (import.meta.env.VITE_GPT_API_KEY || "").trim();
        if (!localGptKey) {
          throw new Error(
            "Missing VITE_GPT_API_KEY. Add it to your .env to generate articles with GPT-4o."
          );
        }

        if (requestedCount > LOCAL_GENERATION_MAX) {
          throw new Error(
            `Local AI generation is limited to ${LOCAL_GENERATION_MAX} articles per run. Lower article count or set VITE_MASS_ARTICLE_ENDPOINT.`
          );
        }

        const contextSnippet = companyContext.slice(0, 2200);
        const nextLocalArticles = [];

        for (let idx = 0; idx < articleKeywords.length; idx += 1) {
          const keyword = articleKeywords[idx];
          setArticleEngineStatus(
            `Generating article ${idx + 1}/${articleKeywords.length} with local GPT-4o writer...`
          );

          const articlePrompt = `Write a production-quality SEO article for a company blog.
Company: ${articleCompanyName.trim()}
Company URL: ${articleCompanyUrl.trim()}
Language locale: ${articleLanguage}
Target country: ${articleCountry}
Primary keyword: ${keyword}

Company context:
${contextSnippet}

Requirements:
- 900 to 1300 words.
- Helpful, specific, and concrete (no placeholders, no generic filler).
- Include a strong intro, multiple H2/H3 sections, and a conclusion with CTA linking to ${articleCompanyUrl.trim()}.
- Use the primary keyword naturally in title, intro paragraph, and several section headings.
- Return semantic HTML in content (h1/h2/h3/p/ul/li/strong/a).
- Do NOT use markdown.

Return ONLY valid JSON, no code fences:
{
  "title": "string",
  "contentHtml": "string"
}`;

          const rawArticleResponse = await querySingleLLM(
            localArticleModelId,
            articlePrompt,
            { maxTokens: 2400, temperature: 0.7 }
          );

          const fallbackTitle = `${articleCompanyName.trim()} guide: ${keyword}`;
          const fallbackBody = String(rawArticleResponse || "").trim();
          let parsedArticle = null;

          try {
            parsedArticle = JSON.parse(fallbackBody);
          } catch {
            try {
              const cleaned = fallbackBody
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/```$/i, "")
                .trim();
              parsedArticle = JSON.parse(cleaned);
            } catch {
              const jsonStart = fallbackBody.indexOf("{");
              const jsonEnd = fallbackBody.lastIndexOf("}");
              if (jsonStart >= 0 && jsonEnd > jsonStart) {
                try {
                  parsedArticle = JSON.parse(
                    fallbackBody.slice(jsonStart, jsonEnd + 1)
                  );
                } catch {
                  parsedArticle = null;
                }
              }
            }
          }

          const resolvedTitle = String(
            parsedArticle?.title || fallbackTitle
          ).trim();
          const resolvedContent = String(
            parsedArticle?.contentHtml ||
              parsedArticle?.content ||
              parsedArticle?.body ||
              fallbackBody ||
              ""
          ).trim();

          if (!resolvedContent) {
            throw new Error(`Failed to generate content for keyword "${keyword}".`);
          }

          nextLocalArticles.push({
            id: `article-${idx + 1}`,
            title: resolvedTitle,
            keyword,
            content: resolvedContent,
          });
        }

        nextArticles = nextLocalArticles;
      }

      setGeneratedArticles(nextArticles);
      setArticleEngineStatus(
        `Generated ${nextArticles.length} articles using ${sourceLabel}.`
      );
    } catch (error) {
      setArticleEngineError(error.message || "Failed to generate articles.");
    } finally {
      setIsGeneratingArticles(false);
    }
  };

  const handlePublishArticles = async () => {
    if (!publishEndpoint.trim()) {
      setArticleEngineError("Provide your backend upload endpoint first.");
      return;
    }
    if (generatedArticles.length === 0) {
      setArticleEngineError("Generate at least one article before publishing.");
      return;
    }

    setIsPublishingArticles(true);
    setArticleEngineError("");
    setArticleEngineStatus("");

    try {
      const response = await fetch(publishEndpoint.trim(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: articleCompanyName.trim(),
          companyUrl: articleCompanyUrl.trim(),
          context: companyContext,
          language: articleLanguage,
          country: articleCountry,
          articlePriceUsd: Math.max(0, Number.parseFloat(articlePriceUsd) || 0),
          totalArticles: generatedArticles.length,
          totalPriceUsd:
            generatedArticles.length *
            Math.max(0, Number.parseFloat(articlePriceUsd) || 0),
          articles: generatedArticles,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Upload endpoint failed (${response.status}): ${errorText || "No details"}`
        );
      }

      setArticleEngineStatus(
        `Published ${generatedArticles.length} articles to ${publishEndpoint.trim()}.`
      );
    } catch (error) {
      setArticleEngineError(error.message || "Failed to publish articles.");
    } finally {
      setIsPublishingArticles(false);
    }
  };

  const handleKeywordToggle = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((item) => item !== keyword)
        : [...prev, keyword]
    );
  };

  if (needsOnboarding) {
    return null; // Will redirect to onboarding
  }

  if (!workspace || !currentBrand || !currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  const hasResults = results.length > 0;
  const normalizedArticleCount = Math.max(
    1,
    Math.min(50, Number.parseInt(articleCount, 10) || 1)
  );
  const normalizedArticlePrice = Math.max(
    0,
    Number.parseFloat(articlePriceUsd) || 0
  );
  const estimatedDraftCost = (
    normalizedArticleCount * normalizedArticlePrice
  ).toFixed(2);
  const estimatedGeneratedCost = (
    generatedArticles.length * normalizedArticlePrice
  ).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Project overview and analysis
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Project Context */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Current Brand
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {currentBrand.name}
            </p>
            {currentBrand.website && (
              <p className="mt-1 text-sm text-gray-600">
                {currentBrand.website}
              </p>
            )}
            {currentBrand.sector && (
              <p className="mt-1 text-sm text-gray-500">
                {currentBrand.sector}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Current Project
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {currentProject.name}
            </p>
            {currentProject.targetCountry && (
              <p className="mt-1 text-sm text-gray-600">
                {currentProject.targetCountry}
              </p>
            )}
            {currentProject.targetAudience && (
              <p className="mt-1 text-sm text-gray-500">
                {currentProject.targetAudience}
              </p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Competitors
            </p>
            {competitors.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">
                No competitors added yet.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {competitors.map((comp) => (
                  <span
                    key={comp.id || comp.name}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium"
                  >
                    {comp.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Article Engine */}
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col gap-2 mb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Article Engine
              </h2>
              <p className="text-sm text-gray-600">
                Enter company data, fetch `get_context` + `get_trendy_keywords`,
                generate bulk articles, then push to your blog endpoint.
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 border border-purple-200 px-4 py-2 text-sm">
              <p className="font-semibold text-purple-700">
                Estimated batch cost: ${estimatedDraftCost}
              </p>
              <p className="text-xs text-purple-600">
                {normalizedArticleCount} article
                {normalizedArticleCount !== 1 ? "s" : ""} x $
                {normalizedArticlePrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Company name
              </label>
              <input
                type="text"
                value={articleCompanyName}
                onChange={(e) => setArticleCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Company URL
              </label>
              <input
                type="url"
                value={articleCompanyUrl}
                onChange={(e) => setArticleCompanyUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://www.company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Language
              </label>
              <input
                type="text"
                value={articleLanguage}
                onChange={(e) => setArticleLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="en-US"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Country
              </label>
              <input
                type="text"
                value={articleCountry}
                onChange={(e) => setArticleCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="US"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Articles to generate
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={articleCount}
                onChange={(e) => setArticleCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Price per article (USD)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={articlePriceUsd}
                onChange={(e) => setArticlePriceUsd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Blog upload endpoint
              </label>
              <input
                type="url"
                value={publishEndpoint}
                onChange={(e) => setPublishEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://your-backend.com/api/blog/upload"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleFetchContextAndKeywords}
              disabled={isLoadingContextKeywords}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isLoadingContextKeywords
                ? "Loading context..."
                : "1) Fetch Context + Trendy Keywords"}
            </button>
            <button
              onClick={handleGenerateArticles}
              disabled={isGeneratingArticles || !companyContext || trendyKeywords.length === 0}
              className="px-4 py-2 rounded-lg border border-purple-600 text-purple-700 text-sm font-semibold hover:bg-purple-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition"
            >
              {isGeneratingArticles ? "Generating..." : "2) Generate Articles"}
            </button>
            <button
              onClick={handlePublishArticles}
              disabled={isPublishingArticles || generatedArticles.length === 0}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {isPublishingArticles ? "Publishing..." : "3) Publish to Endpoint"}
            </button>
          </div>

          {articleEngineError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {articleEngineError}
            </div>
          )}
          {articleEngineStatus && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {articleEngineStatus}
            </div>
          )}

          {companyContext && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Company context
              </label>
              <textarea
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          {trendyKeywords.length > 0 && (
            <div className="mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  Trendy keywords ({selectedKeywords.length} selected)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedKeywords(trendyKeywords)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() => setSelectedKeywords([])}
                    className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendyKeywords.map((keyword) => {
                  const selected = selectedKeywords.includes(keyword);
                  return (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordToggle(keyword)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold transition ${
                        selected
                          ? "border-purple-500 bg-purple-100 text-purple-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {keyword}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {generatedArticles.length > 0 && (
            <div className="border-t border-gray-200 pt-5">
              <div className="flex flex-col gap-1 mb-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  Generated articles ({generatedArticles.length})
                </h3>
                <p className="text-sm text-gray-600">
                  Batch price at current rate: ${estimatedGeneratedCost}
                </p>
              </div>
              <div className="space-y-4">
                {generatedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={article.title}
                          onChange={(e) =>
                            setGeneratedArticles((prev) =>
                              prev.map((item) =>
                                item.id === article.id
                                  ? { ...item, title: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Keyword
                        </label>
                        <input
                          type="text"
                          value={article.keyword}
                          onChange={(e) =>
                            setGeneratedArticles((prev) =>
                              prev.map((item) =>
                                item.id === article.id
                                  ? { ...item, keyword: e.target.value }
                                  : item
                              )
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Content
                    </label>
                    <textarea
                      value={article.content}
                      onChange={(e) =>
                        setGeneratedArticles((prev) =>
                          prev.map((item) =>
                            item.id === article.id
                              ? { ...item, content: e.target.value }
                              : item
                          )
                        )
                      }
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Selection Panel */}
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select AI Models
            </h2>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {showModelSelector ? "Hide" : "Configure"} →
            </button>
          </div>

          {/* Selected models summary */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedModels.length === 0 ? (
              <span className="text-sm text-gray-500">
                No models selected. Click Configure to select models.
              </span>
            ) : (
              selectedModels.map((modelId) => {
                const model = availableModels.find((m) => m.id === modelId);
                return (
                  <span
                    key={modelId}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium"
                  >
                    {model?.logo && (
                      <img
                        src={model.logo}
                        alt=""
                        className="w-4 h-4 rounded-full object-contain"
                      />
                    )}
                    {model?.name || modelId}
                  </span>
                );
              })
            )}
          </div>

          {/* Model selector dropdown */}
          {showModelSelector && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Select which AI models to use for analysis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableModels.map((model) => (
                  <label
                    key={model.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedModels.includes(model.id)
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={() => handleModelToggle(model.id)}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                    />
                    {model.logo && (
                      <img
                        src={model.logo}
                        alt=""
                        className="w-6 h-6 rounded-full object-contain"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {model.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Run Analysis Button */}
        {!hasResults && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Run Your First Analysis
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your {queries.length} queries across{" "}
              {selectedModels.length} selected AI model
              {selectedModels.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || selectedModels.length === 0}
              className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAnalyzing
                ? "Analyzing..."
                : selectedModels.length === 0
                  ? "Select Models First"
                  : "▶ Run Analysis"}
            </button>

            {analysisProgress && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>
                    Query {analysisProgress.current} of {analysisProgress.total}
                  </span>
                  <span>
                    {Math.round(
                      (analysisProgress.current / analysisProgress.total) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(analysisProgress.current / analysisProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
                {analysisProgress.currentQuestion && (
                  <p className="mt-2 text-xs text-gray-500 truncate">
                    {analysisProgress.currentQuestion}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {hasResults && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Visibility Score
                </p>
                <p className="mt-2 text-4xl font-semibold text-purple-600">
                  {analytics?.visibilityScore || 0}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Out of {analytics?.totalResults || 0} responses analyzed
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Mention Rate
                </p>
                <p className="mt-2 text-4xl font-semibold text-gray-900">
                  {analytics?.brandMentionRate || 0}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {analytics?.totalQueries || 0} queries tracked
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Competitors Tracked
                </p>
                <p className="mt-2 text-4xl font-semibold text-gray-900">
                  {competitors.length}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Active benchmarking
                </p>
              </div>
            </div>

            {/* Query Type Filter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Query Categories
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowGenerateQuestions(!showGenerateQuestions);
                      setShowAddQuestion(false);
                      setGenerateQuestionsError("");
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 transition"
                  >
                    Generate with AI
                  </button>
                  <button
                    onClick={() => {
                      setShowAddQuestion(!showAddQuestion);
                      setShowGenerateQuestions(false);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition"
                  >
                    <span className="text-lg leading-none">+</span> Add Question
                  </button>
                </div>
              </div>

              {/* Add Question Form */}
              {showAddQuestion && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Add New Question
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Question Text
                      </label>
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder="e.g., What is the best CRM software for small businesses?"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Question Type
                      </label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => setNewQuestionType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="branded">
                          Branded - Direct brand mention queries
                        </option>
                        <option value="category">
                          Category - General industry queries
                        </option>
                        <option value="comparative">
                          Comparative - Comparison queries
                        </option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddQuestion}
                        disabled={!newQuestionText.trim()}
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        Add Question
                      </button>
                      <button
                        onClick={() => {
                          setShowAddQuestion(false);
                          setNewQuestionText("");
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Questions Form */}
              {showGenerateQuestions && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Generate Questions with AI
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Uses your brand context to create agnostic questions.
                    Generated questions are saved as category queries.
                  </p>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        Context: {brandActivities}
                      </p>
                    </div>
                    <div className="w-full md:w-40">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Number of questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={questionGenCount}
                        onChange={(e) => setQuestionGenCount(e.target.value)}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      />
                    </div>
                  </div>
                  {generateQuestionsError && (
                    <p className="mt-3 text-sm text-red-600">
                      {generateQuestionsError}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={isGeneratingQuestions}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {isGeneratingQuestions
                        ? "Generating..."
                        : "Generate Questions"}
                    </button>
                    <button
                      onClick={() => setShowGenerateQuestions(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedQueryType("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedQueryType === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Queries ({queries.length})
                </button>
                <button
                  onClick={() => setSelectedQueryType("branded")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedQueryType === "branded"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Branded ({queries.filter((q) => q.type === "branded").length})
                </button>
                <button
                  onClick={() => setSelectedQueryType("category")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedQueryType === "category"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Category (
                  {queries.filter((q) => q.type === "category").length})
                </button>
                <button
                  onClick={() => setSelectedQueryType("comparative")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedQueryType === "comparative"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Comparative (
                  {queries.filter((q) => q.type === "comparative").length})
                </button>
              </div>

              {/* Filtered Queries List */}
              <div className="mt-6 space-y-3">
                {queries
                  .filter(
                    (q) =>
                      selectedQueryType === "all" ||
                      q.type === selectedQueryType
                  )
                  .map((query, idx) => (
                    <div
                      key={query.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                query.type === "branded"
                                  ? "bg-blue-100 text-blue-700"
                                  : query.type === "category"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {query.type === "branded"
                                ? "Branded"
                                : query.type === "category"
                                  ? "Category"
                                  : "Comparative"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{query.text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(query.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete question"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Competitor Comparison */}
            {analytics && analytics.competitorComparison && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Competitor Comparison
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {currentBrand.name}
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {analytics.brandMentionRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{ width: `${analytics.brandMentionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {Object.entries(analytics.competitorComparison).map(
                    ([comp, count]) => {
                      const percentage = Math.round(
                        (count / analytics.totalResults) * 100
                      );
                      return (
                        <div key={comp}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {comp}
                            </span>
                            <span className="text-sm font-semibold text-gray-600">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gray-400 h-3 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Response History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Response History
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResponseFilter("all")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      responseFilter === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setResponseFilter("mentioned")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      responseFilter === "mentioned"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Brand Mentioned
                  </button>
                  <button
                    onClick={() => setResponseFilter("not-mentioned")}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      responseFilter === "not-mentioned"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Not Mentioned
                  </button>
                </div>
              </div>

              {/* Run Selector */}
              {analysisRuns.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Select Analysis Run
                      </label>
                      <select
                        value={selectedRunId || ""}
                        onChange={(e) => setSelectedRunId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {analysisRuns.map((run, index) => (
                          <option key={run.id} value={run.id}>
                            Run #{analysisRuns.length - index} -{" "}
                            {new Date(run.startedAt).toLocaleString()}(
                            {run.enginesUsed?.length || 0} models,{" "}
                            {run.queryCount || 0} queries)
                          </option>
                        ))}
                      </select>
                    </div>

                    {analysisRuns.length > 1 && (
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Compare With (optional)
                        </label>
                        <select
                          value={compareRunId || ""}
                          onChange={(e) =>
                            setCompareRunId(e.target.value || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">-- No comparison --</option>
                          {analysisRuns
                            .filter((run) => run.id !== selectedRunId)
                            .map((run, index) => (
                              <option key={run.id} value={run.id}>
                                Run #
                                {analysisRuns.length -
                                  analysisRuns.indexOf(run)}{" "}
                                - {new Date(run.startedAt).toLocaleString()}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Run Stats */}
                  {selectedRunId && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {(() => {
                        const selectedRun = analysisRuns.find(
                          (r) => r.id === selectedRunId
                        );
                        const selectedResults = results.filter(
                          (r) => r.runId === selectedRunId
                        );
                        const brandMentioned = selectedResults.filter(
                          (r) => r.isBrandMentioned
                        ).length;
                        const mentionRate =
                          selectedResults.length > 0
                            ? Math.round(
                                (brandMentioned / selectedResults.length) * 100
                              )
                            : 0;

                        return (
                          <>
                            <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500">Results</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {selectedResults.length}
                              </p>
                            </div>
                            <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500">
                                Brand Mention Rate
                              </p>
                              <p className="text-lg font-semibold text-purple-600">
                                {mentionRate}%
                              </p>
                            </div>
                            {compareRunId &&
                              (() => {
                                const compareResults = results.filter(
                                  (r) => r.runId === compareRunId
                                );
                                const compareBrandMentioned =
                                  compareResults.filter(
                                    (r) => r.isBrandMentioned
                                  ).length;
                                const compareMentionRate =
                                  compareResults.length > 0
                                    ? Math.round(
                                        (compareBrandMentioned /
                                          compareResults.length) *
                                          100
                                      )
                                    : 0;
                                const diff = mentionRate - compareMentionRate;

                                return (
                                  <div className="px-3 py-2 bg-white rounded-lg border border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      Change vs Previous
                                    </p>
                                    <p
                                      className={`text-lg font-semibold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-600"}`}
                                    >
                                      {diff > 0 ? "+" : ""}
                                      {diff}%
                                    </p>
                                  </div>
                                );
                              })()}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500 mb-4">
                Click on a response to expand and see the full AI answer.
                <span className="inline-block ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  Your brand
                </span>
                <span className="inline-block ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                  Competitors
                </span>
                {compareRunId && (
                  <span className="inline-block ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Comparison run
                  </span>
                )}
              </p>

              <div className="space-y-4">
                {queries.map((query) => {
                  // Get results for selected run
                  const queryResults = results.filter(
                    (r) =>
                      r.queryId === query.id &&
                      (selectedRunId ? r.runId === selectedRunId : true)
                  );

                  // Get results for comparison run if selected
                  const compareQueryResults = compareRunId
                    ? results.filter(
                        (r) =>
                          r.queryId === query.id && r.runId === compareRunId
                      )
                    : [];

                  // Filter based on selection
                  const filteredResults = queryResults.filter((r) => {
                    if (responseFilter === "mentioned")
                      return r.isBrandMentioned;
                    if (responseFilter === "not-mentioned")
                      return !r.isBrandMentioned;
                    return true;
                  });

                  if (
                    filteredResults.length === 0 &&
                    compareQueryResults.length === 0
                  )
                    return null;

                  return (
                    <div
                      key={query.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Query Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              query.type === "branded"
                                ? "bg-blue-100 text-blue-700"
                                : query.type === "category"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {query.type}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {query.text}
                          </span>
                        </div>
                      </div>

                      {/* Responses */}
                      <div className="divide-y divide-gray-100">
                        {filteredResults.map((result) => {
                          const isExpanded = expandedResponses[result.id];
                          const modelInfo = availableModels.find(
                            (m) => m.id === result.engine
                          );

                          // Find comparison result for same model
                          const compareResult = compareQueryResults.find(
                            (r) => r.engine === result.engine
                          );

                          // Function to highlight mentions in text
                          const highlightMentions = (text) => {
                            if (!text) return "";
                            let highlighted = text;

                            // Highlight brand (case-insensitive)
                            const brandRegex = new RegExp(
                              `(${currentBrand.name})`,
                              "gi"
                            );
                            highlighted = highlighted.replace(
                              brandRegex,
                              '<mark class="bg-purple-200 text-purple-900 px-1 rounded">$1</mark>'
                            );

                            // Highlight competitors
                            competitors.forEach((comp) => {
                              const compRegex = new RegExp(
                                `(${comp.name})`,
                                "gi"
                              );
                              highlighted = highlighted.replace(
                                compRegex,
                                '<mark class="bg-orange-200 text-orange-900 px-1 rounded">$1</mark>'
                              );
                            });

                            return highlighted;
                          };

                          return (
                            <div key={result.id} className="bg-white">
                              {/* Result Header - Clickable */}
                              <button
                                onClick={() =>
                                  setExpandedResponses((prev) => ({
                                    ...prev,
                                    [result.id]: !prev[result.id],
                                  }))
                                }
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                              >
                                <div className="flex items-center gap-3">
                                  {modelInfo?.logo && (
                                    <img
                                      src={modelInfo.logo}
                                      alt=""
                                      className="w-5 h-5 rounded-full object-contain"
                                    />
                                  )}
                                  <span className="text-sm font-medium text-gray-700">
                                    {modelInfo?.name || result.engine}
                                  </span>

                                  {/* Status badges */}
                                  <div className="flex items-center gap-2">
                                    {result.isBrandMentioned ? (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        ✓ Brand mentioned
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                        ✗ Not mentioned
                                      </span>
                                    )}

                                    {result.mentionedCompetitors &&
                                      result.mentionedCompetitors.length >
                                        0 && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                          {result.mentionedCompetitors.length}{" "}
                                          competitor
                                          {result.mentionedCompetitors.length >
                                          1
                                            ? "s"
                                            : ""}
                                        </span>
                                      )}

                                    {/* Comparison indicator */}
                                    {compareResult && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                          result.isBrandMentioned &&
                                          !compareResult.isBrandMentioned
                                            ? "bg-green-100 text-green-700"
                                            : !result.isBrandMentioned &&
                                                compareResult.isBrandMentioned
                                              ? "bg-red-100 text-red-700"
                                              : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {result.isBrandMentioned &&
                                        !compareResult.isBrandMentioned
                                          ? "↑ Improved"
                                          : !result.isBrandMentioned &&
                                              compareResult.isBrandMentioned
                                            ? "↓ Declined"
                                            : "= Same"}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>

                              {/* Expanded Response */}
                              {isExpanded && (
                                <div className="px-4 pb-4">
                                  {/* Mentioned entities */}
                                  {result.mentionedCompetitors &&
                                    result.mentionedCompetitors.length > 0 && (
                                      <div className="mb-3 p-3 bg-orange-50 rounded-lg">
                                        <p className="text-xs font-semibold text-orange-800 mb-1">
                                          Competitors mentioned:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {result.mentionedCompetitors.map(
                                            (comp) => (
                                              <span
                                                key={comp}
                                                className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs font-medium"
                                              >
                                                {comp}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Full response */}
                                  <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                      Current Run Response:
                                    </p>
                                    <div
                                      className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: highlightMentions(
                                          result.response
                                        ),
                                      }}
                                    />
                                  </div>

                                  {/* Comparison response if available */}
                                  {compareResult && (
                                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                                        Comparison Run Response (
                                        {new Date(
                                          compareResult.timestamp
                                        ).toLocaleDateString()}
                                        ):
                                      </p>
                                      <div className="flex items-center gap-2 mb-2">
                                        {compareResult.isBrandMentioned ? (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            ✓ Brand was mentioned
                                          </span>
                                        ) : (
                                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            ✗ Brand was not mentioned
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                          __html: highlightMentions(
                                            compareResult.response
                                          ),
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Metadata */}
                                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                    <span>
                                      Analyzed:{" "}
                                      {new Date(
                                        result.timestamp
                                      ).toLocaleString()}
                                    </span>
                                    {result.sentimentScore !== undefined && (
                                      <span>
                                        Sentiment:{" "}
                                        {result.sentimentScore > 0
                                          ? "😊 Positive"
                                          : result.sentimentScore < 0
                                            ? "😟 Negative"
                                            : "😐 Neutral"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {results.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      No analysis results yet. Run an analysis to see responses.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h2>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || selectedModels.length === 0}
                  className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAnalyzing
                    ? "Analyzing..."
                    : selectedModels.length === 0
                      ? "Select Models First"
                      : "🔄 Run New Analysis"}
                </button>
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="rounded-full border-2 border-purple-600 px-6 py-3 text-sm font-semibold text-purple-600 transition hover:bg-purple-50"
                >
                  + Add Questions
                </button>
              </div>

              {selectedModels.length > 0 && (
                <p className="mt-3 text-sm text-gray-500">
                  Will run analysis using {selectedModels.length} model
                  {selectedModels.length !== 1 ? "s" : ""} on {queries.length}{" "}
                  question{queries.length !== 1 ? "s" : ""}
                </p>
              )}

              {analysisProgress && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>
                      Query {analysisProgress.current} of{" "}
                      {analysisProgress.total}
                    </span>
                    <span>
                      {Math.round(
                        (analysisProgress.current / analysisProgress.total) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(analysisProgress.current / analysisProgress.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                  {analysisProgress.currentQuestion && (
                    <p className="mt-2 text-xs text-gray-500 truncate">
                      {analysisProgress.currentQuestion}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
