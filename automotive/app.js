(function () {
  var H = window.AUTOMOTIVE_HUB;
  if (!H) return;

  var state = {
    q: "",
    region: "all",
    level: "all",
    lang: "all",
    source: "all",
    shortlistOnly: false,
    agentRegion: "GCC",
    agentCountry: "all",
    agentQ: "",
    shortlist: new Set(JSON.parse(localStorage.getItem("gi-auto-hub-shortlist") || "[]"))
  };

  var NAV = [
    ["overview", "Overview"],
    ["regions", "Regions"],
    ["programs", "All programs"],
    ["compare", "Countries"],
    ["visas", "Visas"],
    ["agents", "Agents"],
    ["cucas", "CUCAS"],
    ["guides", "Guides"]
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function saveShort() {
    localStorage.setItem("gi-auto-hub-shortlist", JSON.stringify([...state.shortlist]));
  }

  function langBucket(p) {
    var t = ((p.language || "") + " " + (p.english || "")).toLowerCase();
    if (/chinese|hsk|mandarin|bahasa|malay/.test(t) && /english/.test(t)) return "mixed";
    if (/chinese|hsk|mandarin/.test(t) && !/english/.test(t)) return "chinese";
    if (/english/.test(t)) return "english";
    return "other";
  }

  function sourceLabel(p) {
    if (p.source === "cucas") return "CUCAS";
    if (p.source === "finder") return "Finder";
    return "Ranked guide";
  }

  function filtered() {
    var q = state.q.trim().toLowerCase();
    return H.programs.filter(function (p) {
      if (state.region !== "all" && p.region !== state.region) return false;
      if (state.level !== "all" && (p.level || "") !== state.level) return false;
      if (state.lang !== "all" && langBucket(p) !== state.lang) return false;
      if (state.source !== "all" && p.source !== state.source) return false;
      if (state.shortlistOnly && !state.shortlist.has(p.id)) return false;
      if (!q) return true;
      var blob = [p.institution, p.program, p.city, p.country, p.qualification, p.english, p.practical, p.ev, p.career].join(" ").toLowerCase();
      return blob.indexOf(q) !== -1;
    }).sort(function (a, b) {
      var as = a.score == null ? -1 : a.score;
      var bs = b.score == null ? -1 : b.score;
      if (bs !== as) return bs - as;
      return String(a.institution).localeCompare(String(b.institution));
    });
  }

  function renderNav() {
    document.getElementById("subnav").innerHTML = NAV.map(function (n) {
      return '<a href="#' + n[0] + '" data-sec="' + n[0] + '">' + n[1] + "</a>";
    }).join("");
  }

  function renderMeta() {
    var m = H.meta;
    document.getElementById("metaChips").innerHTML = [
      "<span class=\"chip\"><strong>" + esc(m.profile.split(",")[0]) + "</strong> · 2027 intake</span>",
      "<span class=\"chip\">Reports: " + esc(m.researchDate) + "</span>",
      "<span class=\"chip\">Updated " + esc(m.updated) + "</span>"
    ].join("");
    document.getElementById("stats").innerHTML = [
      [String(m.counts.programs), "program rows extracted"],
      [String(m.counts.countries), "countries"],
      [String(m.counts.guides), "original GoInfo pages"],
      [String(H.finder.length), "finder schools with agents"]
    ].map(function (s) {
      return "<div class=\"stat\"><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>";
    }).join("");
    document.getElementById("howTo").innerHTML = H.howToUse.map(function (x, i) {
      return "<div class=\"panel\"><h3>" + (i + 1) + ". " + esc(x.t) + "</h3><p>" + esc(x.d) + "</p></div>";
    }).join("");
    document.getElementById("profileDl").innerHTML = Object.keys(H.profile).map(function (k) {
      return "<dt>" + esc(k) + "</dt><dd>" + esc(H.profile[k]) + "</dd>";
    }).join("");
  }

  function renderRegions() {
    document.getElementById("regionGrid").innerHTML = H.regions.map(function (r) {
      var extra = r.extraHref
        ? '<a class="open-link" href="' + esc(r.extraHref) + '">' + esc(r.extraLabel) + " →</a>"
        : "";
      var pick = r.picks && r.picks[0]
        ? "<p class=\"pick\">" + esc(r.picks[0].institution ? r.picks[0].institution + " — " + r.picks[0].program : r.firstChoice) + "</p>"
        : "<p class=\"pick\">" + esc(r.firstChoice) + "</p>";
      return (
        '<article class="region-card">' +
        "<h3>" + esc(r.name) + "</h3>" +
        "<p>" + esc(r.headline) + "</p>" +
        pick +
        "<p>" + esc(r.conclusion).slice(0, 220) + (r.conclusion.length > 220 ? "…" : "") + "</p>" +
        '<p><a class="open-link" href="' + esc(r.href) + '">Open full ' + esc(r.name) + " guide →</a> " + extra + "</p>" +
        '<p><button type="button" class="filter" data-jump="' + esc(r.id) + '">Show programs</button></p>' +
        "</article>"
      );
    }).join("");
  }

  function renderFilters() {
    var levels = ["all"].concat(Array.from(new Set(H.programs.map(function (p) { return p.level; }).filter(Boolean))).sort());
    var regionBtns = [["all", "All regions"]].concat(H.regions.map(function (r) { return [r.id, r.name]; }));
    document.getElementById("regionFilters").innerHTML = regionBtns.map(function (r) {
      return '<button type="button" class="filter' + (state.region === r[0] ? " is-on" : "") + '" data-region="' + r[0] + '">' + esc(r[1]) + "</button>";
    }).join("");
    document.getElementById("filters").innerHTML =
      '<span class="select-wrap"><label for="level">Degree</label><select id="level">' +
      levels.map(function (l) {
        var label = l === "all" ? "All levels" : l;
        return '<option value="' + esc(l) + '"' + (state.level === l ? " selected" : "") + ">" + esc(label) + "</option>";
      }).join("") +
      "</select></span>" +
      '<span class="select-wrap"><label for="lang">Language</label><select id="lang">' +
      [["all", "All languages"], ["english", "English"], ["chinese", "Chinese"], ["mixed", "Mixed"], ["other", "Other / not stated"]].map(function (o) {
        return '<option value="' + o[0] + '"' + (state.lang === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") +
      "</select></span>" +
      '<span class="select-wrap"><label for="source">Source</label><select id="source">' +
      [["all", "All sources"], ["guide", "Ranked guides"], ["finder", "Finder + agents"], ["cucas", "CUCAS"]].map(function (o) {
        return '<option value="' + o[0] + '"' + (state.source === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") +
      "</select></span>";
  }

  function cardHtml(p) {
    var score = p.score != null
      ? '<span class="score-pill">' + p.score + "</span>"
      : '<span class="score-pill muted">' + esc(sourceLabel(p)) + "</span>";
    var ielts = p.ielts != null ? "IELTS " + p.ielts : "IELTS n/a";
    var snippet = p.practical || p.ev || p.english || p.entry || "";
    return (
      '<button type="button" class="card" data-id="' + esc(p.id) + '">' +
      '<div class="card-top"><div class="title-block"><h3>' + esc(p.institution) + "</h3><p>" +
      esc(p.program) + "</p></div>" + score + "</div>" +
      '<div class="badges">' +
      '<span class="badge">' + esc(p.country || "") + "</span>" +
      '<span class="badge">' + esc(p.level || "") + "</span>" +
      '<span class="badge' + (langBucket(p) === "english" ? " en" : langBucket(p) === "chinese" ? " warn" : "") + '">' + esc(ielts) + "</span>" +
      (p.status && p.status !== "verified" && p.status !== "ranked" && p.status !== "finder" && String(p.status).length <= 22 ? '<span class="badge warn">' + esc(p.status) + "</span>" : "") +
      "</div>" +
      '<div class="facts">' +
      '<div class="fact"><span>City</span><strong>' + esc(p.city || "—") + "</strong></div>" +
      '<div class="fact"><span>Language</span><strong>' + esc((p.language || "—").slice(0, 42)) + "</strong></div>" +
      "</div>" +
      '<p class="foot">' + esc(snippet) + "</p>" +
      "</button>"
    );
  }

  function renderCards() {
    var rows = filtered();
    document.getElementById("shownCount").textContent =
      rows.length + " shown · " + state.shortlist.size + " shortlisted · click a card for extracted detail";
    document.getElementById("cards").innerHTML = rows.map(cardHtml).join("");
    document.getElementById("empty").classList.toggle("is-on", rows.length === 0);
    document.getElementById("shortlistOnly").classList.toggle("is-on", state.shortlistOnly);
  }

  function kv(label, value, isHtml) {
    if (!value) return "";
    return "<div><span>" + esc(label) + "</span>" + (isHtml ? value : "<strong>" + esc(value) + "</strong>") + "</div>";
  }

  function openDrawer(id) {
    var p = H.programs.find(function (x) { return x.id === id; });
    if (!p) return;
    document.getElementById("drawerTitle").textContent = p.institution;
    document.getElementById("drawerSub").textContent = p.program;
    var starred = state.shortlist.has(p.id);
    var agent = state.agentRegion === "PK" ? p.agentsPK : p.agentsGCC;
    var qualParts = [];
    if (p.qualification) qualParts.push(p.qualification);
    if (p.level && p.level !== p.qualification) qualParts.push(p.level);
    if (p.years) qualParts.push(p.years + " years");
    var body = [
      kv("Country / city", [p.country, p.city].filter(Boolean).join(" · ")),
      kv("Qualification", qualParts.join(" · ")),
      kv("Language", p.language),
      kv("English / IELTS", p.english || (p.ielts != null ? "IELTS " + p.ielts : "")),
      kv("Entry", p.entry),
      kv("Practical / workshops", p.practical),
      kv("EV / future tech", p.ev),
      kv("Career fit", p.career),
      kv("Industry / cluster", p.industry),
      kv("Scholarship notes", p.scholarship),
      kv("Tuition / fees", p.tuitionText),
      kv("Annual planning figure", p.annual != null ? String(p.annual) + (p.est ? " (estimate)" : "") : ""),
      kv("Intakes", p.intakes),
      kv("Deadlines", p.deadlines || p.deadline),
      kv("Ownership", p.ownership),
      kv("Score in regional report", p.score != null ? String(p.score) : ""),
      kv("Source", sourceLabel(p) + (p.status ? " · " + p.status : "")),
      kv("Planning note", p.note),
      agent ? kv("Agent (" + state.agentRegion + ")", "<strong>" + esc(agent.name) + "</strong><br>" + esc(agent.info) + "<br>" + esc(agent.contact) + (agent.link ? '<br><a href="' + esc(agent.link) + '" rel="noopener noreferrer">Agent site</a>' : ""), true) : "",
      p.url ? kv("Official / CUCAS page", '<a href="' + esc(p.url) + '" rel="noopener noreferrer">' + esc(p.url) + "</a>", true) : "",
      p.guide ? kv("Full GoInfo guide", '<a href="' + esc(p.guide) + '">Open original page</a>', true) : "",
      '<div><button type="button" class="filter' + (starred ? " is-on" : "") + '" id="starBtn">' + (starred ? "Remove from shortlist" : "Add to shortlist") + "</button></div>"
    ].join("");
    document.getElementById("drawerBody").innerHTML = body;
    var star = document.getElementById("starBtn");
    if (star) {
      star.onclick = function () {
        if (state.shortlist.has(p.id)) state.shortlist.delete(p.id);
        else state.shortlist.add(p.id);
        saveShort();
        openDrawer(p.id);
        renderCards();
      };
    }
    document.getElementById("drawer").classList.add("is-on");
    document.getElementById("drawer").setAttribute("aria-hidden", "false");
    document.getElementById("backdrop").hidden = false;
  }

  function closeDrawer() {
    document.getElementById("drawer").classList.remove("is-on");
    document.getElementById("drawer").setAttribute("aria-hidden", "true");
    document.getElementById("backdrop").hidden = true;
  }

  function renderPaths() {
    document.getElementById("pathsGrid").innerHTML = H.paths.map(function (p) {
      return "<div class=\"panel\"><h3>" + esc(p.path) + "</h3><p><strong>Best for.</strong> " + esc(p.bestFor) + "</p><p><strong>Strength.</strong> " + esc(p.strength) + "</p><p><strong>Limitation.</strong> " + esc(p.limitation) + "</p></div>";
    }).join("");
  }

  function renderCompare() {
    document.getElementById("compareBody").innerHTML = H.compare.map(function (c) {
      return "<tr><td><strong>" + esc(c.country) + "</strong></td><td>" + esc(c.tuition) + "</td><td>" + esc(c.english) + "</td><td>" + esc(c.industry) + "</td><td>" + esc(c.visa) + "</td><td>" + esc(c.verdict) + "</td></tr>";
    }).join("");
  }

  function renderVisas() {
    document.getElementById("visaGrid").innerHTML = H.regions.map(function (r) {
      return (
        "<div class=\"panel\"><h3>" + esc(r.name) + "</h3>" +
        "<p><strong>" + esc(r.visa.title) + "</strong></p>" +
        "<p>" + esc(r.visa.work) + "</p>" +
        "<p>" + esc(r.visa.note) + "</p>" +
        (r.href ? '<p><a class="open-link" href="' + esc(r.href) + '">Visa detail in the ' + esc(r.name) + " guide →</a></p>" : "") +
        "</div>"
      );
    }).join("");
  }

  function finderCountries() {
    return Array.from(new Set(H.finder.map(function (s) { return s.country; }).filter(Boolean))).sort();
  }

  function renderAgentCountryFilters() {
    var el = document.getElementById("agentCountries");
    if (!el) return;
    var btns = [["all", "All countries"]].concat(finderCountries().map(function (c) { return [c, c]; }));
    el.innerHTML = btns.map(function (b) {
      return '<button type="button" class="filter' + (state.agentCountry === b[0] ? " is-on" : "") + '" data-agent-country="' + esc(b[0]) + '">' + esc(b[1]) + "</button>";
    }).join("");
  }

  function renderAgents() {
    var q = state.agentQ.trim().toLowerCase();
    var rows = H.finder.filter(function (s) {
      if (state.agentCountry !== "all" && s.country !== state.agentCountry) return false;
      if (!q) return true;
      return (s.name + " " + s.country + " " + s.specialties).toLowerCase().indexOf(q) !== -1;
    });
    var count = document.getElementById("agentCount");
    if (count) {
      count.textContent = rows.length + " school" + (rows.length === 1 ? "" : "s") +
        (state.agentCountry === "all" ? "" : " in " + state.agentCountry);
    }
    document.getElementById("agentList").innerHTML = rows.map(function (s) {
      var a = state.agentRegion === "PK" ? s.agentsPK : s.agentsGCC;
      if (!a) return "";
      return (
        '<div class="agent"><strong>' + esc(s.name) + "</strong> · " + esc(s.country) + " · " + esc(s.type) +
        "<br><span>" + esc(s.specialties) + "</span>" +
        "<br>" + esc(a.name) + " — " + esc(a.info) +
        "<br>" + esc(a.contact) +
        (a.link ? ' · <a href="' + esc(a.link) + '" rel="noopener noreferrer">Website</a>' : "") +
        (s.url ? ' · <a href="' + esc(s.url) + '" rel="noopener noreferrer">School</a>' : "") +
        "</div>"
      );
    }).join("") || "<p>No matching finder schools for that country.</p>";
  }

  function renderCucas() {
    var c = H.cucas;
    document.getElementById("cucasSub").textContent =
      "Scraped " + c.scrapeDate + " from " + c.source + ". " +
      c.counts.unique_programs_after_dedupe + " unique bachelor programs after dedupe. Masters excluded.";
    document.getElementById("cucasBody").innerHTML = c.programs.map(function (p) {
      return (
        "<tr><td><strong>" + esc(p.university) + "</strong><br>" + esc(p.city_province) + "</td>" +
        "<td><a href=\"" + esc(p.cucas_url) + "\" rel=\"noopener noreferrer\">" + esc(p.program_name) + "</a></td>" +
        "<td>" + esc(p.language) + "</td><td>" + esc(p.tuition) + "</td><td>" + esc(p.application_deadline) + "</td>" +
        "<td>" + esc(p.special_notes) + "</td></tr>"
      );
    }).join("");
  }

  function renderAsk() {
    document.getElementById("askList").innerHTML = H.questions.map(function (q) {
      return "<li style=\"margin:8px 0;color:var(--muted)\">" + esc(q) + "</li>";
    }).join("");
  }

  function renderCaution() {
    var items = (H.malaysiaCautions || []).concat(H.flags || []);
    document.getElementById("cautionGrid").innerHTML = items.map(function (x) {
      return "<div class=\"panel\"><h3>" + esc(x.item) + "</h3><p>" + esc(x.why) + "</p></div>";
    }).join("");
  }

  function renderGuides() {
    document.getElementById("guideGrid").innerHTML = H.guides.map(function (g) {
      return '<a href="' + esc(g.href) + '"><strong>' + esc(g.name) + "</strong><span>" + esc(g.blurb) + "</span></a>";
    }).join("");
  }

  function bind() {
    document.getElementById("q").addEventListener("input", function (e) {
      state.q = e.target.value;
      renderCards();
    });
    document.getElementById("filters").addEventListener("change", function (e) {
      if (e.target.id === "level") state.level = e.target.value;
      if (e.target.id === "lang") state.lang = e.target.value;
      if (e.target.id === "source") state.source = e.target.value;
      renderCards();
    });
    document.getElementById("regionFilters").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-region]");
      if (!btn) return;
      state.region = btn.getAttribute("data-region");
      renderFilters();
      renderCards();
    });
    document.getElementById("regionGrid").addEventListener("click", function (e) {
      var jump = e.target.closest("[data-jump]");
      if (!jump) return;
      state.region = jump.getAttribute("data-jump");
      renderFilters();
      renderCards();
      document.getElementById("programs").scrollIntoView({ behavior: "smooth" });
    });
    document.getElementById("shortlistOnly").addEventListener("click", function () {
      state.shortlistOnly = !state.shortlistOnly;
      renderCards();
    });
    document.getElementById("cards").addEventListener("click", function (e) {
      var card = e.target.closest("[data-id]");
      if (card) openDrawer(card.getAttribute("data-id"));
    });
    document.getElementById("closeBtn").addEventListener("click", closeDrawer);
    document.getElementById("backdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
    document.getElementById("agentGcc").addEventListener("click", function () {
      state.agentRegion = "GCC";
      document.getElementById("agentGcc").setAttribute("aria-pressed", "true");
      document.getElementById("agentPk").setAttribute("aria-pressed", "false");
      renderAgents();
    });
    document.getElementById("agentPk").addEventListener("click", function () {
      state.agentRegion = "PK";
      document.getElementById("agentGcc").setAttribute("aria-pressed", "false");
      document.getElementById("agentPk").setAttribute("aria-pressed", "true");
      renderAgents();
    });
    document.getElementById("agentQ").addEventListener("input", function (e) {
      state.agentQ = e.target.value;
      renderAgents();
    });
    document.getElementById("agentCountries").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-agent-country]");
      if (!btn) return;
      state.agentCountry = btn.getAttribute("data-agent-country");
      renderAgentCountryFilters();
      renderAgents();
    });

    var links = document.querySelectorAll("#subnav a");
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("is-on", a.getAttribute("data-sec") === en.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });
    NAV.forEach(function (n) {
      var el = document.getElementById(n[0]);
      if (el) obs.observe(el);
    });
  }

  renderNav();
  renderMeta();
  renderRegions();
  renderFilters();
  renderCards();
  renderPaths();
  renderCompare();
  renderVisas();
  renderAgentCountryFilters();
  renderAgents();
  renderCucas();
  renderAsk();
  renderCaution();
  renderGuides();
  bind();
})();
