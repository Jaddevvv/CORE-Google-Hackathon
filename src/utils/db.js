// Simple localStorage-based database for MVP
// In production, this would be replaced with a real backend API

const DB_KEY = "core_app_db";

// Initialize database structure
function initDB() {
  const db = localStorage.getItem(DB_KEY);
  if (!db) {
    const initialDB = {
      users: [],
      workspaces: [],
      brands: [],
      competitors: [],
      projects: [],
      queries: [],
      results: [],
      project_settings: [],
      analysis_runs: [],
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
    return initialDB;
  }
  return JSON.parse(db);
}

// Get the entire database
export function getDB() {
  return initDB();
}

// Save the entire database
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Generate a simple ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// USERS
export function createUser(email, password, firstName, lastName, company) {
  const db = getDB();

  // Check if user exists
  const existingUser = db.users.find((u) => u.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = {
    id: generateId(),
    email,
    password, // In production, this would be hashed
    firstName,
    lastName,
    company,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDB(db);

  return user;
}

export function authenticateUser(email, password) {
  const db = getDB();
  const user = db.users.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Store current session
  localStorage.setItem("core_current_user", JSON.stringify(user));

  return user;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("core_current_user");
  return userStr ? JSON.parse(userStr) : null;
}

export function logoutUser() {
  localStorage.removeItem("core_current_user");
}

// WORKSPACES
export function createWorkspace(
  userId,
  defaultCountry = "France",
  defaultLanguage = "Français",
  plan = "Starter"
) {
  const db = getDB();

  const workspace = {
    id: generateId(),
    userId,
    plan,
    defaultCountry,
    defaultLanguage,
    createdAt: new Date().toISOString(),
  };

  db.workspaces.push(workspace);
  saveDB(db);

  return workspace;
}

export function getWorkspaceByUserId(userId) {
  const db = getDB();
  return db.workspaces.find((w) => w.userId === userId);
}

// BRANDS
export function createBrand(
  workspaceId,
  name,
  website,
  sector,
  country,
  language
) {
  const db = getDB();

  const brand = {
    id: generateId(),
    workspaceId,
    name,
    website,
    sector,
    country,
    language,
    createdAt: new Date().toISOString(),
  };

  db.brands.push(brand);
  saveDB(db);

  return brand;
}

export function getBrandsByWorkspaceId(workspaceId) {
  const db = getDB();
  return db.brands.filter((b) => b.workspaceId === workspaceId);
}

export function getBrandById(brandId) {
  const db = getDB();
  return db.brands.find((b) => b.id === brandId);
}

// COMPETITORS
export function createCompetitor(brandId, name, url) {
  const db = getDB();

  const competitor = {
    id: generateId(),
    brandId,
    name,
    url,
    createdAt: new Date().toISOString(),
  };

  db.competitors.push(competitor);
  saveDB(db);

  return competitor;
}

export function getCompetitorsByBrandId(brandId) {
  const db = getDB();
  return db.competitors.filter((c) => c.brandId === brandId);
}

// PROJECTS
export function createProject(brandId, name, targetCountry, targetAudience) {
  const db = getDB();

  const project = {
    id: generateId(),
    brandId,
    name,
    targetCountry,
    targetAudience,
    createdAt: new Date().toISOString(),
  };

  db.projects.push(project);
  saveDB(db);

  return project;
}

export function getProjectsByBrandId(brandId) {
  const db = getDB();
  return db.projects.filter((p) => p.brandId === brandId);
}

export function getProjectById(projectId) {
  const db = getDB();
  return db.projects.find((p) => p.id === projectId);
}

// QUERIES
export function createQuery(projectId, text, type, language) {
  const db = getDB();

  const query = {
    id: generateId(),
    projectId,
    text,
    type, // 'branded', 'category', 'comparative'
    language,
    createdAt: new Date().toISOString(),
  };

  db.queries.push(query);
  saveDB(db);

  return query;
}

export function getQueriesByProjectId(projectId) {
  const db = getDB();
  return db.queries.filter((q) => q.projectId === projectId);
}

// PROJECT SETTINGS
export function createProjectSettings(
  projectId,
  enginesEnabled,
  frequency,
  maxQueriesPerRun
) {
  const db = getDB();

  const settings = {
    id: generateId(),
    projectId,
    enginesEnabled, // array of engine IDs
    frequency, // 'daily', 'twice_weekly', 'weekly'
    maxQueriesPerRun,
    createdAt: new Date().toISOString(),
  };

  db.project_settings.push(settings);
  saveDB(db);

  return settings;
}

export function getProjectSettings(projectId) {
  const db = getDB();
  return db.project_settings.find((s) => s.projectId === projectId);
}

export function updateProjectSettings(projectId, updates) {
  const db = getDB();
  const settingsIndex = db.project_settings.findIndex(
    (s) => s.projectId === projectId
  );

  if (settingsIndex === -1) {
    throw new Error("Project settings not found");
  }

  db.project_settings[settingsIndex] = {
    ...db.project_settings[settingsIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveDB(db);
  return db.project_settings[settingsIndex];
}

export function deleteQuery(queryId) {
  const db = getDB();

  // Remove associated results first
  db.results = db.results.filter((r) => r.queryId !== queryId);

  // Remove the query
  db.queries = db.queries.filter((q) => q.id !== queryId);

  saveDB(db);
}

// ANALYSIS RUNS
export function createAnalysisRun(projectId, enginesUsed, queryCount) {
  const db = getDB();

  // Ensure analysis_runs array exists (for existing databases)
  if (!db.analysis_runs) {
    db.analysis_runs = [];
  }

  const run = {
    id: generateId(),
    projectId,
    enginesUsed,
    queryCount,
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  db.analysis_runs.push(run);
  saveDB(db);

  return run;
}

export function completeAnalysisRun(runId, resultsCount) {
  const db = getDB();

  if (!db.analysis_runs) {
    db.analysis_runs = [];
    return null;
  }

  const runIndex = db.analysis_runs.findIndex((r) => r.id === runId);
  if (runIndex === -1) return null;

  db.analysis_runs[runIndex] = {
    ...db.analysis_runs[runIndex],
    status: "completed",
    resultsCount,
    completedAt: new Date().toISOString(),
  };

  saveDB(db);
  return db.analysis_runs[runIndex];
}

export function getAnalysisRunsByProjectId(projectId) {
  const db = getDB();
  if (!db.analysis_runs) return [];
  return db.analysis_runs
    .filter((r) => r.projectId === projectId)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
}

export function getAnalysisRunById(runId) {
  const db = getDB();
  if (!db.analysis_runs) return null;
  return db.analysis_runs.find((r) => r.id === runId);
}

// RESULTS
export function createResult(
  queryId,
  engine,
  response,
  analysis,
  runId = null
) {
  const db = getDB();

  const result = {
    id: generateId(),
    queryId,
    engine,
    response,
    runId,
    isBrandMentioned: analysis.isBrandMentioned,
    mentionedCompetitors: analysis.mentionedCompetitors,
    sentimentScore: analysis.sentimentScore,
    rank: analysis.rank,
    timestamp: new Date().toISOString(),
  };

  db.results.push(result);
  saveDB(db);

  return result;
}

export function getResultsByRunId(runId) {
  const db = getDB();
  return db.results.filter((r) => r.runId === runId);
}

export function getResultsByProjectId(projectId) {
  const db = getDB();
  const queries = getQueriesByProjectId(projectId);
  const queryIds = queries.map((q) => q.id);
  return db.results.filter((r) => queryIds.includes(r.queryId));
}

export function getResultsByQueryId(queryId) {
  const db = getDB();
  return db.results.filter((r) => r.queryId === queryId);
}

// ANALYTICS HELPERS
export function getProjectAnalytics(projectId) {
  const queries = getQueriesByProjectId(projectId);
  const results = getResultsByProjectId(projectId);

  if (results.length === 0) {
    return {
      totalQueries: queries.length,
      totalResults: 0,
      visibilityScore: 0,
      brandMentionRate: 0,
      competitorComparison: {},
    };
  }

  const brandMentions = results.filter((r) => r.isBrandMentioned).length;
  const visibilityScore = Math.round((brandMentions / results.length) * 100);

  // Count competitor mentions
  const competitorMentions = {};
  results.forEach((result) => {
    if (result.mentionedCompetitors) {
      result.mentionedCompetitors.forEach((comp) => {
        competitorMentions[comp] = (competitorMentions[comp] || 0) + 1;
      });
    }
  });

  return {
    totalQueries: queries.length,
    totalResults: results.length,
    visibilityScore,
    brandMentionRate: Math.round((brandMentions / results.length) * 100),
    competitorComparison: competitorMentions,
  };
}
