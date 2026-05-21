const DAY_MS = 24 * 60 * 60 * 1000;
const STORAGE_KEY = "cpa-dec-2026-study-tracker";
const INITIAL_START_DATE = "2026-05-21";
const API_BASE = window.CPA_PUBLIC_STATIC ? null : ["http:", "https:"].includes(location.protocol) ? "" : null;
const BACKEND_SAVE_DELAY = 500;
const CURRENT_STATE_VERSION = 3;
const SCHEDULE_WINDOW_DAYS = 28;
const SCHEDULE_PACE_MIN = 0.75;
const SCHEDULE_PACE_MAX = 1.75;
const SCHEDULE_PACE_STEP = 0.25;

const SUBJECTS = [
  {
    id: "financial",
    name: "財務会計論",
    short: "財務",
    jp: "財務会計論",
    targetHours: 250,
    scoreGoal: 75,
    color: "#12615b",
    topics: [
      "表示・開示",
      "現金預金・債権・棚卸資産・固定資産",
      "収益認識・リース",
      "金融商品・減損",
      "企業結合・連結会計",
      "キャッシュ・フロー・純資産",
      "会計理論・概念フレームワーク",
      "短答計算スピード",
    ],
  },
  {
    id: "management",
    name: "管理会計論",
    short: "管理",
    jp: "管理会計論",
    targetHours: 150,
    scoreGoal: 72,
    color: "#3f6f9f",
    topics: [
      "原価計算基準",
      "個別原価計算・総合原価計算",
      "標準原価計算・差異分析",
      "CVP・意思決定",
      "予算管理・責任会計",
      "業績評価",
      "理論短答",
    ],
  },
  {
    id: "corporate-law",
    name: "企業法",
    short: "企業法",
    jp: "企業法",
    targetHours: 120,
    scoreGoal: 73,
    color: "#946337",
    topics: [
      "設立・株式",
      "株主総会",
      "取締役・機関設計",
      "計算・開示",
      "組織再編",
      "金融商品取引法",
      "条文暗記・事例適用",
    ],
  },
  {
    id: "audit",
    name: "監査論",
    short: "監査",
    jp: "監査論",
    targetHours: 110,
    scoreGoal: 73,
    color: "#7a4e80",
    topics: [
      "監査目的・基準",
      "リスク評価",
      "内部統制・監査証拠",
      "監査手続・サンプリング",
      "監査報告",
      "不正・継続企業・倫理",
      "短答理論暗記",
    ],
  },
  {
    id: "business-admin",
    name: "経営学",
    short: "経営",
    jp: "経営学",
    targetHours: 85,
    scoreGoal: 70,
    color: "#5e7443",
    topics: [
      "ファイナンス基礎",
      "投資意思決定・企業価値評価",
      "ポートフォリオ・資本コスト",
      "経営戦略",
      "組織設計",
      "マーケティング・オペレーション",
      "論文式応用",
    ],
  },
  {
    id: "final-review",
    name: "総復習",
    short: "復習",
    jp: "答練・総復習",
    targetHours: 95,
    scoreGoal: 78,
    color: "#a13d36",
    topics: [
      "弱点ノート整理",
      "時間制限つき総合演習",
      "要点整理の周回",
      "公式・条文暗記",
      "模試シミュレーション",
      "直前期の調整",
    ],
  },
];

const MODES = [
  "テキスト",
  "理論",
  "問題演習",
  "短答対策",
  "過去問",
  "復習",
  "模試",
  "弱点ノート",
];

const RESOURCE_TYPES = [
  "Textbook",
  "Quiz bank",
  "Compact summary",
  "Past paper",
  "Drill",
  "Admin",
  "Custom",
];

const RESOURCE_TYPE_LABELS = {
  Textbook: "テキスト",
  "Quiz bank": "問題集",
  "Compact summary": "要点整理",
  "Past paper": "過去問",
  Drill: "答練",
  Admin: "事務",
  Custom: "追加",
};

const STATUS_LABELS = {
  planned: "未着手",
  active: "進行中",
  review: "復習",
  done: "完了",
};

const TOPIC_STATUS_LABELS = {
  new: "未着手",
  learning: "学習中",
  review: "復習",
  ready: "完成",
};

const FINANCIAL_UNIT_STATUS_LABELS = {
  new: "未着手",
  learning: "学習中",
  review: "復習",
  done: "完了",
};

const QUESTION_KIND_LABELS = {
  "text-example": "テキスト例題",
  "individual-calculation": "個別計算",
  "short-answer": "短答対策",
};

const QUESTION_STATUS_LABELS = {
  new: "未着手",
  learning: "学習中",
  review: "復習",
  mastered: "定着",
};

const PHASES = [
  {
    name: "教材整理・基礎診断",
    start: "2026-05-21",
    end: "2026-06-15",
    detail: "教材を棚卸しし、基礎力と弱点章を確認する。",
  },
  {
    name: "テキスト1周目",
    start: "2026-06-16",
    end: "2026-08-09",
    detail: "テキストと例題を一通り終える。",
  },
  {
    name: "問題集周回",
    start: "2026-08-10",
    end: "2026-10-04",
    detail: "論点別演習から混合演習へ移行する。",
  },
  {
    name: "過去問・時間対応",
    start: "2026-10-05",
    end: "2026-11-15",
    detail: "時間を測って過去問を解き、間違いを再演習する。",
  },
  {
    name: "模試・直前総復習",
    start: "2026-11-16",
    end: "2026-11-30",
    detail: "模試、要点整理、弱点ノートの仕上げを行う。",
  },
  {
    name: "12月試験期間",
    start: "2026-12-01",
    end: "2026-12-31",
    detail: "睡眠と軽い暗記確認を優先し、本番に合わせる。",
  },
];

function buildResources() {
  return [];
}

const GENERATED_RESOURCES = Array.isArray(window.CPA_MATERIALS) ? window.CPA_MATERIALS : [];
const BASE_RESOURCES = GENERATED_RESOURCES.length ? GENERATED_RESOURCES : buildResources();
const FINANCIAL_UNITS = Array.isArray(window.CPA_FINANCIAL_UNITS) ? window.CPA_FINANCIAL_UNITS : [];
const QUESTION_BANK = Array.isArray(window.CPA_QUESTIONS) ? window.CPA_QUESTIONS : [];
const BASE_TOPICS = SUBJECTS.flatMap((subject) =>
  subject.topics.map((topic, index) => ({
    id: slug(`${subject.id}-${index}-${topic}`),
    subject: subject.id,
    title: topic,
  })),
);

let stateNeedsInitialSave = false;
let state = loadState();
let backendAvailable = false;
let backendSaveTimer = null;
let backendSaveInFlight = false;

const els = {
  examDateInput: document.getElementById("examDateInput"),
  weeklyTargetInput: document.getElementById("weeklyTargetInput"),
  exportBtn: document.getElementById("exportBtn"),
  importBtn: document.getElementById("importBtn"),
  importFile: document.getElementById("importFile"),
  resetBtn: document.getElementById("resetBtn"),
  backendStatus: document.getElementById("backendStatus"),
  metricGrid: document.getElementById("metricGrid"),
  phaseSummary: document.getElementById("phaseSummary"),
  phaseRail: document.getElementById("phaseRail"),
  runwayLabel: document.getElementById("runwayLabel"),
  focusQueue: document.getElementById("focusQueue"),
  subjectCoverage: document.getElementById("subjectCoverage"),
  weeklyAllocation: document.getElementById("weeklyAllocation"),
  weeklyAllocationLabel: document.getElementById("weeklyAllocationLabel"),
  todayCommand: document.getElementById("todayCommand"),
  financialSummary: document.getElementById("financialSummary"),
  financialMetricGrid: document.getElementById("financialMetricGrid"),
  financialCommand: document.getElementById("financialCommand"),
  financialSearch: document.getElementById("financialSearch"),
  financialStreamFilter: document.getElementById("financialStreamFilter"),
  financialVolumeFilter: document.getElementById("financialVolumeFilter"),
  financialPriorityFilter: document.getElementById("financialPriorityFilter"),
  financialStatusFilter: document.getElementById("financialStatusFilter"),
  financialQuickFilters: document.getElementById("financialQuickFilters"),
  financialUnitCount: document.getElementById("financialUnitCount"),
  financialUnitList: document.getElementById("financialUnitList"),
  questionSummary: document.getElementById("questionSummary"),
  questionMetricGrid: document.getElementById("questionMetricGrid"),
  questionCommand: document.getElementById("questionCommand"),
  questionSearch: document.getElementById("questionSearch"),
  questionSourceFilter: document.getElementById("questionSourceFilter"),
  questionRankFilter: document.getElementById("questionRankFilter"),
  questionStatusFilter: document.getElementById("questionStatusFilter"),
  questionDueFilter: document.getElementById("questionDueFilter"),
  questionQuickFilters: document.getElementById("questionQuickFilters"),
  questionCountLabel: document.getElementById("questionCountLabel"),
  questionList: document.getElementById("questionList"),
  sessionForm: document.getElementById("sessionForm"),
  sessionDate: document.getElementById("sessionDate"),
  sessionSubject: document.getElementById("sessionSubject"),
  sessionMode: document.getElementById("sessionMode"),
  sessionMinutes: document.getElementById("sessionMinutes"),
  sessionResource: document.getElementById("sessionResource"),
  sessionScore: document.getElementById("sessionScore"),
  sessionQuestions: document.getElementById("sessionQuestions"),
  sessionConfidence: document.getElementById("sessionConfidence"),
  sessionNotes: document.getElementById("sessionNotes"),
  sessionFormHint: document.getElementById("sessionFormHint"),
  scheduleStartDate: document.getElementById("scheduleStartDate"),
  schedulePace: document.getElementById("schedulePace"),
  scheduleResetBtn: document.getElementById("scheduleResetBtn"),
  scheduleMetricGrid: document.getElementById("scheduleMetricGrid"),
  scheduleCalendar: document.getElementById("scheduleCalendar"),
  weeklyPlan: document.getElementById("weeklyPlan"),
  weeklyPlanLabel: document.getElementById("weeklyPlanLabel"),
  reviewQueue: document.getElementById("reviewQueue"),
  sessionTable: document.getElementById("sessionTable"),
  clearLogFilter: document.getElementById("clearLogFilter"),
  resourceSearch: document.getElementById("resourceSearch"),
  resourceSubjectFilter: document.getElementById("resourceSubjectFilter"),
  resourceTypeFilter: document.getElementById("resourceTypeFilter"),
  resourceStatusFilter: document.getElementById("resourceStatusFilter"),
  materialSummary: document.getElementById("materialSummary"),
  resourceCountLabel: document.getElementById("resourceCountLabel"),
  resourceList: document.getElementById("resourceList"),
  resourceForm: document.getElementById("resourceForm"),
  resourceTitle: document.getElementById("resourceTitle"),
  resourceSubject: document.getElementById("resourceSubject"),
  resourceType: document.getElementById("resourceType"),
  resourcePath: document.getElementById("resourcePath"),
  paperForm: document.getElementById("paperForm"),
  paperDate: document.getElementById("paperDate"),
  paperSelect: document.getElementById("paperSelect"),
  paperScore: document.getElementById("paperScore"),
  paperMinutes: document.getElementById("paperMinutes"),
  paperNotes: document.getElementById("paperNotes"),
  paperReadiness: document.getElementById("paperReadiness"),
  paperLibraryCount: document.getElementById("paperLibraryCount"),
  paperLibrary: document.getElementById("paperLibrary"),
  modeMix: document.getElementById("modeMix"),
  scoreTrend: document.getElementById("scoreTrend"),
  studyHeatmap: document.getElementById("studyHeatmap"),
  riskRegister: document.getElementById("riskRegister"),
  topicSubjectFilter: document.getElementById("topicSubjectFilter"),
  topicStatusFilter: document.getElementById("topicStatusFilter"),
  topicCountLabel: document.getElementById("topicCountLabel"),
  topicBoard: document.getElementById("topicBoard"),
  toast: document.getElementById("toast"),
};

initialize();

function initialize() {
  populateStaticControls();
  attachEvents();
  setInitialFormValues();
  render();
  if (stateNeedsInitialSave) {
    save({ touch: false });
    stateNeedsInitialSave = false;
  }
  connectBackend();
}

