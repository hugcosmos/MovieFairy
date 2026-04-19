/**
 * Movie Fairy - 主逻辑
 */

(function () {
  const movies = MOVIES;
  let questions = [];
  let currentStep = -1;
  let answers = [];
  let candidates = [];
  let seenIds = new Set();
  let currentMovie = null;
  let selectedPlatforms = [];
  let isLuckyMode = false;

  const container = document.getElementById("app");
  const themeBtn = document.getElementById("themeToggle");

  /** 主题切换 */
  function getPreferredTheme() {
    const stored = localStorage.getItem("mf-theme");
    if (stored) return stored;
    return "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const sunIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    const moonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    themeBtn.innerHTML = theme === "dark" ? sunIcon : moonIcon;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("mf-theme", next);
    applyTheme(next);
  }

  applyTheme(getPreferredTheme());
  themeBtn.addEventListener("click", toggleTheme);

  function updateThemeBtn(mode) {
    themeBtn.className = "theme-toggle " + mode;
  }

  /** 渲染欢迎页 */
  function renderWelcome() {
    currentStep = -1;
    container.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-hero">
          <div class="film-strip">
            <div class="film-hole"></div><div class="film-hole"></div>
            <div class="film-hole"></div><div class="film-hole"></div>
            <div class="film-hole"></div>
          </div>
          <div class="stars">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div class="film-strip-bottom">
            <div class="film-hole"></div><div class="film-hole"></div>
            <div class="film-hole"></div><div class="film-hole"></div>
          </div>
          <div class="welcome-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="2" y1="7" x2="7" y2="7"/>
              <line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/>
              <line x1="17" y1="17" x2="22" y2="17"/>
            </svg>
          </div>
          <div class="welcome-hero-title">Movie Fairy</div>
          <div class="welcome-hero-sub">陪你挑一部好电影</div>
        </div>
        <div class="welcome-content">
          <div class="welcome-desc">
            答 3 个小题，或开个盲盒，<br>为你挑一部<span class="desc-accent">好电影</span>。
          </div>
          <div class="welcome-features">
            <div class="feature-item">
              <span class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </span>
              <div class="feature-text">诚意推荐<br>感知你状态</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </span>
              <div class="feature-text">平台匹配<br>现在就能看</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </span>
              <div class="feature-text">豆瓣 Top<br>精选好电影</div>
            </div>
          </div>
          <div class="platform-section">
            <div class="platform-label">我有这些平台的会员</div>
            <div class="platform-chips">
              ${["腾讯视频","爱奇艺","优酷视频","哔哩哔哩","咪咕视频"].map(p =>
                `<button class="platform-chip${selectedPlatforms.includes(p) ? " active" : ""}" data-platform="${p}">${p}</button>`
              ).join("")}
            </div>
          </div>
          <div class="welcome-actions">
            <button class="start-btn" id="startBtn">
              开测吧 <span class="arrow">&rarr;</span>
            </button>
            <button class="lucky-btn" id="luckyBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>
              开盲盒
            </button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("startBtn").addEventListener("click", startQuestions);
    document.getElementById("luckyBtn").addEventListener("click", feelingLucky);
    updateThemeBtn("on-hero");

    container.querySelectorAll(".platform-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const p = chip.dataset.platform;
        if (selectedPlatforms.includes(p)) {
          selectedPlatforms = selectedPlatforms.filter(x => x !== p);
          chip.classList.remove("active");
        } else {
          selectedPlatforms.push(p);
          chip.classList.add("active");
        }
      });
    });
  }

  /** 开盲盒 - 跳过答题，随机推荐 */
  function feelingLucky() {
    let pool = selectedPlatforms.length > 0
      ? movies.filter(m => (m.streaming || []).some(s => selectedPlatforms.includes(s.platform)))
      : movies.slice();
    if (pool.length === 0) pool = movies.slice();

    // 随机选一部
    currentMovie = pool[Math.floor(Math.random() * pool.length)];
    // 候选池 = 全部（排除当前），不锁数量
    candidates = pool.filter(m => m.id !== currentMovie.id);
    seenIds = new Set([currentMovie.id]);
    answers = [];
    isLuckyMode = true;
    renderResult(true, true);
  }

  /** 开始问答 */
  function startQuestions() {
    isLuckyMode = false;
    questions = pickQuestions();
    answers = [];
    currentStep = 0;
    renderQuestion();
  }

  /** 渲染当前问题 */
  function renderQuestion() {
    const q = questions[currentStep];
    const labels = ["第一个问题", "第二个问题", "最后一个问题"];

    const segments = [0, 1, 2].map(i => {
      const fill = i < currentStep ? "100%" : i === currentStep ? "50%" : "0%";
      return `<div class="progress-segment"><div class="progress-segment-fill" style="width:${fill}"></div></div>`;
    }).join("");

    const optionLabels = ["A", "B", "C"];

    container.innerHTML = `
      <div class="question-card">
        <div class="film-strip">
          <div class="film-hole"></div><div class="film-hole"></div>
          <div class="film-hole"></div><div class="film-hole"></div>
          <div class="film-hole"></div>
        </div>
        <div class="stars">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(212,132,90,0.3)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="rgba(212,132,90,0.2)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(212,132,90,0.25)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div class="film-strip-bottom">
          <div class="film-hole"></div><div class="film-hole"></div>
          <div class="film-hole"></div><div class="film-hole"></div>
        </div>
        <div class="question-progress">${segments}</div>
        <div class="question-center">
          <div class="question-label">${labels[currentStep]}</div>
          <div class="question-text">${q.text}</div>
          <div class="options">
            ${q.options
              .map(
                (opt, i) => `
              <button class="option-btn" data-value="${opt.value}" data-index="${optionLabels[i]}">
                ${opt.label}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="question-footer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.5" opacity="0.5">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <span>没有对错，跟着感觉选就好</span>
          ${currentStep === 0 ? `<button class="back-platform-link" id="backPlatformBtn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            重选视频平台
          </button>` : ""}
        </div>
      </div>
    `;

    container.querySelectorAll(".option-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        answers.push(btn.dataset.value);
        currentStep++;
        if (currentStep < 3) {
          renderQuestion();
        } else {
          renderResult();
        }
      });
    });

    const backBtn = document.getElementById("backPlatformBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        selectedPlatforms = [];
        renderWelcome();
      });
    }
    updateThemeBtn("on-card");
  }

  /** 渲染推荐结果 */
  function renderResult(keepAnswers = false, isLucky = false) {
    if (!keepAnswers) {
      const mood = analyzeMood(answers);
      let filtered = selectedPlatforms.length > 0
        ? movies.filter(m => (m.streaming || []).some(s => selectedPlatforms.includes(s.platform)))
        : movies;
      if (filtered.length === 0) filtered = movies;
      const result = recommend(filtered, mood);
      currentMovie = result.movie;
      candidates = result.candidates;
      seenIds = new Set([currentMovie.id]);
    }

    const movie = currentMovie;
    const mood = keepAnswers ? analyzeMood(answers) : analyzeMood(answers);
    const message = isLucky
      ? "缘分让你遇见这部电影，希望你会喜欢。"
      : getRecommendationMessage(mood.profile);

    const categories = movie.categories.join(" / ");
    const year = movie.year || "";

    container.innerHTML = `
      <div class="result-card">
        <div class="poster-section">
          ${
            movie.poster_url
              ? `<img src="${movie.poster_url}" alt="${movie.title}" onerror="this.parentElement.innerHTML='<div class=poster-placeholder>${movie.title[0]}</div>'">`
              : `<div class="poster-placeholder">${movie.title[0]}</div>`
          }
          <div class="poster-overlay"></div>
        </div>
        <div class="result-body">
          <div class="result-top">
            <div class="result-title">${movie.title}</div>
            <div class="result-rating"><span class="star">&#9733;</span> ${movie.rating}</div>
          </div>
          <div class="result-meta">${year} &middot; ${categories}</div>
          ${movie.synopsis ? `<div class="result-synopsis">"${movie.synopsis}"</div>` : ""}
          <div class="result-message">${message}</div>
          ${(() => {
              const list = (movie.streaming || []).filter(s => selectedPlatforms.length === 0 || selectedPlatforms.includes(s.platform));
              return `<div class="streaming-section">
                <div class="streaming-title">在哪儿看</div>
                ${list.length > 0
                  ? `<div class="streaming-list">
                      ${list.map(s => `
                        <a class="streaming-link" href="${s.url || "#"}" target="_blank" rel="noopener">
                          <span class="streaming-platform">${s.platform}</span>
                          ${s.type ? `<span class="streaming-type">${s.type}</span>` : ""}
                        </a>
                      `).join("")}
                    </div>`
                  : `<div class="streaming-empty">暂无在线播放源</div>`
                }
              </div>`;
            })()
          }
          <div class="result-actions">
            <button class="change-btn" id="changeBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              换一部
            </button>
            <div class="result-actions-row">
              <a class="douban-link" href="${movie.douban_url}" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                在豆瓣查看
              </a>
              <button class="restart-btn" id="restartBtn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                重新测评
              </button>
            </div>
          </div>
          <div class="copyright-notice">
            海报、评分等数据来源于豆瓣，版权归各自所有者
          </div>
        </div>
      </div>
    `;

    document.getElementById("changeBtn").addEventListener("click", () => {
      const newMovie = pickFromCandidates(candidates, currentMovie, seenIds);
      if (newMovie) {
        currentMovie = newMovie;
        seenIds.add(newMovie.id);
        renderResult(true, isLuckyMode);
      }
    });

    document.getElementById("restartBtn").addEventListener("click", () => {
      isLuckyMode = false;
      startQuestions();
    });
    updateThemeBtn("on-poster");
  }

  init();

  function init() {
    renderWelcome();
  }
})();
