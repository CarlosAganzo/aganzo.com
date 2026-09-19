/* AGANZO.COM site behaviour. Kept out of index.html on purpose. */

(() => {
        const hostname = window.location.hostname.toLowerCase().replace(/^www\./, "");
        const origin = new URLSearchParams(window.location.search).get("from");
        const domain = hostname === "carlosaganzo.com" || origin === "carlosaganzo.com"
          ? "CARLOSAGANZO.COM" : "AGANZO.COM";
        document.querySelector(".brand").textContent = domain;
      })();

;

const metaDescription = document.querySelector('meta[name="description"]');
    const languageButtons = document.querySelectorAll("[data-lang]");

    function setLanguage(lang) {
      const dictionary = translations[lang] || translations.en;

      document.documentElement.lang = lang;
      document.title = dictionary.pageTitle;
      metaDescription.setAttribute("content", dictionary.metaDescription);

      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (dictionary[key]) element.textContent = dictionary[key];
      });

      document.querySelectorAll("[data-i18n-html]").forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (dictionary[key]) element.innerHTML = dictionary[key];
      });

      languageButtons.forEach((button) => {
        const active = button.dataset.lang === lang;
        button.setAttribute("aria-pressed", String(active));
        button.classList.toggle("active", active);
      });

      renderAtlas();
      try { localStorage.setItem("aganzo-language", lang); } catch {}
    }

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.lang));
    });

    document.getElementById("year").textContent = new Date().getFullYear();

    let savedLanguage;
    try { savedLanguage = localStorage.getItem("aganzo-language"); } catch {}
    const browserLanguage = navigator.language.toLowerCase();
    const initialLanguage =
      savedLanguage ||
      (browserLanguage.startsWith("es") ? "es" :
      browserLanguage.startsWith("ja") ? "ja" :
      browserLanguage.startsWith("zh") ? "zh" : "en");


    const portraitSlides = [...document.querySelectorAll(".portrait-photo")];
    const portraitDots = [...document.querySelectorAll(".portrait-dot")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let portraitIndex = 0;
    let portraitTimer;

    function showPortrait(index) {
      portraitIndex = index;
      portraitSlides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      portraitDots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
    }

    function startPortraitTimer() {
      if (reduceMotion || portraitSlides.length < 2) return;
      clearInterval(portraitTimer);
      portraitTimer = setInterval(() => {
        showPortrait((portraitIndex + 1) % portraitSlides.length);
      }, 4800);
    }

    portraitDots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showPortrait(Number(dot.dataset.slide));
        startPortraitTimer();
      });
    });

    showPortrait(0);
    startPortraitTimer();

    setLanguage(initialLanguage);

;

(() => {
      const trackInput = document.getElementById("spotify-track");
      const reasonInput = document.getElementById("song-reason");
      const preview = document.getElementById("spotify-preview");
      const status = document.getElementById("spotify-status");
      const submit = document.getElementById("song-submit");

      if (!trackInput || !reasonInput || !preview || !status || !submit) return;

      const copy = {
        en: {
          invalid: "That does not look like a Spotify track link.",
          subject: "One song for AGANZO.COM",
          track: "Spotify track",
          reason: "Why this one",
          footer: "Sent from AGANZO.COM, where one song means one song."
        },
        es: {
          invalid: "Eso no parece un enlace a una canción de Spotify.",
          subject: "Una canción para AGANZO.COM",
          track: "Canción de Spotify",
          reason: "Por qué esta",
          footer: "Enviado desde AGANZO.COM, donde una canción significa una canción."
        },
        ja: {
          invalid: "Spotifyの曲リンクではないようです。",
          subject: "AGANZO.COMへの1曲",
          track: "Spotifyの曲",
          reason: "おすすめする理由",
          footer: "AGANZO.COMから送信。1曲と言ったら1曲です。"
        }
      };

      copy.zh = {
        "invalid": "这看起来不像 Spotify 的单曲链接。",
        "subject": "给 AGANZO.COM 的一首歌",
        "track": "Spotify 曲目",
        "reason": "为什么选这首",
        "footer": "来自 AGANZO.COM。说一首，就是一首。"
      };

      let trackId = "";

      function lang() {
        const current = document.documentElement.lang;
        return copy[current] ? current : "en";
      }

      function extractTrackId(value) {
        const trimmed = value.trim();
        const uri = trimmed.match(/^spotify:track:([A-Za-z0-9]{22})$/i);
        if (uri) return uri[1];

        const url = trimmed.match(/^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]{22})(?:[?/#].*)?$/i);
        return url ? url[1] : "";
      }

      function syncLanguage() {
        const current = lang();
        reasonInput.placeholder = reasonInput.dataset["placeholder" + current.charAt(0).toUpperCase() + current.slice(1)] || reasonInput.dataset.placeholderEn || "";
        if (trackInput.value.trim() && !trackId) status.textContent = copy[current].invalid;
      }

      function renderTrack() {
        const value = trackInput.value.trim();
        trackId = extractTrackId(value);
        submit.disabled = !trackId;

        if (!value) {
          preview.replaceChildren();
          preview.classList.remove("is-visible");
          status.textContent = "";
          return;
        }

        if (!trackId) {
          preview.replaceChildren();
          preview.classList.remove("is-visible");
          status.textContent = copy[lang()].invalid;
          return;
        }

        status.textContent = "";
        const iframe = document.createElement("iframe");
        iframe.src = "https://open.spotify.com/embed/track/" + encodeURIComponent(trackId) + "?utm_source=generator&theme=0";
        iframe.title = "Spotify track preview";
        iframe.loading = "lazy";
        iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        preview.replaceChildren(iframe);
        preview.classList.add("is-visible");
      }

      trackInput.addEventListener("input", renderTrack);
      trackInput.addEventListener("paste", () => window.setTimeout(renderTrack, 0));

      submit.addEventListener("click", () => {
        if (!trackId) return;
        const current = lang();
        const t = copy[current];
        const canonical = "https://open.spotify.com/track/" + trackId;
        const reason = reasonInput.value.trim() || "—";
        const body = t.track + ": " + canonical + "\n" + t.reason + ": " + reason + "\n\n" + t.footer;
        window.location.href = "mailto:carlos.aganzo@gmail.com?subject=" + encodeURIComponent(t.subject) + "&body=" + encodeURIComponent(body);
      });

      new MutationObserver(syncLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      syncLanguage();
    })();

;

(() => {
      const token = document.querySelector('meta[name="cf-web-analytics-token"]')?.content.trim();
      if (!token) return;
      const beacon = document.createElement("script");
      beacon.defer = true;
      beacon.src = "https://static.cloudflareinsights.com/beacon.min.js";
      beacon.dataset.cfBeacon = JSON.stringify({ token });
      document.body.appendChild(beacon);
    })();