function populateStaticControls() {
  const subjectOptions = SUBJECTS.map((subject) => `<option value="${subject.id}">${escapeHtml(subject.name)}</option>`).join("");
  const allSubjectOptions = `<option value="all">すべての科目</option>${subjectOptions}`;
  els.sessionSubject.innerHTML = subjectOptions;
  els.resourceSubject.innerHTML = subjectOptions;
  els.resourceSubjectFilter.innerHTML = allSubjectOptions;
  els.topicSubjectFilter.innerHTML = allSubjectOptions;
  els.sessionMode.innerHTML = MODES.map((mode) => `<option value="${mode}">${escapeHtml(mode)}</option>`).join("");
  els.resourceType.innerHTML = RESOURCE_TYPES.map((type) => `<option value="${type}">${escapeHtml(resourceTypeLabel(type))}</option>`).join("");
  els.resourceTypeFilter.innerHTML = `<option value="all">すべての種別</option>${RESOURCE_TYPES.map(
    (type) => `<option value="${type}">${escapeHtml(resourceTypeLabel(type))}</option>`,
  ).join("")}`;
  els.paperSelect.innerHTML = paperResources()
    .map((resource) => `<option value="${resource.id}">${escapeHtml(paperOptionLabel(resource))}</option>`)
    .join("");
  const financialVolumes = [...new Set(FINANCIAL_UNITS.map((unit) => unit.volume))];
  els.financialStreamFilter.innerHTML = `
    <option value="all">すべての区分</option>
    <option value="calculation">計算</option>
    <option value="theory">理論</option>
  `;
  els.financialVolumeFilter.innerHTML = `<option value="all">すべての巻</option>${financialVolumes
    .map((volume) => `<option value="${escapeHtml(volume)}">${escapeHtml(volume)}</option>`)
    .join("")}`;
  els.financialPriorityFilter.innerHTML = `
    <option value="all">すべての優先度</option>
    <option value="A">A優先</option>
    <option value="B">B優先</option>
    <option value="C">C優先</option>
  `;
  els.financialStatusFilter.innerHTML = `<option value="all">すべての状態</option>${Object.entries(FINANCIAL_UNIT_STATUS_LABELS)
    .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
    .join("")}<option value="todo">未完了</option>`;
  const questionSources = [...new Set(QUESTION_BANK.map((question) => question.source))];
  els.questionSourceFilter.innerHTML = `<option value="all">すべての教材</option>${questionSources
    .map((source) => `<option value="${escapeHtml(source)}">${escapeHtml(source)}</option>`)
    .join("")}`;
  els.questionRankFilter.innerHTML = `
    <option value="all">すべてのランク</option>
    <option value="A">Aランク</option>
    <option value="B">Bランク</option>
    <option value="C">Cランク</option>
    <option value="-">ランクなし</option>
  `;
  els.questionStatusFilter.innerHTML = `<option value="all">すべての状態</option>${Object.entries(QUESTION_STATUS_LABELS)
    .map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`)
    .join("")}`;
  els.questionDueFilter.innerHTML = `
    <option value="all">すべて</option>
    <option value="due">今日まで</option>
    <option value="future">今後</option>
    <option value="unattempted">未実施</option>
  `;
}

function attachEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  els.examDateInput.addEventListener("change", () => {
    state.settings.examDate = els.examDateInput.value || "2026-12-01";
    saveAndRender();
  });
  els.weeklyTargetInput.addEventListener("change", () => {
    state.settings.weeklyTarget = clamp(Number(els.weeklyTargetInput.value) || 28, 1, 80);
    saveAndRender();
  });
  els.scheduleStartDate.addEventListener("change", () => {
    state.settings.scheduleStartDate = els.scheduleStartDate.value || todayISO();
    saveAndRender();
  });
  els.schedulePace.addEventListener("change", () => {
    state.settings.schedulePace = normalizeSchedulePace(Number(els.schedulePace.value));
    saveAndRender();
  });
  els.scheduleResetBtn.addEventListener("click", () => {
    state.settings.scheduleStartDate = todayISO();
    notify("今日からの計画に戻しました。");
    saveAndRender();
  });
  els.exportBtn.addEventListener("click", exportBackup);
  els.importBtn.addEventListener("click", () => els.importFile.click());
  els.importFile.addEventListener("change", importBackup);
  els.resetBtn.addEventListener("click", resetTracker);

  els.sessionSubject.addEventListener("change", updateSessionResourceOptions);
  els.sessionForm.addEventListener("submit", handleSessionSubmit);
  els.paperForm.addEventListener("submit", handlePaperSubmit);
  els.resourceForm.addEventListener("submit", handleResourceSubmit);

  [els.resourceSearch, els.resourceSubjectFilter, els.resourceTypeFilter, els.resourceStatusFilter].forEach((input) => {
    input.addEventListener("input", renderMaterials);
    input.addEventListener("change", renderMaterials);
  });
  [
    els.financialSearch,
    els.financialStreamFilter,
    els.financialVolumeFilter,
    els.financialPriorityFilter,
    els.financialStatusFilter,
  ].forEach((input) => {
    input.addEventListener("input", renderFinancial);
    input.addEventListener("change", renderFinancial);
  });
  [
    els.questionSearch,
    els.questionSourceFilter,
    els.questionRankFilter,
    els.questionStatusFilter,
    els.questionDueFilter,
  ].forEach((input) => {
    input.addEventListener("input", renderQuestions);
    input.addEventListener("change", renderQuestions);
  });
  [els.topicSubjectFilter, els.topicStatusFilter].forEach((input) => {
    input.addEventListener("change", renderTopics);
  });
  els.clearLogFilter.addEventListener("click", () => {
    state.ui.sessionSubjectFilter = "all";
    renderSessions();
  });

  els.financialQuickFilters.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-financial-preset]");
    if (!preset) return;
    applyFinancialPreset(preset.dataset.financialPreset);
  });
  els.questionQuickFilters.addEventListener("click", (event) => {
    const preset = event.target.closest("[data-question-preset]");
    if (!preset) return;
    applyQuestionPreset(preset.dataset.questionPreset);
  });

  document.addEventListener("input", (event) => {
    const target = event.target;
    if (target.matches("[data-resource-progress]")) {
      const id = target.dataset.resourceProgress;
      ensureResourceState(id).progress = Number(target.value);
      if (state.resources[id].progress >= 100) state.resources[id].status = "done";
      if (state.resources[id].progress > 0 && state.resources[id].status === "planned") state.resources[id].status = "active";
      save();
      renderSubjectCoverage();
      renderMaterials();
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches("[data-resource-status]")) {
      const id = target.dataset.resourceStatus;
      ensureResourceState(id).status = target.value;
      if (target.value === "done") state.resources[id].progress = 100;
      saveAndRender();
    }
    if (target.matches("[data-fin-unit-status]")) {
      const id = target.dataset.finUnitStatus;
      const unit = ensureFinancialUnitState(id);
      unit.status = target.value;
      if (target.value === "done") unit.progress = 100;
      if (target.value === "new") unit.progress = 0;
      syncFinancialResourceProgress(financialUnitById(id));
      saveAndRender();
    }
    if (target.matches("[data-fin-unit-confidence]")) {
      const id = target.dataset.finUnitConfidence;
      ensureFinancialUnitState(id).confidence = Number(target.value);
      saveAndRender();
    }
    if (target.matches("[data-topic-status]")) {
      const id = target.dataset.topicStatus;
      ensureTopicState(id).status = target.value;
      if (target.value === "ready") state.topics[id].confidence = Math.max(state.topics[id].confidence, 4);
      if (target.value === "review") state.topics[id].nextReview = addDays(todayISO(), 2);
      saveAndRender();
    }
    if (target.matches("[data-topic-confidence]")) {
      const id = target.dataset.topicConfidence;
      ensureTopicState(id).confidence = Number(target.value);
      saveAndRender();
    }
    if (target.matches("[data-question-status]")) {
      const id = target.dataset.questionStatus;
      ensureQuestionState(id).status = target.value;
      saveAndRender();
    }
  });

  document.addEventListener("click", (event) => {
    const scheduleShift = event.target.closest("[data-schedule-shift]");
    if (scheduleShift) {
      const amount = Number(scheduleShift.dataset.scheduleShift || 0);
      state.settings.scheduleStartDate = addDays(scheduleStartDate(), amount);
      notify(amount > 0 ? "計画を1日延期しました。" : "計画を1日前倒ししました。");
      saveAndRender();
      return;
    }
    const schedulePace = event.target.closest("[data-schedule-pace]");
    if (schedulePace) {
      const amount = Number(schedulePace.dataset.schedulePace || 0);
      state.settings.schedulePace = normalizeSchedulePace(schedulePaceValue() + amount);
      notify(`ペースを${Math.round(schedulePaceValue() * 100)}%にしました。`);
      saveAndRender();
      return;
    }
    const deleteSession = event.target.closest("[data-delete-session]");
    if (deleteSession) {
      const id = deleteSession.dataset.deleteSession;
      state.sessions = state.sessions.filter((session) => session.id !== id);
      saveAndRender();
      return;
    }
    const reviewTopic = event.target.closest("[data-review-topic]");
    if (reviewTopic) {
      markTopicReviewed(reviewTopic.dataset.reviewTopic);
      saveAndRender();
      return;
    }
    const filterSubject = event.target.closest("[data-filter-subject]");
    if (filterSubject) {
      state.ui.sessionSubjectFilter = filterSubject.dataset.filterSubject;
      switchView("planner");
      renderSessions();
      return;
    }
    const quickLog = event.target.closest("[data-quick-log]");
    if (quickLog) {
      createQuickSession(quickLog.dataset.quickLog, Number(quickLog.dataset.minutes || 45));
      notify("学習ブロックを記録しました。");
      saveAndRender();
      return;
    }
    const quickFinUnit = event.target.closest("[data-quick-fin-unit]");
    if (quickFinUnit) {
      createFinancialUnitSession(quickFinUnit.dataset.quickFinUnit, Number(quickFinUnit.dataset.minutes || 60));
      notify("財務会計の学習を記録しました。");
      saveAndRender();
      return;
    }
    const completeFinUnit = event.target.closest("[data-complete-fin-unit]");
    if (completeFinUnit) {
      completeFinancialUnit(completeFinUnit.dataset.completeFinUnit);
      notify("単元を完了にしました。");
      saveAndRender();
      return;
    }
    const focusFinUnit = event.target.closest("[data-focus-fin-unit]");
    if (focusFinUnit) {
      focusFinancialUnit(focusFinUnit.dataset.focusFinUnit);
      return;
    }
    const logQuestion = event.target.closest("[data-log-question]");
    if (logQuestion) {
      logQuestionAttempt(logQuestion.dataset.logQuestion, Number(logQuestion.dataset.score));
      notify("問題の結果を記録しました。");
      saveAndRender();
      return;
    }
    const focusQuestion = event.target.closest("[data-focus-question]");
    if (focusQuestion) {
      focusQuestionCard(focusQuestion.dataset.focusQuestion);
      return;
    }
    const jumpView = event.target.closest("[data-jump-view]");
    if (jumpView) {
      switchView(jumpView.dataset.jumpView);
      return;
    }
    const useFinUnit = event.target.closest("[data-use-fin-unit]");
    if (useFinUnit) {
      prefillSessionFromFinancialUnit(useFinUnit.dataset.useFinUnit);
      return;
    }
    const useResource = event.target.closest("[data-use-resource]");
    if (useResource) {
      prefillSessionFromResource(useResource.dataset.useResource);
    }
  });
}

function setInitialFormValues() {
  els.examDateInput.value = state.settings.examDate;
  els.weeklyTargetInput.value = state.settings.weeklyTarget;
  els.scheduleStartDate.value = scheduleStartDate();
  els.schedulePace.value = String(schedulePaceValue());
  els.sessionDate.value = todayISO();
  els.paperDate.value = todayISO();
  updateSessionResourceOptions();
}

function switchView(viewName) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === viewName);
  });
  const changed = state.ui.activeView !== viewName;
  state.ui.activeView = viewName;
  if (changed) save();
}

function render() {
  els.examDateInput.value = state.settings.examDate;
  els.weeklyTargetInput.value = state.settings.weeklyTarget;
  els.scheduleStartDate.value = scheduleStartDate();
  els.schedulePace.value = String(schedulePaceValue());
  updateSessionResourceOptions();
  renderDashboard();
  renderFinancial();
  renderQuestions();
  renderPlanner();
  renderMaterials();
  renderPapers();
  renderAnalytics();
  renderTopics();
  switchView(state.ui.activeView || "dashboard");
}

function renderDashboard() {
  const stats = calculateStats();
  const qStats = questionStats();
  const daysLeft = daysBetween(todayISO(), state.settings.examDate);
  const phase = currentPhase();
  els.phaseSummary.textContent = phase
    ? `${phase.name}: ${phase.detail}`
    : "2026年12月の工程外です。必要なら目標日を更新してください。";
  els.metricGrid.innerHTML = [
    metricMarkup("残り日数", Math.max(daysLeft, 0).toLocaleString(), "正確な試験日に合わせて目標日は変更できます。"),
    metricMarkup("累計時間", formatHours(stats.completedHours), `直近7日で ${formatHours(stats.weekHours)} 記録。`),
    metricMarkup("問題進捗", `${qStats.progressPct}%`, `${qStats.attempted}/${qStats.total}問を実施済み。`),
    metricMarkup("今日の復習", qStats.due.toLocaleString(), "Anki型スケジュールで期限到来の問題数。"),
  ].join("");
  renderPhaseRail();
  renderTodayCommand();
  renderFocusQueue();
  renderSubjectCoverage();
  renderWeeklyAllocation();
}

function renderPhaseRail() {
  const today = todayISO();
  els.runwayLabel.textContent = `${formatDateShort(PHASES[0].start)} から ${formatDateShort(PHASES.at(-1).end)}`;
  els.phaseRail.innerHTML = PHASES.map((phase) => {
    const total = Math.max(daysBetween(phase.start, phase.end), 1);
    const elapsed = clamp(daysBetween(phase.start, today), 0, total);
    const stateLabel = today < phase.start ? "次" : today > phase.end ? "完了" : "進行中";
    const percent = stateLabel === "完了" ? 100 : Math.round((elapsed / total) * 100);
    return `
      <div class="phase-item ${stateLabel === "進行中" ? "current" : ""}">
        <div class="phase-dates">${escapeHtml(formatDateShort(phase.start))} - ${escapeHtml(formatDateShort(phase.end))}</div>
        <div class="phase-name">
          <strong>${escapeHtml(phase.name)}</strong>
          <span>${escapeHtml(phase.detail)}</span>
          <div class="phase-bar"><div class="phase-fill" style="width:${percent}%"></div></div>
        </div>
        <div class="phase-state">${stateLabel}</div>
      </div>
    `;
  }).join("");
}

function renderTodayCommand() {
  const stats = calculateStats();
  const weekPct = clamp(Math.round((stats.weekHours / Math.max(state.settings.weeklyTarget, 1)) * 100), 0, 100);
  const plan = buildWeeklyPlan(weeklyAllocations());
  const block = plan[0];
  const review = dueReviewItems()[0];
  if (!block) {
    els.todayCommand.innerHTML = emptyState("計画がありません", "週の目標時間と教材を設定すると行動キューを作成します。");
    return;
  }
  const resource = resourceById(block.resourceId);
  const unit = block.unitId ? financialUnitById(block.unitId) : null;
  const question = block.questionId ? questionById(block.questionId) : null;
  const actionButtons = question
    ? `
      <button class="primary-action" type="button" data-focus-question="${question.id}">問題へ</button>
      <button class="ghost-button" type="button" data-jump-view="questions">問題一覧</button>
    `
    : unit
    ? `
      <button class="primary-action" type="button" data-quick-fin-unit="${unit.id}" data-minutes="${Math.round(block.hours * 60)}">${Math.round(block.hours * 60)}分記録</button>
      <button class="ghost-button" type="button" data-use-fin-unit="${unit.id}">計画に入れる</button>
      <button class="ghost-button" type="button" data-focus-fin-unit="${unit.id}">単元を見る</button>
    `
    : `
      <button class="primary-action" type="button" data-quick-log="${block.resourceId || block.subject}" data-minutes="${Math.round(block.hours * 60)}">${Math.round(block.hours * 60)}分記録</button>
      ${resource ? `<button class="ghost-button" type="button" data-use-resource="${resource.id}">計画に入れる</button>` : ""}
      <button class="ghost-button" type="button" data-jump-view="planner">計画を開く</button>
    `;

  els.todayCommand.innerHTML = `
    <div class="command-main">
      <span class="command-label">ここから開始</span>
      <h3>${escapeHtml(block.title)}</h3>
      <p>${escapeHtml(block.detail)}</p>
      <div class="command-actions">${actionButtons}</div>
    </div>
    <div class="command-side">
      <div class="command-stat">
        <span>今週</span>
        <strong>${formatHours(stats.weekHours)} / ${state.settings.weeklyTarget}時間</strong>
        <div class="small-bar"><div class="small-fill" style="width:${weekPct}%"></div></div>
      </div>
      <div class="command-stat">
        <span>次の復習</span>
        <strong>${escapeHtml(review?.title || "該当なし")}</strong>
        <p>${escapeHtml(review?.reason || "次の学習ブロックに集中してください。")}</p>
      </div>
    </div>
  `;
}

function renderFocusQueue() {
  const subjectStats = subjectReadiness().slice(0, 4);
  if (!subjectStats.length) {
    els.focusQueue.innerHTML = emptyState("科目データなし", "まず学習記録を入れると優先順位が作られます。");
    return;
  }
  els.focusQueue.innerHTML = subjectStats.map((item) => {
    const focusQuestion = item.subject.id === "financial" ? nextQuestionForReview() : null;
    const financialUnit = focusQuestion ? financialUnitForQuestion(focusQuestion) : null;
    const resource = financialUnit ? resourceForFinancialUnit(financialUnit) : nextResourceForSubject(item.subject.id);
    const topic = nextTopicForSubject(item.subject.id);
    const action = item.avgScore !== null && item.avgScore < item.subject.scoreGoal
      ? "時間を測った問題演習と解き直し"
      : item.hoursPct < 45
        ? "テキストと例題の1周"
        : "総合復習と弱点ノート整理";
    const priorityTarget = focusQuestion
      ? `${focusQuestion.chapter} ${focusQuestion.no} ${focusQuestion.title}`
      : financialUnit
      ? `${financialUnit.volume} ${financialUnit.chapter} ${financialUnit.title}`
      : topic?.title || resource?.title || "次の未完了教材";
    return `
      <article class="focus-item">
        <div class="focus-topline">
          <strong>${escapeHtml(item.subject.name)}</strong>
          <span class="tag">到達度 ${Math.round(item.readiness)}</span>
        </div>
        <p>${escapeHtml(action)}。優先: ${escapeHtml(priorityTarget)}。</p>
        <div class="resource-meta">
          <span class="status-pill">今週 ${formatHours(weeklyAllocationFor(item.subject.id))}</span>
          ${resource?.pages ? `<span class="status-pill">${resource.pages}ページ</span>` : ""}
          <button class="ghost-button" type="button" data-filter-subject="${item.subject.id}">ログ</button>
          ${resource?.path ? `<a class="small-link-button" href="${encodeURI(resource.path)}" target="_blank" rel="noreferrer">開く</a>` : ""}
          ${focusQuestion ? `<button class="primary-action compact-action" type="button" data-focus-question="${focusQuestion.id}">問題へ</button>` : financialUnit ? `<button class="ghost-button" type="button" data-use-fin-unit="${financialUnit.id}">使う</button>` : resource ? `<button class="ghost-button" type="button" data-use-resource="${resource.id}">使う</button>` : ""}
          ${focusQuestion
            ? `<button class="ghost-button" type="button" data-jump-view="questions">一覧</button>`
            : financialUnit
              ? `<button class="primary-action compact-action" type="button" data-quick-fin-unit="${financialUnit.id}" data-minutes="45">45分記録</button>`
            : `<button class="primary-action compact-action" type="button" data-quick-log="${resource?.id || item.subject.id}" data-minutes="45">45分記録</button>`}
        </div>
      </article>
    `;
  }).join("");
}

function renderSubjectCoverage() {
  const readiness = subjectReadiness("original");
  els.subjectCoverage.innerHTML = readiness.map(({ subject, hours, hoursPct, avgScore, resourcePct, readiness }) => `
    <article class="subject-card">
      <div class="subject-title">
        <div>
          <h4>${escapeHtml(subject.name)}</h4>
          <span>${escapeHtml(subject.jp)}</span>
        </div>
        <span class="status-pill ${readiness >= 78 ? "ready" : readiness >= 55 ? "active" : "review"}">${Math.round(readiness)}%</span>
      </div>
      <div class="subject-stats">
        <div class="mini-stat"><strong>${formatHours(hours)}</strong><span>記録</span></div>
        <div class="mini-stat"><strong>${avgScore === null ? "未記録" : `${Math.round(avgScore)}%`}</strong><span>平均点</span></div>
        <div class="mini-stat"><strong>${Math.round(resourcePct)}%</strong><span>教材</span></div>
      </div>
      <div class="small-bar"><div class="small-fill" style="width:${clamp(hoursPct, 0, 100)}%; background:${subject.color}"></div></div>
    </article>
  `).join("");
}

function renderWeeklyAllocation() {
  const allocation = weeklyAllocations();
  els.weeklyAllocationLabel.textContent = `${state.settings.weeklyTarget}時間`;
  els.weeklyAllocation.innerHTML = allocation.map(({ subject, hours, percent }) => `
    <div class="allocation-item">
      <div class="allocation-row">
        <strong>${escapeHtml(subject.short)}</strong>
        <div class="small-bar"><div class="small-fill" style="width:${percent}%; background:${subject.color}"></div></div>
        <span>${formatHours(hours)}</span>
      </div>
    </div>
  `).join("");
}

function renderFinancial() {
  if (!FINANCIAL_UNITS.length) {
    els.financialSummary.textContent = "財務会計の詳細マップが読み込まれていません。";
    els.financialMetricGrid.innerHTML = "";
    els.financialCommand.innerHTML = "";
    els.financialQuickFilters.innerHTML = "";
    els.financialUnitCount.textContent = "0件";
    els.financialUnitList.innerHTML = emptyState("単元データなし", "財務会計カリキュラムを再生成してください。");
    return;
  }

  const units = filteredFinancialUnits();
  const allUnits = FINANCIAL_UNITS;
  const unitStates = allUnits.map((unit) => financialUnitQuestionState(unit));
  const doneUnits = unitStates.filter((saved) => saved.status === "done");
  const calcUnits = allUnits.filter((unit) => unit.stream === "calculation");
  const theoryUnits = allUnits.filter((unit) => unit.stream === "theory");
  const calcDone = calcUnits.filter((unit) => financialUnitQuestionState(unit).status === "done").length;
  const theoryDone = theoryUnits.filter((unit) => financialUnitQuestionState(unit).status === "done").length;
  const aRemaining = allUnits.filter((unit) => unit.priority === "A" && financialUnitQuestionState(unit).status !== "done").length;
  const nextUnit = nextFinancialUnit();

  els.financialSummary.textContent = `計算1-7・理論1-3の単元を、テキスト例題の実施状況から自動集計します。手入力の章完了ではなく問題の結果を基準にします。`;
  els.financialMetricGrid.innerHTML = [
    metricMarkup("問題連動単元", `${doneUnits.length}/${allUnits.length}`, `テキスト例題ベースで ${Math.round((doneUnits.length / allUnits.length) * 100)}% 完了。`),
    metricMarkup("計算", `${calcDone}/${calcUnits.length}`, "計算テキストは例題の実施率で進捗を判定。"),
    metricMarkup("理論", `${theoryDone}/${theoryUnits.length}`, "理論は問題データ連携後に自動化対象。"),
    metricMarkup("A残り", String(aRemaining), nextUnit ? `次: ${nextUnit.volume} ${nextUnit.chapter} ${nextUnit.title}` : "Aランク単元は完了です。"),
  ].join("");
  renderFinancialCommand(nextUnit);
  renderFinancialQuickFilters();
  els.financialUnitCount.textContent = `${units.length}件表示`;

  if (!units.length) {
    els.financialUnitList.innerHTML = emptyState("該当する単元なし", "フィルターを変更してください。");
    return;
  }

  els.financialUnitList.innerHTML = units.map((unit) => {
    const saved = financialUnitQuestionState(unit);
    const resource = resourceForFinancialUnit(unit);
    const unitQuestions = questionsForFinancialUnit(unit);
    const firstQuestion = unitQuestions[0];
    const href = unit.resourcePath ? `${encodeURI(unit.resourcePath)}${unit.startPage ? `#page=${unit.startPage}` : ""}` : "";
    const statusClass = saved.status === "learning" ? "active" : saved.status;
    const sections = (unit.sections || []).map((section) => `<span>${escapeHtml(section)}</span>`).join("");
    return `
      <article class="financial-unit-card priority-${escapeHtml(unit.priority.toLowerCase())}" data-financial-unit-card="${unit.id}">
        <div class="unit-main">
          <div class="unit-topline">
            <div>
              <span class="unit-kicker">${escapeHtml(unit.volume)} · ${escapeHtml(unit.chapter)} · ${escapeHtml(streamLabel(unit.stream))}</span>
              <h4>${escapeHtml(unit.title)}</h4>
            </div>
            <span class="status-pill ${statusClass}">${escapeHtml(FINANCIAL_UNIT_STATUS_LABELS[saved.status])}</span>
          </div>
          <div class="resource-meta">
            <span class="status-pill priority">優先度${escapeHtml(unit.priority)}</span>
            ${unit.startPage ? `<span class="status-pill">p.${unit.startPage}</span>` : ""}
            ${resource?.pages ? `<span class="status-pill">PDF ${resource.pages}ページ</span>` : ""}
            <span class="status-pill">問題 ${saved.attempted}/${saved.total}</span>
            ${saved.due ? `<span class="status-pill review">復習 ${saved.due}</span>` : ""}
            ${saved.weak ? `<span class="status-pill review">弱点 ${saved.weak}</span>` : ""}
            ${saved.lastStudied ? `<span class="status-pill">最終 ${escapeHtml(formatDateShort(saved.lastStudied))}</span>` : ""}
          </div>
          <div class="unit-sections">${sections}</div>
          <div class="resource-progress-line">
            <div class="progress-track"><div class="progress-fill" style="width:${saved.progress}%; background:${subjectById("financial").color}"></div></div>
            <strong>${saved.progress}%</strong>
          </div>
        </div>
        <div class="unit-actions">
          ${href ? `<a href="${href}" target="_blank" rel="noreferrer">PDFを開く</a>` : `<span class="status-pill">PDFなし</span>`}
          ${firstQuestion ? `<button class="primary-action" type="button" data-focus-question="${firstQuestion.id}">問題へ</button>` : `<span class="status-pill">問題未連携</span>`}
        </div>
      </article>
    `;
  }).join("");
}

function renderFinancialCommand(nextUnit) {
  const unit = nextUnit || FINANCIAL_UNITS[0];
  const resource = resourceForFinancialUnit(unit);
  const saved = financialUnitQuestionState(unit);
  const firstQuestion = questionsForFinancialUnit(unit)[0] || nextQuestionForReview();
  const volumes = financialVolumeStats();
  els.financialCommand.innerHTML = `
    <div class="command-main">
      <span class="command-label">次の問題セット</span>
      <h3>${escapeHtml(unit.volume)} ${escapeHtml(unit.chapter)} ${escapeHtml(unit.title)}</h3>
      <p>${escapeHtml(saved.total ? `この単元の例題 ${saved.total}問のうち ${saved.attempted}問を実施済み。` : (unit.sections || []).slice(0, 6).join(", "))}</p>
      <div class="resource-meta">
        <span class="status-pill priority">優先度${escapeHtml(unit.priority)}</span>
        <span class="status-pill ${saved.status === "learning" ? "active" : saved.status}">${escapeHtml(FINANCIAL_UNIT_STATUS_LABELS[saved.status])}</span>
        <span class="status-pill">${escapeHtml(streamLabel(unit.stream))}</span>
        <span class="status-pill">問題 ${saved.attempted}/${saved.total}</span>
        ${saved.due ? `<span class="status-pill review">復習 ${saved.due}</span>` : ""}
        ${resource?.pages ? `<span class="status-pill">PDF ${resource.pages}ページ</span>` : ""}
      </div>
      <div class="command-actions">
        ${resource?.path ? `<a class="small-link-button" href="${encodeURI(resource.path)}${unit.startPage ? `#page=${unit.startPage}` : ""}" target="_blank" rel="noreferrer">PDFを開く</a>` : ""}
        ${firstQuestion ? `<button class="primary-action" type="button" data-focus-question="${firstQuestion.id}">問題へ</button>` : ""}
        <button class="ghost-button" type="button" data-focus-fin-unit="${unit.id}">一覧で表示</button>
      </div>
    </div>
    <div class="command-side volume-progress">
      ${volumes.map((item) => `
        <button class="volume-row" type="button" data-financial-preset="volume:${escapeHtml(item.volume)}">
          <span>${escapeHtml(item.volume)}</span>
          <strong>${item.done}/${item.total}</strong>
          <div class="small-bar"><div class="small-fill" style="width:${item.percent}%"></div></div>
        </button>
      `).join("")}
    </div>
  `;
}

function renderFinancialQuickFilters() {
  const preset = activeFinancialPreset();
  const chips = [
    ["todo", "未完了"],
    ["priority-a", "A優先"],
    ["calculation", "計算"],
    ["theory", "理論"],
    ["review", "復習"],
    ["reset", "リセット"],
  ];
  els.financialQuickFilters.innerHTML = chips.map(([value, label]) => `
    <button class="filter-chip ${preset === value ? "active" : ""}" type="button" data-financial-preset="${value}">
      ${escapeHtml(label)}
    </button>
  `).join("");
}

function renderQuestions() {
  if (!QUESTION_BANK.length) {
    els.questionSummary.textContent = "問題データが読み込まれていません。";
    els.questionMetricGrid.innerHTML = "";
    els.questionCommand.innerHTML = "";
    els.questionQuickFilters.innerHTML = "";
    els.questionCountLabel.textContent = "0件";
    els.questionList.innerHTML = emptyState("問題データなし", "問題集Excelを取り込むとここに表示されます。");
    return;
  }

  const stats = questionStats();
  const questions = filteredQuestions();
  const next = nextQuestionForReview();
  els.questionSummary.textContent = `テキスト例題・個別計算問題集・短答対策問題集から ${QUESTION_BANK.length.toLocaleString()} 問を取り込み済み。進捗は問題単位で管理します。`;
  els.questionMetricGrid.innerHTML = [
    metricMarkup("問題完了", `${stats.attempted}/${stats.total}`, `${stats.progressPct}% 実施済み。`),
    metricMarkup("今日の復習", String(stats.due), "Anki型スケジュールで今日までに出す問題。"),
    metricMarkup("弱点", String(stats.weak), "直近スコアが△または×の問題。"),
    metricMarkup("平均スコア", stats.avgScore === null ? "未記録" : `${stats.avgScore.toFixed(2)}/2`, "◎=2, ○=1, △=0.5, ×=0で集計。"),
  ].join("");
  renderQuestionCommand(next);
  renderQuestionQuickFilters();
  els.questionCountLabel.textContent = `${questions.length}件表示`;

  if (!questions.length) {
    els.questionList.innerHTML = emptyState("該当する問題なし", "フィルターを変更してください。");
    return;
  }

  els.questionList.innerHTML = questions.slice(0, 180).map((question) => questionCardMarkup(question)).join("");
}

function renderQuestionCommand(question) {
  if (!question) {
    els.questionCommand.innerHTML = emptyState("復習対象なし", "未実施または期限到来の問題はありません。");
    return;
  }
  const saved = questionState(question.id);
  els.questionCommand.innerHTML = `
    <div class="command-main">
      <span class="command-label">次に解く問題</span>
      <h3>${escapeHtml(question.chapter)} ${escapeHtml(question.no)} ${escapeHtml(question.title)}</h3>
      <p>${escapeHtml(question.learningPoint || question.timeBasis || "問題を解いて結果を記録してください。")}</p>
      <div class="resource-meta">
        <span class="status-pill">${escapeHtml(question.source)}</span>
        <span class="status-pill">短答${escapeHtml(question.shortRank || "-")}</span>
        <span class="status-pill">目標${formatMinutes(question.targetMinutes)}</span>
        <span class="status-pill ${questionStatusClass(saved)}">${escapeHtml(QUESTION_STATUS_LABELS[saved.status])}</span>
        <span class="status-pill">次回 ${escapeHtml(formatDateShort(saved.nextReview))}</span>
      </div>
      <div class="score-buttons" aria-label="問題結果を記録">
        ${scoreButtonsMarkup(question.id)}
        <button class="ghost-button" type="button" data-focus-question="${question.id}">一覧で表示</button>
      </div>
    </div>
    <div class="command-side">
      <div class="command-stat">
        <span>直近結果</span>
        <strong>${escapeHtml(scoreLabel(saved.lastScore))}</strong>
        <p>${escapeHtml(saved.lastDate ? `${formatDateShort(saved.lastDate)} に記録` : "まだ実施していません。")}</p>
      </div>
      <div class="command-stat">
        <span>間隔</span>
        <strong>${saved.intervalDays || 0}日</strong>
        <p>${escapeHtml(saved.repetitions ? `${saved.repetitions}回連続で合格ライン` : "結果に応じて自動で復習日を調整します。")}</p>
      </div>
    </div>
  `;
}

function renderQuestionQuickFilters() {
  const preset = activeQuestionPreset();
  const chips = [
    ["due", "今日の復習"],
    ["weak", "弱点"],
    ["rank-a", "Aランク"],
    ["text-example", "例題"],
    ["individual-calculation", "個別計算"],
    ["short-answer", "短答"],
    ["reset", "リセット"],
  ];
  els.questionQuickFilters.innerHTML = chips.map(([value, label]) => `
    <button class="filter-chip ${preset === value ? "active" : ""}" type="button" data-question-preset="${value}">
      ${escapeHtml(label)}
    </button>
  `).join("");
}

function questionCardMarkup(question) {
  const saved = questionState(question.id);
  const due = isQuestionDue(question.id);
  return `
    <article class="question-card ${due ? "is-due" : ""}" data-question-card="${question.id}">
      <div class="question-main">
        <div class="unit-topline">
          <div>
            <span class="unit-kicker">${escapeHtml(question.source)} · ${escapeHtml(question.chapter)} · ${escapeHtml(question.no)}</span>
            <h4>${escapeHtml(question.title)}</h4>
          </div>
          <span class="status-pill ${questionStatusClass(saved)}">${escapeHtml(QUESTION_STATUS_LABELS[saved.status])}</span>
        </div>
        <p>${escapeHtml(question.learningPoint || question.timeBasis || "")}</p>
        <div class="resource-meta">
          <span class="status-pill">短答${escapeHtml(question.shortRank || "-")}</span>
          <span class="status-pill">論文${escapeHtml(question.essayRank || "-")}</span>
          <span class="status-pill">目標${formatMinutes(question.targetMinutes)}</span>
          <span class="status-pill">次回 ${escapeHtml(formatDateShort(saved.nextReview))}</span>
          <span class="status-pill">直近 ${escapeHtml(scoreLabel(saved.lastScore))}</span>
          ${question.note ? `<span class="status-pill review">弱点メモあり</span>` : ""}
        </div>
        ${question.note ? `<div class="resource-path">${escapeHtml(question.note)}</div>` : ""}
      </div>
      <div class="question-actions">
        <div class="score-buttons">${scoreButtonsMarkup(question.id)}</div>
        <select data-question-status="${question.id}" aria-label="${escapeHtml(question.title)}の状態">
          ${Object.entries(QUESTION_STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${saved.status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
    </article>
  `;
}

function scoreButtonsMarkup(questionId) {
  return `
    <button class="score-button miss" type="button" data-log-question="${questionId}" data-score="0">×</button>
    <button class="score-button partial" type="button" data-log-question="${questionId}" data-score="0.5">△</button>
    <button class="score-button ok" type="button" data-log-question="${questionId}" data-score="1">○</button>
    <button class="score-button good" type="button" data-log-question="${questionId}" data-score="2">◎</button>
  `;
}

function renderPlanner() {
  els.sessionFormHint.textContent = `直近7日: ${formatHours(calculateStats().weekHours)}`;
  renderWeeklyPlan();
  renderReviewQueue();
  renderSessions();
}

function renderWeeklyPlan() {
  const schedule = buildSchedulePlan();
  const summary = summarizeSchedule(schedule);
  els.weeklyPlanLabel.textContent = `${schedule.length}日 · ${summary.totalQuestions}問 · ${formatHours(summary.plannedHours)}予定`;
  els.scheduleMetricGrid.innerHTML = renderScheduleMetrics(summary);
  els.weeklyPlan.innerHTML = renderScheduleGantt(schedule);
  els.scheduleCalendar.innerHTML = renderScheduleCalendar(schedule);
}

function renderScheduleMetrics(summary) {
  const deltaClass = summary.deltaQuestions >= 0 ? "ready" : "review";
  const deltaLabel = summary.deltaQuestions >= 0 ? `+${summary.deltaQuestions}問` : `${summary.deltaQuestions}問`;
  return [
    {
      label: "計画進捗",
      value: `${summary.expectedPct}%`,
      note: `今日まで ${summary.expectedByToday}/${summary.totalQuestions}問予定`,
    },
    {
      label: "実績進捗",
      value: `${summary.actualPct}%`,
      note: `予定内 ${summary.actualScheduled}/${summary.totalQuestions}問記録済み`,
    },
    {
      label: "予定比差分",
      value: deltaLabel,
      note: summary.deltaQuestions >= 0 ? "予定より前倒し" : "今日までの未消化",
      className: deltaClass,
    },
    {
      label: "完了予測",
      value: formatDateShort(summary.estimatedFinishDate),
      note: `${summary.dailyCapacity}問/日ペース · 残り${summary.remainingQuestions}問`,
    },
  ]
    .map(
      (metric) => `
        <article class="metric-card schedule-metric-card ${metric.className || ""}">
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <strong>${escapeHtml(metric.value)}</strong>
          <span>${escapeHtml(metric.note)}</span>
        </article>
      `,
    )
    .join("");
}

function renderScheduleGantt(schedule) {
  if (!schedule.length) return emptyState("予定できる問題がありません", "問題リストの状態を確認してください。");
  const scale = Array.from({ length: SCHEDULE_WINDOW_DAYS }, (_, index) => addDays(scheduleStartDate(), index));
  const rows = schedule
    .map((block) => {
      const stats = scheduleBlockStats(block);
      const status = scheduleBlockStatus(block, stats);
      const questions = block.questions.slice(0, 6);
      const hiddenCount = Math.max(block.questions.length - questions.length, 0);
      const firstQuestion = block.questions[0];
      return `
        <article class="gantt-task-row ${status}" style="--schedule-days: ${SCHEDULE_WINDOW_DAYS}">
          <div class="gantt-task-copy">
            <div class="plan-topline">
              <strong>${escapeHtml(formatWeekday(block.date))}</strong>
              <span class="status-pill ${status === "done" ? "done" : status === "overdue" ? "review" : ""}">${escapeHtml(scheduleStatusLabel(status))}</span>
            </div>
            <h4>${escapeHtml(block.title)}</h4>
            <p>${escapeHtml(block.detail)}</p>
            <div class="resource-meta">
              <span class="status-pill">${block.questions.length}問</span>
              <span class="status-pill">${formatMinutes(block.plannedMinutes)}</span>
              <span class="status-pill">実績 ${stats.completed}/${stats.total}問</span>
            </div>
            <div class="question-chip-list">
              ${questions
                .map(
                  (question) => `
                    <button class="question-chip" type="button" data-focus-question="${question.id}">
                      ${escapeHtml(questionShortLabel(question))}
                    </button>
                  `,
                )
                .join("")}
              ${hiddenCount ? `<span class="status-pill">+${hiddenCount}問</span>` : ""}
            </div>
            <div class="plan-actions">
              ${firstQuestion ? `<button class="primary-action" type="button" data-focus-question="${firstQuestion.id}">最初の問題へ</button>` : ""}
              <button class="ghost-button" type="button" data-jump-view="questions">問題一覧</button>
            </div>
          </div>
          <div class="gantt-track" aria-label="${escapeHtml(block.title)}の予定日">
            <span class="gantt-task-bar" style="grid-column: ${block.dayIndex + 1} / span 1">
              <span class="gantt-task-fill" style="width: ${stats.percent}%"></span>
            </span>
          </div>
        </article>
      `;
    })
    .join("");
  return `
    <div class="gantt-scroll">
      <div class="gantt-scale" style="--schedule-days: ${SCHEDULE_WINDOW_DAYS}">
        <span></span>
        ${scale
          .map(
            (date) => `
              <span class="${date === todayISO() ? "today" : ""}">
                ${escapeHtml(parseDate(date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }))}
              </span>
            `,
          )
          .join("")}
      </div>
      ${rows}
    </div>
  `;
}

function renderScheduleCalendar(schedule) {
  if (!schedule.length) return emptyState("予定できる問題がありません", "問題リストの状態を確認してください。");
  return schedule
    .map((block) => {
      const stats = scheduleBlockStats(block);
      const status = scheduleBlockStatus(block, stats);
      const lastQuestion = block.questions[block.questions.length - 1];
      const questionRange = block.questions.length ? `${questionShortLabel(block.questions[0])}${block.questions.length > 1 ? ` - ${questionShortLabel(lastQuestion)}` : ""}` : "";
      return `
        <article class="calendar-day ${status}">
          <div class="calendar-day-head">
            <strong>${escapeHtml(parseDate(block.date).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" }))}</strong>
            <span>${escapeHtml(parseDate(block.date).toLocaleDateString("ja-JP", { weekday: "short" }))}</span>
          </div>
          <h4>${escapeHtml(block.shortTitle)}</h4>
          <p>${escapeHtml(questionRange)}</p>
          <div class="calendar-progress">
            <span style="width: ${stats.percent}%"></span>
          </div>
          <div class="resource-meta">
            <span class="status-pill">${stats.completed}/${stats.total}問</span>
            <span class="status-pill ${status === "overdue" ? "review" : status === "done" ? "done" : ""}">${escapeHtml(scheduleStatusLabel(status))}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderReviewQueue() {
  const queue = dueReviewItems().slice(0, 7);
  if (!queue.length) {
    els.reviewQueue.innerHTML = emptyState("急ぎの復習なし", "低得点や期限到来の論点が自動で表示されます。");
    return;
  }
  els.reviewQueue.innerHTML = queue.map((item) => `
    <article class="review-item">
      <div class="focus-topline">
        <strong>${escapeHtml(item.title)}</strong>
        <span class="status-pill ${item.statusClass}">${escapeHtml(item.label)}</span>
      </div>
      <p>${escapeHtml(item.reason)}</p>
      ${item.questionId ? `<div class="review-controls"><button type="button" data-focus-question="${item.questionId}">問題へ</button></div>` : ""}
      ${item.topicId ? `<div class="review-controls"><button type="button" data-review-topic="${item.topicId}">復習済みにする</button></div>` : ""}
    </article>
  `).join("");
}

function renderSessions() {
  const filter = state.ui.sessionSubjectFilter || "all";
  let sessions = [...state.sessions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  if (filter !== "all") sessions = sessions.filter((session) => session.subject === filter);
  const subjectLabel = filter === "all" ? "すべて" : `${subjectById(filter).name}`;
  els.clearLogFilter.textContent = subjectLabel;
  if (!sessions.length) {
    els.sessionTable.innerHTML = `<tr><td colspan="8">${emptyState("学習記録なし", "最初の学習を記録してください。")}</td></tr>`;
    return;
  }
  els.sessionTable.innerHTML = sessions.slice(0, 40).map((session) => {
    const resource = resourceById(session.resourceId);
    return `
      <tr>
        <td>${escapeHtml(formatDateShort(session.date))}</td>
        <td>${escapeHtml(subjectById(session.subject).short)}</td>
        <td>${escapeHtml(session.mode)}</td>
        <td>${escapeHtml(resource?.title || "-")}</td>
        <td>${formatHours(session.minutes / 60)}</td>
        <td>${session.score === null ? "-" : `${session.score}%`}</td>
        <td>${escapeHtml(session.notes || "")}</td>
        <td><button class="row-action" type="button" data-delete-session="${session.id}" aria-label="Delete session">×</button></td>
      </tr>
    `;
  }).join("");
}

function renderMaterials() {
  const resources = filteredResources();
  const total = allResources().length;
  const done = allResources().filter((resource) => resourceDisplayState(resource).status === "done").length;
  const pages = sum(allResources().map((resource) => resource.pages || 0));
  els.materialSummary.textContent = `${total}教材、PDF ${pages.toLocaleString()}ページを登録済み。${done}件完了。`;
  els.resourceCountLabel.textContent = `${resources.length}件表示`;
  if (!resources.length) {
    els.resourceList.innerHTML = emptyState("該当する教材なし", "フィルターを変更するか教材を追加してください。");
    return;
  }
  els.resourceList.innerHTML = resources.map((resource) => {
    const saved = resourceDisplayState(resource);
    const href = resource.path ? encodeURI(resource.path) : "";
    const derived = saved.questionStats;
    return `
      <article class="resource-card">
        <div class="resource-main">
          <h4>${escapeHtml(resource.title)}</h4>
          <div class="resource-meta">
            <span class="status-pill">${escapeHtml(subjectById(resource.subject).short)}</span>
            <span class="status-pill">${escapeHtml(resourceTypeLabel(resource.type))}</span>
            <span class="status-pill ${saved.status}">${escapeHtml(STATUS_LABELS[saved.status])}</span>
            ${resource.pages ? `<span class="status-pill">${resource.pages}ページ</span>` : ""}
            ${resource.fileSize ? `<span class="status-pill">${escapeHtml(formatBytes(resource.fileSize))}</span>` : ""}
            ${derived ? `<span class="status-pill">問題 ${derived.attempted}/${derived.total}</span>` : ""}
          </div>
          <div class="resource-path">${escapeHtml(resource.folder || resource.path || "パス未設定")}</div>
          <div class="resource-progress-line">
            <div class="progress-track"><div class="progress-fill" style="width:${saved.progress}%; background:${subjectById(resource.subject).color}"></div></div>
            <strong>${saved.progress}%</strong>
          </div>
        </div>
        <div class="resource-actions">
          ${href ? `<a href="${href}" target="_blank" rel="noreferrer">PDFを開く</a>` : `<span class="status-pill">手入力</span>`}
          ${derived
            ? `<button class="ghost-button" type="button" data-jump-view="questions">問題で管理</button>`
            : `
              <button class="ghost-button" type="button" data-use-resource="${resource.id}">計画に入れる</button>
              <button class="primary-action" type="button" data-quick-log="${resource.id}" data-minutes="45">45分記録</button>
              <select data-resource-status="${resource.id}" aria-label="${escapeHtml(resource.title)}の状態">
                ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${saved.status === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
              <input data-resource-progress="${resource.id}" type="range" min="0" max="100" value="${saved.progress}" aria-label="${escapeHtml(resource.title)}の進捗" />
            `}
        </div>
      </article>
    `;
  }).join("");
}

function renderPapers() {
  const papers = paperResources();
  els.paperLibraryCount.textContent = `${papers.length}件`;
  els.paperReadiness.innerHTML = SUBJECTS.filter((subject) => paperAttemptsForSubject(subject.id).length).map((subject) => {
    const attempts = paperAttemptsForSubject(subject.id);
    const latest = attempts.sort((a, b) => b.date.localeCompare(a.date))[0];
    const avg = average(attempts.map((attempt) => attempt.score));
    return `
      <article class="paper-status">
        <div class="focus-topline">
          <strong>${escapeHtml(subject.name)}</strong>
          <span class="status-pill ${avg >= subject.scoreGoal ? "ready" : "review"}">${Math.round(avg)}%</span>
        </div>
        <span>直近: ${escapeHtml(formatDateShort(latest.date))}, ${escapeHtml(resourceById(latest.paperId)?.paperCode || "過去問")}で${latest.score}%。</span>
      </article>
    `;
  }).join("") || emptyState("過去問記録なし", "時間を測って解いた結果を記録してください。");
  els.paperLibrary.innerHTML = papers.map((paper) => {
    const attempts = state.paperAttempts.filter((attempt) => attempt.paperId === paper.id);
    const latest = attempts.sort((a, b) => b.date.localeCompare(a.date))[0];
    return `
      <article class="paper-card">
        <h4>${escapeHtml(paper.title)}</h4>
        <span>${escapeHtml(subjectById(paper.subject).name)}</span>
        <span>${escapeHtml([paper.paperCode, paper.pages ? `${paper.pages}ページ` : "", paper.fileSize ? formatBytes(paper.fileSize) : ""].filter(Boolean).join(" · "))}</span>
        <p>${latest ? `直近 ${formatDateShort(latest.date)} に ${latest.score}%` : "未実施"}</p>
        ${paper.path ? `<a href="${encodeURI(paper.path)}" target="_blank" rel="noreferrer">開く</a>` : ""}
      </article>
    `;
  }).join("");
}

function renderAnalytics() {
  renderModeMix();
  renderScoreTrend();
  renderHeatmap();
  renderRiskRegister();
}

function renderModeMix() {
  const totals = MODES.map((mode) => ({
    mode,
    hours: sum(state.sessions.filter((session) => session.mode === mode).map((session) => session.minutes / 60)),
  })).filter((item) => item.hours > 0);
  const max = Math.max(...totals.map((item) => item.hours), 1);
  if (!totals.length) {
    els.modeMix.innerHTML = emptyState("学習種別データなし", "学習記録を入れると表示されます。");
    return;
  }
  els.modeMix.innerHTML = totals.map((item) => `
    <div class="chart-row">
      <strong>${escapeHtml(item.mode)}</strong>
      <div class="small-bar"><div class="small-fill" style="width:${Math.round((item.hours / max) * 100)}%"></div></div>
      <span>${formatHours(item.hours)}</span>
    </div>
  `).join("");
}

function renderScoreTrend() {
  const scored = scoredEntries().slice(-12);
  if (!scored.length) {
    els.scoreTrend.innerHTML = emptyState("得点データなし", "問題演習または過去問の得点を記録してください。");
    return;
  }
  els.scoreTrend.innerHTML = scored.map((entry) => `
    <div class="trend-bar-wrap" title="${escapeHtml(entry.label)} ${entry.score}%">
      <div class="trend-bar" style="height:${clamp(entry.score, 2, 100)}%; background:${subjectById(entry.subject).color}"></div>
      <div class="trend-label">${entry.score}%</div>
    </div>
  `).join("");
}

function renderHeatmap() {
  const days = Array.from({ length: 56 }, (_, index) => addDays(todayISO(), index - 55));
  els.studyHeatmap.innerHTML = days.map((date) => {
    const hours = sum(state.sessions.filter((session) => session.date === date).map((session) => session.minutes / 60));
    const level = hours >= 4 ? 4 : hours >= 2 ? 3 : hours >= 1 ? 2 : hours > 0 ? 1 : 0;
    return `<div class="heat-cell level-${level}" title="${escapeHtml(formatDateShort(date))}: ${formatHours(hours)}"></div>`;
  }).join("");
}

function renderRiskRegister() {
  const risks = subjectReadiness().slice(0, 6);
  els.riskRegister.innerHTML = risks.map((item) => {
    const gap = Math.max(item.subject.scoreGoal - (item.avgScore ?? 0), 0);
    const reason = [
      item.hoursPct < 55 ? "目標時間に不足" : "",
      item.avgScore === null ? "得点記録なし" : gap > 0 ? `目標まで${Math.round(gap)}点不足` : "",
      item.daysSinceLast > 10 ? `${item.daysSinceLast}日未学習` : "",
      item.resourcePct < 45 ? "教材進捗が低い" : "",
    ].filter(Boolean).join("、") || "軽い復習で維持";
    return `
      <article class="risk-item">
        <div class="risk-title">
          <strong>${escapeHtml(item.subject.name)}</strong>
          <span class="status-pill ${item.readiness >= 70 ? "active" : "review"}">${Math.round(item.readiness)}%</span>
        </div>
        <p>${escapeHtml(reason)}.</p>
      </article>
    `;
  }).join("");
}

function renderTopics() {
  const subjectFilter = els.topicSubjectFilter.value || "all";
  const statusFilter = els.topicStatusFilter.value || "all";
  let topics = BASE_TOPICS;
  if (subjectFilter !== "all") topics = topics.filter((topic) => topic.subject === subjectFilter);
  if (statusFilter !== "all") topics = topics.filter((topic) => topicState(topic.id).status === statusFilter);
  els.topicCountLabel.textContent = `${topics.length}件表示`;
  if (!topics.length) {
    els.topicBoard.innerHTML = emptyState("該当する論点なし", "フィルターを変更してください。");
    return;
  }
  els.topicBoard.innerHTML = topics.map((topic) => {
    const saved = topicState(topic.id);
    const subject = subjectById(topic.subject);
    return `
      <article class="topic-card">
        <h4>${escapeHtml(topic.title)}</h4>
        <div class="topic-meta">
          <span class="status-pill">${escapeHtml(subject.short)}</span>
          <span class="status-pill ${saved.status}">${escapeHtml(TOPIC_STATUS_LABELS[saved.status])}</span>
          <span class="status-pill">C${saved.confidence}</span>
        </div>
        <div class="topic-controls">
          <select data-topic-status="${topic.id}" aria-label="Topic status for ${escapeHtml(topic.title)}">
            ${Object.entries(TOPIC_STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${saved.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
          <select data-topic-confidence="${topic.id}" aria-label="Confidence for ${escapeHtml(topic.title)}">
            ${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${saved.confidence === value ? "selected" : ""}>C${value}</option>`).join("")}
          </select>
        </div>
      </article>
    `;
  }).join("");
}

function handleSessionSubmit(event) {
  event.preventDefault();
  const session = {
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: els.sessionDate.value || todayISO(),
    subject: els.sessionSubject.value,
    mode: els.sessionMode.value,
    minutes: Number(els.sessionMinutes.value),
    resourceId: els.sessionResource.value || "",
    score: els.sessionScore.value === "" ? null : Number(els.sessionScore.value),
    questions: els.sessionQuestions.value === "" ? 0 : Number(els.sessionQuestions.value),
    confidence: Number(els.sessionConfidence.value),
    notes: els.sessionNotes.value.trim(),
  };
  state.sessions.push(session);
  if (session.resourceId) {
    advanceResourceProgress(session.resourceId, session.minutes);
  }
  if (state.ui.pendingFinancialUnitId && session.subject === "financial") {
    advanceFinancialUnitFromSession(state.ui.pendingFinancialUnitId, session);
    state.ui.pendingFinancialUnitId = "";
  }
  promoteRelatedTopic(session);
  els.sessionForm.reset();
  els.sessionDate.value = todayISO();
  els.sessionMinutes.value = 90;
  els.sessionConfidence.value = "3";
  updateSessionResourceOptions();
  notify("学習記録を保存しました。");
  saveAndRender();
}

function handlePaperSubmit(event) {
  event.preventDefault();
  const paper = resourceById(els.paperSelect.value);
  if (!paper) return;
  const attempt = {
    id: `paper-attempt-${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: els.paperDate.value || todayISO(),
    paperId: paper.id,
    subject: paper.subject,
    score: Number(els.paperScore.value),
    minutes: Number(els.paperMinutes.value),
    notes: els.paperNotes.value.trim(),
  };
  state.paperAttempts.push(attempt);
  state.sessions.push({
    id: `session-${Date.now()}-paper`,
    createdAt: new Date().toISOString(),
    date: attempt.date,
    subject: attempt.subject,
    mode: "過去問",
    minutes: attempt.minutes,
    resourceId: attempt.paperId,
    score: attempt.score,
    questions: 0,
    confidence: attempt.score >= subjectById(attempt.subject).scoreGoal ? 4 : 2,
    notes: attempt.notes,
  });
  const resource = ensureResourceState(paper.id);
  resource.status = "done";
  resource.progress = 100;
  els.paperForm.reset();
  els.paperDate.value = todayISO();
  els.paperMinutes.value = 120;
  notify("過去問の実績を保存しました。");
  saveAndRender();
}

function handleResourceSubmit(event) {
  event.preventDefault();
  const title = els.resourceTitle.value.trim();
  if (!title) return;
  const custom = {
    id: `custom-${Date.now()}`,
    subject: els.resourceSubject.value,
    type: els.resourceType.value,
    title,
    path: els.resourcePath.value.trim(),
    custom: true,
  };
  state.customResources.push(custom);
  ensureResourceState(custom.id);
  els.resourceForm.reset();
  notify("教材を追加しました。");
  saveAndRender();
}

function updateSessionResourceOptions() {
  const subject = els.sessionSubject.value || SUBJECTS[0].id;
  const resources = allResources().filter((resource) => resource.subject === subject);
  els.sessionResource.innerHTML = `<option value="">教材指定なし</option>${resources
    .map((resource) => `<option value="${resource.id}">${escapeHtml(resource.title)}</option>`)
    .join("")}`;
}

function calculateStats() {
  const sessions = state.sessions;
  const completedHours = sum(sessions.map((session) => session.minutes / 60));
  const weekStart = addDays(todayISO(), -6);
  const weekHours = sum(sessions.filter((session) => session.date >= weekStart).map((session) => session.minutes / 60));
  const scores = sessions.map((session) => session.score).filter((score) => score !== null);
  return {
    completedHours,
    weekHours,
    avgScore: scores.length ? average(scores) : null,
    scoredCount: scores.length,
    questions: sum(sessions.map((session) => Number(session.questions || 0))),
  };
}

function subjectReadiness(sortMode = "risk") {
  const all = SUBJECTS.map((subject) => {
    const sessions = state.sessions.filter((session) => session.subject === subject.id);
    const hours = sum(sessions.map((session) => session.minutes / 60));
    const hoursPct = clamp((hours / subject.targetHours) * 100, 0, 120);
    const scores = sessions.map((session) => session.score).filter((score) => score !== null);
    const avgScore = scores.length ? average(scores) : null;
    const subjectResources = allResources().filter((resource) => resource.subject === subject.id);
    const resourcePct = subjectResources.length
      ? average(subjectResources.map((resource) => resourceDisplayState(resource).progress))
      : 0;
    const latest = sessions.sort((a, b) => b.date.localeCompare(a.date))[0];
    const daysSinceLast = latest ? Math.max(daysBetween(latest.date, todayISO()), 0) : 999;
    const scoreComponent = avgScore === null ? 30 : clamp((avgScore / subject.scoreGoal) * 100, 0, 120);
    const recencyPenalty = daysSinceLast <= 5 ? 0 : Math.min((daysSinceLast - 5) * 1.4, 25);
    const readiness = clamp(hoursPct * 0.42 + scoreComponent * 0.32 + resourcePct * 0.26 - recencyPenalty, 0, 100);
    return {
      subject,
      hours,
      hoursPct,
      avgScore,
      resourcePct,
      daysSinceLast,
      readiness,
    };
  });
  if (sortMode === "original") return all;
  return all.sort((a, b) => a.readiness - b.readiness);
}

function weeklyAllocations() {
  const readiness = subjectReadiness("original");
  const weighted = readiness.map((item) => {
    const riskMultiplier = 1 + (100 - item.readiness) / 120;
    return {
      subject: item.subject,
      weight: item.subject.targetHours * riskMultiplier,
    };
  });
  const totalWeight = sum(weighted.map((item) => item.weight)) || 1;
  return weighted.map((item) => {
    const hours = (state.settings.weeklyTarget * item.weight) / totalWeight;
    return {
      subject: item.subject,
      hours,
      percent: Math.round((hours / state.settings.weeklyTarget) * 100),
    };
  });
}

function weeklyAllocationFor(subjectId) {
  return weeklyAllocations().find((item) => item.subject.id === subjectId)?.hours || 0;
}

function buildSchedulePlan(dayCount = SCHEDULE_WINDOW_DAYS) {
  const start = scheduleStartDate();
  const dailyMinutes = scheduleDailyMinutes();
  const questionHours = (dailyMinutes * 0.82) / 60;
  const usedQuestionIds = new Set();
  const blocks = [];
  for (let index = 0; index < dayCount; index += 1) {
    const date = addDays(start, index);
    const questionBlock = buildQuestionPlanBlock(usedQuestionIds, questionHours, new Set(), {
      date,
      maxQuestions: scheduleDailyQuestionCapacity(),
      minQuestions: 4,
    });
    if (!questionBlock) break;
    const questions = questionBlock.questionIds.map((id) => questionById(id)).filter(Boolean);
    questions.forEach((question) => usedQuestionIds.add(question.id));
    blocks.push({
      ...questionBlock,
      id: `schedule-${date}-${questionBlock.questionId}`,
      date,
      dayIndex: index,
      subject: "financial",
      questions,
      plannedMinutes: Math.max(1, Math.round(sum(questions.map((question) => Number(question.targetMinutes || 3))))),
      shortTitle: scheduleShortTitle(questions[0]),
    });
  }
  return blocks;
}

function summarizeSchedule(schedule) {
  const allIds = unique(schedule.flatMap((block) => block.questionIds || []));
  const expectedIds = unique(schedule.filter((block) => block.date <= todayISO()).flatMap((block) => block.questionIds || []));
  const actualScheduledIds = allIds.filter((id) => questionState(id).attempts.length);
  const completedExpectedIds = expectedIds.filter((id) => questionState(id).attempts.length);
  const remainingQuestions = QUESTION_BANK.filter((question) => !questionState(question.id).attempts.length).length;
  const dailyCapacity = scheduleDailyQuestionCapacity();
  const daysToFinish = dailyCapacity ? Math.max(0, Math.ceil(remainingQuestions / dailyCapacity) - 1) : 0;
  return {
    totalQuestions: allIds.length,
    expectedByToday: expectedIds.length,
    actualScheduled: actualScheduledIds.length,
    completedExpected: completedExpectedIds.length,
    deltaQuestions: actualScheduledIds.length - expectedIds.length,
    expectedPct: allIds.length ? Math.round((expectedIds.length / allIds.length) * 100) : 0,
    actualPct: allIds.length ? Math.round((actualScheduledIds.length / allIds.length) * 100) : 0,
    plannedHours: sum(schedule.map((block) => block.plannedMinutes / 60)),
    remainingQuestions,
    dailyCapacity,
    estimatedFinishDate: addDays(scheduleStartDate(), daysToFinish),
  };
}

function scheduleBlockStats(block) {
  const ids = block.questionIds || [];
  const completed = ids.filter((id) => questionState(id).attempts.length).length;
  return {
    total: ids.length,
    completed,
    percent: ids.length ? Math.round((completed / ids.length) * 100) : 0,
  };
}

function scheduleBlockStatus(block, stats) {
  if (stats.total && stats.completed >= stats.total) return "done";
  if (block.date < todayISO()) return "overdue";
  if (block.date === todayISO()) return "today";
  return "planned";
}

function scheduleStatusLabel(status) {
  return {
    done: "完了",
    overdue: "遅れ",
    today: "今日",
    planned: "予定",
  }[status] || "予定";
}

function scheduleShortTitle(question) {
  if (!question) return "財務会計 問題演習";
  return `${question.chapter} ${question.source}`;
}

function questionShortLabel(question) {
  if (!question) return "";
  return `${question.no} ${question.title}`;
}

function scheduleStartDate() {
  return state.settings.scheduleStartDate || todayISO();
}

function schedulePaceValue() {
  return normalizeSchedulePace(Number(state.settings.schedulePace) || 1);
}

function normalizeSchedulePace(value) {
  const rounded = Math.round((Number(value) || 1) / SCHEDULE_PACE_STEP) * SCHEDULE_PACE_STEP;
  return clamp(rounded, SCHEDULE_PACE_MIN, SCHEDULE_PACE_MAX);
}

function scheduleDailyMinutes() {
  return Math.max(30, Math.round(((Number(state.settings.weeklyTarget) || 28) * 60 * schedulePaceValue()) / 7));
}

function scheduleDailyQuestionCapacity() {
  const avgMinutes = average(QUESTION_BANK.map((question) => Number(question.targetMinutes || 3))) || 3;
  return clamp(Math.round((scheduleDailyMinutes() * 0.82) / avgMinutes), 4, 28);
}

function buildWeeklyPlan(allocations) {
  const start = todayISO();
  const blockSize = state.settings.weeklyTarget <= 12 ? 1.5 : 2;
  const maxBlocks = clamp(Math.ceil(state.settings.weeklyTarget / blockSize), 4, 18);
  const pool = allocations
    .map((item) => ({ ...item, remaining: item.hours }))
    .filter((item) => item.remaining > 0.25);
  const blocks = [];
  let lastSubject = "";
  const usedQuestionIds = new Set();
  const usedQuestionGroups = new Set();
  while (blocks.length < maxBlocks && pool.some((item) => item.remaining > 0.25)) {
    const sorted = [...pool].sort((a, b) => b.remaining - a.remaining);
    const selected = sorted.find((item) => item.subject.id !== lastSubject && item.remaining > 0.25) || sorted[0];
    const hours = Math.min(blockSize, Math.max(0.5, Math.round(selected.remaining * 2) / 2));
    const questionBlock = selected.subject.id === "financial" ? buildQuestionPlanBlock(usedQuestionIds, hours, usedQuestionGroups) : null;
    const financialUnit = questionBlock?.unitId ? financialUnitById(questionBlock.unitId) : null;
    const resource = financialUnit ? resourceForFinancialUnit(financialUnit) : nextResourceForSubject(selected.subject.id);
    const mode = questionBlock ? questionBlock.mode : financialUnit ? financialModeForUnit(financialUnit) : recommendedModeForResource(resource);
    const date = addDays(start, blocks.length);
    blocks.push({
      day: formatWeekday(date),
      subject: selected.subject.id,
      hours,
      mode,
      unitId: questionBlock?.unitId || financialUnit?.id || "",
      questionId: questionBlock?.questionId || "",
      questionIds: questionBlock?.questionIds || [],
      resourceId: resource?.id || selected.subject.id,
      title: questionBlock ? questionBlock.title : financialUnit ? `${financialUnit.volume} ${financialUnit.chapter} ${financialUnit.title}` : resource ? resource.title : `${selected.subject.name} review`,
      detail: questionBlock
        ? questionBlock.detail
        : financialUnit
        ? `${streamLabel(financialUnit.stream)}テキスト; 優先度${financialUnit.priority}; ${financialUnit.sections.slice(0, 4).join(", ")}。`
        : resource
        ? `${resourceTypeLabel(resource.type)}; ${resource.pages ? `${resource.pages}ページ; ` : ""}${resource.folder || "追加教材"}.`
        : "未完了教材がありません。弱点ノート整理に使ってください。",
    });
    (questionBlock?.questionIds || []).forEach((id) => usedQuestionIds.add(id));
    if (questionBlock?.groupKey) usedQuestionGroups.add(questionBlock.groupKey);
    selected.remaining -= hours;
    const original = pool.find((item) => item.subject.id === selected.subject.id);
    if (original) original.remaining = selected.remaining;
    lastSubject = selected.subject.id;
  }
  const reviewSubject = subjectReadiness()[0]?.subject || SUBJECTS[0];
  const reviewResource = nextResourceForSubject(reviewSubject.id);
  blocks.push({
    day: formatWeekday(addDays(start, blocks.length)),
    subject: reviewSubject.id,
    hours: 1.5,
    mode: "弱点ノート",
    resourceId: reviewResource?.id || reviewSubject.id,
    title: `${reviewSubject.name} 解き直し`,
    detail: "間違えた問題を解き直し、メモを更新して復習日に入れる。",
  });
  return blocks.slice(0, 18);
}

function buildQuestionPlanBlock(usedQuestionIds, hours, usedQuestionGroups = new Set(), options = {}) {
  const maxMinutes = Math.max(20, Math.round(hours * 60));
  const maxQuestions = Number(options.maxQuestions || 12);
  const minQuestions = Number(options.minQuestions || 4);
  const dueDate = options.date || todayISO();
  const baseCandidates = QUESTION_BANK
    .filter((question) => !usedQuestionIds.has(question.id))
    .filter((question) => isQuestionDueOn(question.id, dueDate) || questionState(question.id).status === "review")
    .sort(questionSort);
  const candidates = baseCandidates.filter((question) => !usedQuestionGroups.has(questionGroupKey(question)));
  const seed = candidates[0] || QUESTION_BANK.find((question) => !usedQuestionIds.has(question.id)) || QUESTION_BANK[0];
  if (!seed) return null;
  const group = candidates
    .filter((question) => question.source === seed.source && question.chapter === seed.chapter)
    .slice(0, 24);
  const selected = [];
  let minutes = 0;
  for (const question of group.length ? group : [seed]) {
    const target = Math.max(1, Number(question.targetMinutes || 3));
    if (selected.length >= maxQuestions || (selected.length >= minQuestions && minutes + target > maxMinutes)) break;
    selected.push(question);
    minutes += target;
  }
  const unit = financialUnitForQuestion(seed);
  const rankCounts = selected.reduce((counts, question) => {
    const rank = question.shortRank || "-";
    counts[rank] = (counts[rank] || 0) + 1;
    return counts;
  }, {});
  const rankSummary = ["A", "B", "C", "-"]
    .filter((rank) => rankCounts[rank])
    .map((rank) => `${rank}:${rankCounts[rank]}`)
    .join(" ");
  return {
    questionId: seed.id,
    questionIds: selected.map((question) => question.id),
    groupKey: questionGroupKey(seed),
    unitId: unit?.id || "",
    mode: seed.kind === "short-answer" ? "短答対策" : "問題演習",
    title: `${seed.chapter} ${seed.source} ${selected.length}問`,
    detail: `${rankSummary || "ランク未設定"}。目安${minutes}分。結果は各問題の×/△/○/◎で記録します。`,
  };
}

function questionGroupKey(question) {
  return `${question?.source || ""}|${question?.chapter || ""}`;
}

function recommendedModeForResource(resource) {
  if (!resource) return "復習";
  if (resource.type === "Quiz bank") return "問題演習";
  if (resource.type === "Past paper") return "過去問";
  if (resource.type === "Drill") return "問題演習";
  if (resource.type === "Compact summary") return "復習";
  return "テキスト";
}

function createQuickSession(resourceOrSubjectId, minutes) {
  const resource = resourceById(resourceOrSubjectId);
  const subjectId = resource?.subject || resourceOrSubjectId;
  const subject = subjectById(subjectId);
  const mode = recommendedModeForResource(resource);
  const session = {
    id: `session-${Date.now()}`,
    createdAt: new Date().toISOString(),
    date: todayISO(),
    subject: subject.id,
    mode,
    minutes: clamp(minutes || 45, 5, 720),
    resourceId: resource?.id || "",
    score: null,
    questions: mode === "問題演習" ? 30 : 0,
    confidence: 3,
    notes: resource ? `クイック記録: ${resource.title}` : "週間計画からクイック記録",
  };
  state.sessions.push(session);
  if (resource) advanceResourceProgress(resource.id, session.minutes);
  promoteRelatedTopic(session);
}

function createFinancialUnitSession(unitId, minutes) {
  const unit = financialUnitById(unitId);
  if (!unit) return;
  const resource = resourceForFinancialUnit(unit);
  const session = {
    id: `session-${Date.now()}-${unit.id}`,
    createdAt: new Date().toISOString(),
    date: todayISO(),
    subject: "financial",
    mode: financialModeForUnit(unit),
    minutes: clamp(minutes || 60, 5, 720),
    resourceId: resource?.id || "",
    score: null,
    questions: 0,
    confidence: 3,
    notes: `財務会計 ${unit.volume} ${unit.chapter} ${unit.title}`,
  };
  state.sessions.push(session);
  advanceFinancialUnitFromSession(unit.id, session);
  promoteRelatedTopic(session);
}

function advanceFinancialUnitFromSession(unitId, session) {
  const unit = financialUnitById(unitId);
  if (!unit) return;
  const saved = ensureFinancialUnitState(unit.id);
  saved.minutes += session.minutes;
  saved.lastStudied = session.date;
  saved.progress = clamp(saved.progress + financialProgressStep(unit, session.minutes), 0, 100);
  saved.status = saved.progress >= 100 ? "done" : "learning";
  saved.confidence = Math.max(saved.confidence, session.confidence || 2);
  syncFinancialResourceProgress(unit);
}

function prefillSessionFromFinancialUnit(unitId) {
  const unit = financialUnitById(unitId);
  if (!unit) return;
  const resource = resourceForFinancialUnit(unit);
  switchView("planner");
  els.sessionSubject.value = "financial";
  updateSessionResourceOptions();
  els.sessionResource.value = resource?.id || "";
  els.sessionMode.value = financialModeForUnit(unit);
  els.sessionMinutes.value = unit.stream === "theory" ? 60 : 90;
  els.sessionNotes.value = `財務会計 ${unit.volume} ${unit.chapter} ${unit.title}: ${(unit.sections || []).join(", ")}`;
  els.sessionDate.value = todayISO();
  state.ui.pendingFinancialUnitId = unit.id;
  els.sessionMinutes.focus();
}

function completeFinancialUnit(unitId) {
  const unit = financialUnitById(unitId);
  if (!unit) return;
  const saved = ensureFinancialUnitState(unit.id);
  saved.status = "done";
  saved.progress = 100;
  saved.confidence = Math.max(saved.confidence, 4);
  saved.lastStudied = saved.lastStudied || todayISO();
  syncFinancialResourceProgress(unit);
}

function prefillSessionFromResource(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource) return;
  switchView("planner");
  els.sessionSubject.value = resource.subject;
  updateSessionResourceOptions();
  els.sessionResource.value = resource.id;
  els.sessionMode.value = recommendedModeForResource(resource);
  els.sessionMinutes.value = resource.type === "Past paper" ? 120 : 90;
  els.sessionNotes.value = resource.title;
  els.sessionDate.value = todayISO();
  els.sessionMinutes.focus();
}

function advanceResourceProgress(resourceId, minutes) {
  const resource = ensureResourceState(resourceId);
  resource.progress = clamp(resource.progress + Math.max(3, Math.round(minutes / 18)), 0, 100);
  resource.status = resource.progress >= 100 ? "done" : "active";
}

function dueReviewItems() {
  const questionItems = QUESTION_BANK
    .filter((question) => isQuestionDue(question.id))
    .sort(questionSort)
    .slice(0, 12)
    .map((question) => {
      const saved = questionState(question.id);
      return {
        title: `${question.chapter} ${question.no} ${question.title}`,
        label: question.source,
        statusClass: questionStatusClass(saved),
        reason: `${question.shortRank || "-"}ランク、次回 ${formatDateShort(saved.nextReview)}。`,
        questionId: question.id,
      };
    });
  const topicItems = BASE_TOPICS.map((topic) => ({ topic, saved: topicState(topic.id) }))
    .filter(({ saved }) => saved.status !== "ready")
    .filter(({ saved }) => saved.nextReview <= todayISO() || saved.status === "review" || saved.confidence <= 2)
    .map(({ topic, saved }) => ({
      title: topic.title,
      label: subjectById(topic.subject).short,
      statusClass: saved.status,
      reason: `自信度${saved.confidence}、次回復習 ${formatDateShort(saved.nextReview)}。`,
      topicId: topic.id,
    }));
  const lowScoreItems = state.sessions
    .filter((session) => session.score !== null && session.score < subjectById(session.subject).scoreGoal)
    .slice(-12)
    .reverse()
    .map((session) => ({
      title: `${subjectById(session.subject).name} 解き直し`,
      label: `${session.score}%`,
      statusClass: "review",
      reason: session.notes || `${session.mode} が目標 ${subjectById(session.subject).scoreGoal}% を下回りました。`,
    }));
  return [...questionItems, ...lowScoreItems, ...topicItems].slice(0, 24);
}

function promoteRelatedTopic(session) {
  const candidate = BASE_TOPICS.find((topic) => topic.subject === session.subject && topicState(topic.id).status !== "ready");
  if (!candidate) return;
  const saved = ensureTopicState(candidate.id);
  if (saved.status === "new") saved.status = "learning";
  if (session.score !== null && session.score < subjectById(session.subject).scoreGoal) {
    saved.status = "review";
    saved.confidence = Math.max(1, Math.min(saved.confidence, 2));
    saved.nextReview = addDays(session.date, 2);
  } else if (session.confidence >= 4) {
    saved.confidence = Math.max(saved.confidence, session.confidence);
    saved.nextReview = addDays(session.date, 7);
  } else {
    saved.nextReview = addDays(session.date, 3);
  }
}

function markTopicReviewed(topicId) {
  const saved = ensureTopicState(topicId);
  saved.confidence = clamp(saved.confidence + 1, 1, 5);
  saved.status = saved.confidence >= 4 ? "ready" : "review";
  saved.nextReview = addDays(todayISO(), saved.confidence >= 4 ? 14 : 4);
}

function logQuestionAttempt(questionId, score) {
  const question = questionById(questionId);
  if (!question) return;
  const saved = ensureQuestionState(question.id);
  const attempt = {
    date: todayISO(),
    score,
    minutes: question.targetMinutes || 0,
    createdAt: new Date().toISOString(),
  };
  saved.attempts.push(attempt);
  saved.totalMinutes += attempt.minutes;
  applySrsResult(saved, score, attempt.date);
  state.sessions.push({
    id: `session-${Date.now()}-${question.id}`,
    createdAt: new Date().toISOString(),
    date: attempt.date,
    subject: "financial",
    mode: question.kind === "short-answer" ? "短答対策" : "問題演習",
    minutes: Math.max(1, Math.round(attempt.minutes)),
    resourceId: "",
    score: Math.round((score / 2) * 100),
    questions: 1,
    confidence: score >= 2 ? 4 : score >= 1 ? 3 : 1,
    notes: `${question.source} ${question.chapter} ${question.no} ${question.title}`,
  });
}

function applySrsResult(saved, score, date) {
  saved.lastScore = score;
  saved.lastDate = date;
  if (score >= 2) {
    saved.repetitions += 1;
    saved.ease = clamp((saved.ease || 2.3) + 0.15, 1.3, 2.8);
    saved.intervalDays = saved.repetitions === 1 ? 3 : Math.max(7, Math.round((saved.intervalDays || 3) * saved.ease));
    saved.status = saved.repetitions >= 2 ? "mastered" : "learning";
  } else if (score >= 1) {
    saved.repetitions = 0;
    saved.ease = clamp(saved.ease || 2.2, 1.3, 2.8);
    saved.intervalDays = 2;
    saved.status = "learning";
  } else if (score >= 0.5) {
    saved.repetitions = 0;
    saved.ease = clamp((saved.ease || 2.2) - 0.15, 1.3, 2.8);
    saved.intervalDays = 1;
    saved.status = "review";
  } else {
    saved.repetitions = 0;
    saved.ease = clamp((saved.ease || 2.2) - 0.25, 1.3, 2.8);
    saved.intervalDays = 0;
    saved.status = "review";
  }
  saved.nextReview = addDays(date, saved.intervalDays);
}

function applyFinancialPreset(preset) {
  if (preset === "reset") {
    clearFinancialFilters();
  } else if (preset === "todo") {
    clearFinancialFilters();
    els.financialStatusFilter.value = "todo";
  } else if (preset === "priority-a") {
    clearFinancialFilters();
    els.financialPriorityFilter.value = "A";
    els.financialStatusFilter.value = "todo";
  } else if (preset === "calculation" || preset === "theory") {
    clearFinancialFilters();
    els.financialStreamFilter.value = preset;
    els.financialStatusFilter.value = "todo";
  } else if (preset === "review") {
    clearFinancialFilters();
    els.financialStatusFilter.value = "review";
  } else if (preset.startsWith("volume:")) {
    clearFinancialFilters();
    els.financialVolumeFilter.value = preset.slice("volume:".length);
  }
  renderFinancial();
}

function clearFinancialFilters() {
  els.financialSearch.value = "";
  els.financialStreamFilter.value = "all";
  els.financialVolumeFilter.value = "all";
  els.financialPriorityFilter.value = "all";
  els.financialStatusFilter.value = "all";
}

function activeFinancialPreset() {
  if (els.financialSearch.value) return "";
  if (els.financialStatusFilter.value === "review") return "review";
  if (els.financialPriorityFilter.value === "A" && els.financialStatusFilter.value === "todo") return "priority-a";
  if (els.financialStreamFilter.value === "calculation" && els.financialStatusFilter.value === "todo") return "calculation";
  if (els.financialStreamFilter.value === "theory" && els.financialStatusFilter.value === "todo") return "theory";
  if (els.financialStatusFilter.value === "todo") return "todo";
  return "";
}

function applyQuestionPreset(preset) {
  if (preset === "reset") {
    clearQuestionFilters();
  } else if (preset === "due") {
    clearQuestionFilters();
    els.questionDueFilter.value = "due";
  } else if (preset === "weak") {
    clearQuestionFilters();
    els.questionStatusFilter.value = "review";
  } else if (preset === "rank-a") {
    clearQuestionFilters();
    els.questionRankFilter.value = "A";
    els.questionDueFilter.value = "due";
  } else if (["text-example", "individual-calculation", "short-answer"].includes(preset)) {
    clearQuestionFilters();
    const label = QUESTION_KIND_LABELS[preset];
    els.questionSourceFilter.value = label;
  }
  renderQuestions();
}

function clearQuestionFilters() {
  els.questionSearch.value = "";
  els.questionSourceFilter.value = "all";
  els.questionRankFilter.value = "all";
  els.questionStatusFilter.value = "all";
  els.questionDueFilter.value = "all";
}

function activeQuestionPreset() {
  if (els.questionSearch.value) return "";
  if (els.questionDueFilter.value === "due" && els.questionRankFilter.value === "A") return "rank-a";
  if (els.questionDueFilter.value === "due") return "due";
  if (els.questionStatusFilter.value === "review") return "weak";
  const source = els.questionSourceFilter.value;
  return Object.entries(QUESTION_KIND_LABELS).find(([, label]) => label === source)?.[0] || "";
}

function focusQuestionCard(questionId) {
  const question = questionById(questionId);
  if (!question) return;
  clearQuestionFilters();
  switchView("questions");
  renderQuestions();
  requestAnimationFrame(() => {
    const card = document.querySelector(`[data-question-card="${question.id}"]`);
    if (!card) return;
    card.classList.add("is-highlighted");
    card.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => card.classList.remove("is-highlighted"), 1800);
  });
}

function focusFinancialUnit(unitId) {
  const unit = financialUnitById(unitId);
  if (!unit) return;
  clearFinancialFilters();
  switchView("financial");
  renderFinancial();
  requestAnimationFrame(() => {
    const card = document.querySelector(`[data-financial-unit-card="${unit.id}"]`);
    if (!card) return;
    card.classList.add("is-highlighted");
    card.scrollIntoView({ block: "center", behavior: "smooth" });
    window.setTimeout(() => card.classList.remove("is-highlighted"), 1800);
  });
}

function financialVolumeStats() {
  const volumes = [...new Set(FINANCIAL_UNITS.map((unit) => unit.volume))];
  return volumes.map((volume) => {
    const units = FINANCIAL_UNITS.filter((unit) => unit.volume === volume);
    const done = units.filter((unit) => financialUnitQuestionState(unit).status === "done").length;
    return {
      volume,
      total: units.length,
      done,
      percent: Math.round((done / Math.max(units.length, 1)) * 100),
    };
  });
}

function filteredResources() {
  const query = (els.resourceSearch.value || "").trim().toLowerCase();
  const subject = els.resourceSubjectFilter.value || "all";
  const type = els.resourceTypeFilter.value || "all";
  const status = els.resourceStatusFilter.value || "all";
  return allResources().filter((resource) => {
    const haystack = `${resource.title} ${resource.originalTitle || ""} ${resource.fileName || ""} ${resource.folder || ""} ${resource.path} ${subjectById(resource.subject).name} ${subjectById(resource.subject).jp} ${resource.type}`.toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (subject === "all" || resource.subject === subject) &&
      (type === "all" || resource.type === type) &&
      (status === "all" || resourceDisplayState(resource).status === status)
    );
  });
}

function filteredFinancialUnits() {
  const query = (els.financialSearch.value || "").trim().toLowerCase();
  const stream = els.financialStreamFilter.value || "all";
  const volume = els.financialVolumeFilter.value || "all";
  const priority = els.financialPriorityFilter.value || "all";
  const status = els.financialStatusFilter.value || "all";
  return FINANCIAL_UNITS.filter((unit) => {
    const haystack = `${unit.volume} ${unit.chapter} ${unit.title} ${(unit.sections || []).join(" ")} ${streamLabel(unit.stream)} ${unit.priority}`.toLowerCase();
    const saved = financialUnitQuestionState(unit);
    return (
      (!query || haystack.includes(query)) &&
      (stream === "all" || unit.stream === stream) &&
      (volume === "all" || unit.volume === volume) &&
      (priority === "all" || unit.priority === priority) &&
      (status === "all" || (status === "todo" ? saved.status !== "done" : saved.status === status))
    );
  }).sort(financialBookSort);
}

function filteredQuestions() {
  const query = (els.questionSearch.value || "").trim().toLowerCase();
  const source = els.questionSourceFilter.value || "all";
  const rank = els.questionRankFilter.value || "all";
  const status = els.questionStatusFilter.value || "all";
  const due = els.questionDueFilter.value || "all";
  return QUESTION_BANK.filter((question) => {
    const saved = questionState(question.id);
    const haystack = `${question.id} ${question.source} ${question.chapter} ${question.no} ${question.title} ${question.learningPoint} ${question.timeBasis} ${question.note}`.toLowerCase();
    return (
      (!query || haystack.includes(query)) &&
      (source === "all" || question.source === source) &&
      (rank === "all" || (question.shortRank || "-") === rank) &&
      (status === "all" || saved.status === status) &&
      (due === "all" ||
        (due === "due" && isQuestionDue(question.id)) ||
        (due === "future" && !isQuestionDue(question.id) && saved.status !== "new") ||
        (due === "unattempted" && saved.status === "new"))
    );
  }).sort(questionSort);
}

function questionStats() {
  const states = QUESTION_BANK.map((question) => questionState(question.id));
  const attempted = states.filter((saved) => saved.attempts.length).length;
  const scores = states.map((saved) => saved.lastScore).filter((score) => score !== null);
  return {
    total: QUESTION_BANK.length,
    attempted,
    progressPct: QUESTION_BANK.length ? Math.round((attempted / QUESTION_BANK.length) * 100) : 0,
    due: QUESTION_BANK.filter((question) => isQuestionDue(question.id)).length,
    weak: states.filter((saved) => saved.status === "review" || (saved.lastScore !== null && saved.lastScore < 1)).length,
    mastered: states.filter((saved) => saved.status === "mastered").length,
    avgScore: scores.length ? average(scores) : null,
  };
}

function nextQuestionForReview() {
  return [...QUESTION_BANK].sort(questionSort)[0];
}

function questionProgressForQuestions(questions) {
  const states = questions.map((question) => questionState(question.id));
  const attempted = states.filter((saved) => saved.attempts.length).length;
  const mastered = states.filter((saved) => saved.status === "mastered").length;
  const weak = states.filter((saved) => saved.status === "review" || (saved.lastScore !== null && saved.lastScore < 1)).length;
  const due = questions.filter((question) => isQuestionDue(question.id)).length;
  const lastDates = states.map((saved) => saved.lastDate).filter(Boolean).sort();
  const scores = states.map((saved) => saved.lastScore).filter((score) => score !== null);
  return {
    total: questions.length,
    attempted,
    mastered,
    weak,
    due,
    progressPct: questions.length ? Math.round((attempted / questions.length) * 100) : 0,
    masteredPct: questions.length ? Math.round((mastered / questions.length) * 100) : 0,
    avgScore: scores.length ? average(scores) : null,
    lastStudied: lastDates.at(-1) || "",
  };
}

function questionsForFinancialUnit(unit) {
  if (!unit || unit.stream !== "calculation") return [];
  const volume = unit.volume;
  const chapterNumber = chapterNumberFromLabel(unit.chapter);
  return QUESTION_BANK.filter(
    (question) =>
      question.kind === "text-example" &&
      questionVolumeLabel(question) === volume &&
      Number(question.chapterNumber) === chapterNumber,
  );
}

function financialUnitQuestionState(unit) {
  const manual = financialUnitState(unit.id);
  const stats = questionProgressForQuestions(questionsForFinancialUnit(unit));
  if (!stats.total) {
    return {
      ...manual,
      total: 0,
      attempted: 0,
      due: 0,
      weak: 0,
      progress: manual.progress || 0,
    };
  }
  const status = stats.mastered === stats.total
    ? "done"
    : stats.weak || (stats.due && stats.attempted)
      ? "review"
      : stats.attempted
        ? "learning"
        : "new";
  return {
    ...manual,
    status,
    progress: stats.progressPct,
    confidence: stats.avgScore === null ? 1 : stats.avgScore >= 2 ? 5 : stats.avgScore >= 1 ? 3 : 2,
    lastStudied: stats.lastStudied,
    total: stats.total,
    attempted: stats.attempted,
    due: stats.due,
    weak: stats.weak,
  };
}

function financialUnitForQuestion(question) {
  if (!question || question.kind !== "text-example") return null;
  return FINANCIAL_UNITS.find(
    (unit) =>
      unit.stream === "calculation" &&
      unit.volume === questionVolumeLabel(question) &&
      chapterNumberFromLabel(unit.chapter) === Number(question.chapterNumber),
  );
}

function questionVolumeLabel(question) {
  const match = String(question?.id || "").match(/^([TPQ])(\d+)/);
  if (!match) return "";
  if (match[1] === "T") return `計算${Number(match[2])}`;
  if (match[1] === "P") return `個別${Number(match[2])}`;
  return `短答${Number(match[2])}`;
}

function chapterNumberFromLabel(label) {
  const match = String(label || "").match(/第(\d+)章/);
  return match ? Number(match[1]) : 0;
}

function resourceDisplayState(resource) {
  const derived = financialTextbookQuestionProgress(resource);
  if (!derived) return resourceState(resource.id);
  return {
    progress: derived.progressPct,
    status: derived.mastered === derived.total && derived.total ? "done" : derived.attempted ? "active" : "planned",
    questionStats: derived,
  };
}

function financialTextbookQuestionProgress(resource) {
  if (!resource || resource.subject !== "financial" || resource.type !== "Textbook") return null;
  const match = resource.title.match(/計算(\d+)/);
  if (!match || resource.duplicateVariant === "compressed") return null;
  const volume = `計算${Number(match[1])}`;
  const questions = QUESTION_BANK.filter((question) => question.kind === "text-example" && questionVolumeLabel(question) === volume);
  return questions.length ? questionProgressForQuestions(questions) : null;
}

function questionSort(a, b) {
  const aState = questionState(a.id);
  const bState = questionState(b.id);
  const dueDelta = Number(!isQuestionDue(a.id)) - Number(!isQuestionDue(b.id));
  if (dueDelta) return dueDelta;
  const scoreDelta = scoreRank(aState.lastScore) - scoreRank(bState.lastScore);
  if (scoreDelta) return scoreDelta;
  const rankDelta = priorityRank(a.shortRank || "-") - priorityRank(b.shortRank || "-");
  if (rankDelta) return rankDelta;
  const sourceDelta = questionKindRank(a.kind) - questionKindRank(b.kind);
  if (sourceDelta) return sourceDelta;
  const dateDelta = String(aState.nextReview).localeCompare(String(bState.nextReview));
  if (dateDelta) return dateDelta;
  return a.id.localeCompare(b.id, "ja", { numeric: true });
}

function questionKindRank(kind) {
  return { "text-example": 0, "individual-calculation": 1, "short-answer": 2 }[kind] ?? 9;
}

function scoreRank(score) {
  if (score === null || score === undefined) return 1;
  return score >= 2 ? 4 : score >= 1 ? 3 : score >= 0.5 ? 2 : 0;
}

function isQuestionDue(questionId) {
  return isQuestionDueOn(questionId, todayISO());
}

function isQuestionDueOn(questionId, date) {
  const saved = questionState(questionId);
  return saved.status === "new" || saved.nextReview <= date;
}

function scoredEntries() {
  return state.sessions
    .filter((session) => session.score !== null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((session) => ({
      date: session.date,
      score: session.score,
      subject: session.subject,
      label: `${formatDateShort(session.date)} ${subjectById(session.subject).short}`,
    }));
}

function paperAttemptsForSubject(subjectId) {
  return state.paperAttempts.filter((attempt) => attempt.subject === subjectId);
}

function currentPhase() {
  const today = todayISO();
  return PHASES.find((phase) => today >= phase.start && today <= phase.end);
}

function nextResourceForSubject(subjectId) {
  const preferredTypes = preferredTypesForCurrentPhase();
  const resources = allResources()
    .filter((resource) => resource.subject === subjectId)
    .filter((resource) => resourceDisplayState(resource).status !== "done")
    .sort((a, b) => {
      const aPreferred = preferredTypes.includes(a.type) ? preferredTypes.indexOf(a.type) : 99;
      const bPreferred = preferredTypes.includes(b.type) ? preferredTypes.indexOf(b.type) : 99;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;
      const variantDelta = (a.duplicateVariant === "compressed" ? 1 : 0) - (b.duplicateVariant === "compressed" ? 1 : 0);
      if (variantDelta) return variantDelta;
      const progressDelta = resourceDisplayState(a).progress - resourceDisplayState(b).progress;
      if (progressDelta) return progressDelta;
      return `${a.folder || ""}/${a.fileName || a.title}`.localeCompare(`${b.folder || ""}/${b.fileName || b.title}`, "ja", {
        numeric: true,
      });
    });
  return resources[0] || allResources().find((resource) => resource.subject === subjectId);
}

function nextFinancialUnit(excludeIds = new Set()) {
  const excluded = excludeIds instanceof Set ? excludeIds : new Set(excludeIds);
  return FINANCIAL_UNITS
    .filter((unit) => !excluded.has(unit.id))
    .filter((unit) => financialUnitQuestionState(unit).status !== "done")
    .sort(financialUnitSort)[0] || FINANCIAL_UNITS.find((unit) => !excluded.has(unit.id)) || FINANCIAL_UNITS[0];
}

function financialUnitSort(a, b) {
  const priorityDelta = priorityRank(a.priority) - priorityRank(b.priority);
  if (priorityDelta) return priorityDelta;
  return financialBookSort(a, b);
}

function financialBookSort(a, b) {
  const streamDelta = streamRank(a.stream) - streamRank(b.stream);
  if (streamDelta) return streamDelta;
  const volumeDelta = volumeRank(a.volume) - volumeRank(b.volume);
  if (volumeDelta) return volumeDelta;
  return (a.startPage || 0) - (b.startPage || 0);
}

function priorityRank(priority) {
  return { A: 0, B: 1, C: 2 }[priority] ?? 9;
}

function streamRank(stream) {
  return stream === "calculation" ? 0 : 1;
}

function volumeRank(volume) {
  const match = String(volume || "").match(/\d+/);
  const base = volume?.startsWith("計算") ? 0 : 100;
  return base + (match ? Number(match[0]) : 99);
}

function preferredTypesForCurrentPhase() {
  const phase = currentPhase()?.name || "";
  if (phase.includes("テキスト")) return ["Textbook", "Quiz bank", "Compact summary", "Drill", "Past paper"];
  if (phase.includes("問題集")) return ["Quiz bank", "Drill", "Compact summary", "Textbook", "Past paper"];
  if (phase.includes("過去問")) return ["Past paper", "Quiz bank", "Drill", "Compact summary", "Textbook"];
  if (phase.includes("模試")) return ["Drill", "Past paper", "Compact summary", "Quiz bank", "Textbook"];
  if (phase.includes("12月")) return ["Compact summary", "Past paper", "Drill", "Quiz bank", "Textbook"];
  return ["Textbook", "Quiz bank", "Past paper", "Drill", "Compact summary"];
}

function nextTopicForSubject(subjectId) {
  return BASE_TOPICS.find((topic) => topic.subject === subjectId && topicState(topic.id).status !== "ready");
}

function allResources() {
  const primaryResources = BASE_RESOURCES.filter((resource) => resource.duplicateVariant !== "compressed");
  return [...primaryResources, ...state.customResources];
}

function paperResources() {
  return allResources().filter((resource) => resource.isPaper || resource.type === "Past paper");
}

function paperOptionLabel(resource) {
  return `${subjectById(resource.subject).short} - ${resource.paperCode || resource.title}`;
}

function subjectById(id) {
  return SUBJECTS.find((subject) => subject.id === id) || SUBJECTS[0];
}

function resourceById(id) {
  return allResources().find((resource) => resource.id === id);
}

function financialUnitById(id) {
  return FINANCIAL_UNITS.find((unit) => unit.id === id);
}

function questionById(id) {
  return QUESTION_BANK.find((question) => question.id === id);
}

function resourceForFinancialUnit(unit) {
  if (!unit) return null;
  return allResources().find((resource) => resource.path === unit.resourcePath) || null;
}

function resourceState(id) {
  return state.resources[id] || { progress: 0, status: "planned" };
}

function ensureResourceState(id) {
  if (!state.resources[id]) state.resources[id] = { progress: 0, status: "planned" };
  return state.resources[id];
}

function financialUnitState(id) {
  return state.financialUnits[id] || defaultFinancialUnitState();
}

function ensureFinancialUnitState(id) {
  if (!state.financialUnits[id]) state.financialUnits[id] = defaultFinancialUnitState();
  return state.financialUnits[id];
}

function questionState(id) {
  return state.questionProgress[id] || defaultQuestionState(questionById(id));
}

function ensureQuestionState(id) {
  if (!state.questionProgress[id]) state.questionProgress[id] = defaultQuestionState(questionById(id));
  return state.questionProgress[id];
}

function defaultFinancialUnitState() {
  return {
    status: "new",
    confidence: 1,
    progress: 0,
    minutes: 0,
    lastStudied: "",
  };
}

function defaultQuestionState(question) {
  return {
    status: "new",
    attempts: [],
    lastScore: null,
    lastDate: "",
    nextReview: INITIAL_START_DATE,
    intervalDays: 0,
    repetitions: 0,
    ease: 2.3,
    totalMinutes: 0,
  };
}

function syncFinancialResourceProgress(unit) {
  const resource = resourceForFinancialUnit(unit);
  if (!resource) return;
  const siblingUnits = FINANCIAL_UNITS.filter((candidate) => candidate.resourcePath === unit.resourcePath);
  if (!siblingUnits.length) return;
  const progress = Math.round(average(siblingUnits.map((candidate) => financialUnitState(candidate.id).progress)));
  const saved = ensureResourceState(resource.id);
  saved.progress = progress;
  if (progress >= 100) {
    saved.status = "done";
  } else if (progress > 0) {
    saved.status = "active";
  } else {
    saved.status = "planned";
  }
}

function financialProgressStep(unit, minutes) {
  const sectionLoad = Math.max((unit.sections || []).length, 4);
  const baseline = unit.stream === "theory" ? 95 : 115;
  return Math.max(8, Math.round((minutes / (baseline * (sectionLoad / 5))) * 100));
}

function financialModeForUnit(unit) {
  return unit?.stream === "theory" ? "理論" : "テキスト";
}

function streamLabel(stream) {
  return stream === "theory" ? "理論" : "計算";
}

function resourceTypeLabel(type) {
  return RESOURCE_TYPE_LABELS[type] || type;
}

function questionStatusClass(saved) {
  if (saved.status === "mastered") return "ready";
  if (saved.status === "learning") return "active";
  return saved.status;
}

function scoreLabel(score) {
  if (score === null || score === undefined) return "未実施";
  if (score >= 2) return "◎";
  if (score >= 1) return "○";
  if (score >= 0.5) return "△";
  return "×";
}

function formatMinutes(minutes) {
  const value = Number(minutes || 0);
  if (!value) return "-";
  return `${Math.round(value)}分`;
}

function topicState(id) {
  return state.topics[id] || { status: "new", confidence: 1, nextReview: todayISO() };
}

function ensureTopicState(id) {
  if (!state.topics[id]) state.topics[id] = { status: "new", confidence: 1, nextReview: todayISO() };
  return state.topics[id];
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return hydrateState(parsed);
  } catch {
    return defaultState();
  }
}

function hydrateState(raw) {
  const defaults = defaultState();
  if (!raw || typeof raw !== "object") return defaults;
  const hydrated = {
    ...defaults,
    ...raw,
    version: CURRENT_STATE_VERSION,
    settings: { ...defaults.settings, ...(raw.settings || {}) },
    resources: { ...defaults.resources, ...(raw.resources || {}) },
    financialUnits: { ...defaults.financialUnits, ...(raw.financialUnits || {}) },
    questionProgress: { ...defaults.questionProgress, ...(raw.questionProgress || {}) },
    topics: { ...defaults.topics, ...(raw.topics || {}) },
    ui: { ...defaults.ui, ...(raw.ui || {}) },
    sessions: Array.isArray(raw.sessions) ? raw.sessions : defaults.sessions,
    paperAttempts: Array.isArray(raw.paperAttempts) ? raw.paperAttempts : defaults.paperAttempts,
    customResources: Array.isArray(raw.customResources) ? raw.customResources : defaults.customResources,
  };
  if ((Number(raw.version) || 1) < CURRENT_STATE_VERSION || !raw.questionHistoryResetAt) {
    hydrated.questionProgress = defaultQuestionProgress();
    hydrated.questionHistoryResetAt = new Date().toISOString();
    hydrated.updatedAt = hydrated.questionHistoryResetAt;
    stateNeedsInitialSave = true;
  }
  return hydrated;
}

function defaultState() {
  return {
    version: CURRENT_STATE_VERSION,
    updatedAt: "",
    questionHistoryResetAt: INITIAL_START_DATE,
    settings: {
      examDate: "2026-12-01",
      weeklyTarget: 28,
      startDate: INITIAL_START_DATE,
      scheduleStartDate: todayISO(),
      schedulePace: 1,
    },
    sessions: [],
    paperAttempts: [],
    customResources: [],
    resources: {},
    financialUnits: Object.fromEntries(FINANCIAL_UNITS.map((unit) => [unit.id, defaultFinancialUnitState()])),
    questionProgress: defaultQuestionProgress(),
    topics: Object.fromEntries(
      BASE_TOPICS.map((topic) => [
        topic.id,
        {
          status: "new",
          confidence: 1,
          nextReview: INITIAL_START_DATE,
        },
      ]),
    ),
    ui: {
      activeView: "dashboard",
      sessionSubjectFilter: "all",
      pendingFinancialUnitId: "",
    },
  };
}

function defaultQuestionProgress() {
  return Object.fromEntries(QUESTION_BANK.map((question) => [question.id, defaultQuestionState(question)]));
}

function saveAndRender() {
  save();
  render();
}

function save(options = {}) {
  const { sync = true, touch = true } = options;
  if (touch) state.updatedAt = new Date().toISOString();
  persistLocalState();
  if (sync) queueBackendSave();
}

function persistLocalState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function connectBackend() {
  if (API_BASE === null) {
    setBackendStatus("ブラウザ保存", "local");
    return;
  }
  setBackendStatus("SQL確認中", "syncing");
  try {
    const payload = await apiJson("/api/state");
    backendAvailable = true;
    const localRaw = localStorage.getItem(STORAGE_KEY);
    const remoteState = payload.state ? hydrateState(payload.state) : null;
    if (remoteState && shouldUseRemoteState(remoteState, localRaw)) {
      state = remoteState;
      persistLocalState();
      setInitialFormValues();
      render();
      setBackendStatus("SQL同期済み", "online");
      if (stateNeedsInitialSave) {
        stateNeedsInitialSave = false;
        queueBackendSave({ immediate: true });
      }
      return;
    }
    setBackendStatus("SQL同期済み", "online");
    queueBackendSave({ immediate: true });
  } catch (error) {
    backendAvailable = false;
    setBackendStatus("ブラウザ保存", "error", `SQLバックエンドに接続できません: ${error.message}`);
  }
}

function shouldUseRemoteState(remoteState, localRaw) {
  if (!localRaw) return true;
  const remoteUpdatedAt = remoteState.updatedAt || "";
  const localUpdatedAt = state.updatedAt || "";
  return Boolean(remoteUpdatedAt && (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt));
}

function queueBackendSave(options = {}) {
  if (!backendAvailable || API_BASE === null) return;
  window.clearTimeout(backendSaveTimer);
  const delay = options.immediate ? 0 : BACKEND_SAVE_DELAY;
  backendSaveTimer = window.setTimeout(syncStateToBackend, delay);
}

async function syncStateToBackend() {
  if (!backendAvailable || backendSaveInFlight || API_BASE === null) return;
  backendSaveInFlight = true;
  setBackendStatus("SQL保存中", "syncing");
  try {
    const payload = await apiJson("/api/state", {
      method: "PUT",
      body: { state },
    });
    if (!payload.ok) throw new Error(payload.error || "保存に失敗しました");
    setBackendStatus("SQL同期済み", "online");
  } catch (error) {
    backendAvailable = false;
    setBackendStatus("ブラウザ保存", "error", `SQL保存に失敗しました: ${error.message}`);
  } finally {
    backendSaveInFlight = false;
  }
}

async function apiJson(path, options = {}) {
  const method = options.method || "GET";
  const body = options.body === undefined ? null : JSON.stringify(options.body);
  const url = `${API_BASE}${path}`;
  if (typeof fetch === "function") {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  return xhrJson(url, method, body);
}

function xhrJson(url, method, body) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader("Accept", "application/json");
    request.setRequestHeader("Content-Type", "application/json");
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error(`HTTP ${request.status}`));
        return;
      }
      try {
        resolve(JSON.parse(request.responseText || "null"));
      } catch (error) {
        reject(error);
      }
    };
    request.onerror = () => reject(new Error("通信できません"));
    request.send(body);
  });
}

