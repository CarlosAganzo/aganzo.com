let atlasRegion = "all";
    function renderAtlas() {
      const lang = translations[document.documentElement.lang] ? document.documentElement.lang : "en";
      const words = atlasCopy[lang];
      document.querySelector(".atlas-stat strong").textContent = visitedCount;
      document.querySelector(".atlas-map-top span:last-child").textContent = `01 — ${visitedCount} / ↗`;
      document.getElementById("atlas-detail-title").textContent = words[atlasRegion + "Title"];
      document.getElementById("atlas-detail-text").textContent = words[atlasRegion + "Text"];
      document.getElementById("atlas-region-number").textContent = String(["all", ...Object.keys(atlasRegions)].indexOf(atlasRegion)).padStart(2, "0");
      document.querySelectorAll("[data-atlas-region]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.atlasRegion === atlasRegion)));
      const names = new Intl.DisplayNames([lang], {type: "region"});
      document.querySelectorAll(".atlas-country").forEach(country => {
        country.classList.toggle("is-muted", atlasRegion !== "all" && country.dataset.region !== atlasRegion);
        let title = country.querySelector("title");
        if (!title) { title = document.createElementNS("http://www.w3.org/2000/svg", "title"); country.appendChild(title); }
        title.textContent = names.of(country.dataset.country);
      });
      const countries = atlasRegion === "all" ? visitedCountries : atlasRegions[atlasRegion];
      document.getElementById("atlas-places").replaceChildren(...countries.map(code => {
        const span = document.createElement("span"); span.className = "atlas-place"; span.textContent = names.of(code); return span;
      }));
      document.querySelector(".atlas-map").setAttribute("aria-label", words.atlasLegend);
      document.querySelector(".atlas-filters").setAttribute("aria-label", words.atlasHint);
    }
    document.querySelectorAll("[data-atlas-region]").forEach(button => button.addEventListener("click", () => { atlasRegion = button.dataset.atlasRegion; renderAtlas(); }));
    document.querySelectorAll(".atlas-country").forEach(country => country.addEventListener("click", () => { atlasRegion = country.dataset.region; renderAtlas(); }));
