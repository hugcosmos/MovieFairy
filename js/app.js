/**
 * Movie Fairy - 主逻辑
 */

(function () {
  const movies = MOVIES;
  let questions = [];
  let currentStep = -1;
  let answers = [];
  let candidates = [];
  let currentMovie = null;
  let selectedPlatforms = [];

  const container = document.getElementById("app");

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
            回答 3 个小问题，<br>让我为你挑一部合适的电影。
          </div>
          <div class="welcome-features">
            <div class="feature-item">
              <span class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </span>
              <div class="feature-text">3 个问题<br>感知你心情</div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4845a" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              <div class="feature-text">诚意推荐<br>温暖不敷衍</div>
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
          <button class="start-btn" id="startBtn">
            开始吧 <span class="arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;
    document.getElementById("startBtn").addEventListener("click", startQuestions);

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

  /** 开始问答 */
  function startQuestions() {
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
  }

  /** 渲染推荐结果 */
  function renderResult(keepAnswers = false) {
    if (!keepAnswers) {
      const mood = analyzeMood(answers);
      let filtered = selectedPlatforms.length > 0
        ? movies.filter(m => (m.streaming || []).some(s => selectedPlatforms.includes(s.platform)))
        : movies;
      if (filtered.length === 0) filtered = movies;
      const result = recommend(filtered, mood);
      currentMovie = result.movie;
      candidates = result.candidates;
    }

    const movie = currentMovie;
    const mood = keepAnswers ? analyzeMood(answers) : analyzeMood(answers);
    const message = getRecommendationMessage(mood.profile);

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
      const newMovie = pickFromCandidates(candidates, currentMovie);
      if (newMovie) {
        currentMovie = newMovie;
        renderResult(true);
      }
    });

    document.getElementById("restartBtn").addEventListener("click", () => {
      answers = [];
      currentStep = 0;
      renderQuestion();
    });
  }

  init();

  function init() {
    renderWelcome();
  }
})();