function setBackendStatus(label, status = "local", title = "") {
  if (!els.backendStatus) return;
  els.backendStatus.textContent = label;
  els.backendStatus.className = `backend-status ${status}`;
  els.backendStatus.title = title || (API_BASE !== null ? "SQLiteバックエンド接続状態" : "file:// 起動中のためブラウザ内に保存しています");
}

function exportBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    app: "CPA 2026年12月 学習トラッカー",
    state,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cpa-study-tracker-backup-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(reader.result);
      const imported = payload.state || payload;
      if (!imported.settings || !Array.isArray(imported.sessions)) throw new Error("トラッカーのバックアップ形式ではありません");
      state = hydrateState(imported);
      saveAndRender();
    } catch (error) {
      alert(`バックアップを読み込めませんでした: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function resetTracker() {
  const confirmed = confirm("すべての学習進捗を初期化しますか？必要なら先にバックアップを書き出してください。");
  if (!confirmed) return;
  state = defaultState();
  notify("トラッカーを初期化しました。");
  saveAndRender();
}

function notify(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => {
    els.toast.classList.remove("visible");
  }, 2200);
}

function metricMarkup(label, value, detail) {
  return `
    <article class="metric-card">
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(detail)}</span>
    </article>
  `;
}

function emptyState(title, detail) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
    </div>
  `;
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function todayISO() {
  const date = new Date();
  return localISO(date);
}

function localISO(date) {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
}

function addDays(iso, amount) {
  const date = parseDate(iso);
  date.setDate(date.getDate() + amount);
  return localISO(date);
}

function parseDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(startIso, endIso) {
  return Math.ceil((parseDate(endIso) - parseDate(startIso)) / DAY_MS);
}

function formatDateShort(iso) {
  if (!iso) return "";
  return parseDate(iso).toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
}

function formatWeekday(iso) {
  return parseDate(iso).toLocaleDateString("ja-JP", { weekday: "short", month: "numeric", day: "numeric" });
}

function formatHours(hours) {
  const rounded = Math.round(hours * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded}時間`;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`;
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? sum(clean) / clean.length : 0;
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function unique(values) {
  return [...new Set(values)];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}
