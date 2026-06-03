(function () {
  const dataNode = document.getElementById("weekly-plan-shopping-data");
  const root = document.getElementById("weekly-plan-shopping-list");
  const countNode = document.getElementById("weekly-shopping-count");
  const saveStatusNode = document.getElementById("weekly-shopping-save-status");

  if (!dataNode || !root) return;

  let payload;
  try {
    payload = JSON.parse(dataNode.textContent || "{}");
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }
  } catch (error) {
    root.textContent = "Nie udało się wczytać listy zakupów.";
    return;
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  const missingRecipes = Array.isArray(payload.missingRecipes) ? payload.missingRecipes : [];
  const planSlug = String(payload.planSlug || "").trim();
  const workerUrl = String(payload.workerUrl || "").replace(/\/$/, "");
  const saveDelayMs = 8000;
  const storageKey = planSlug ? `weekly-shopping:${planSlug}` : "";
  let saveTimer = null;
  let isSaving = false;
  const firebaseConfig = {
    apiKey: "AIzaSyBlDt8i7XqmibwycGXIpYKBj1G5MS7BDqo",
    authDomain: "cookbook-ee262.firebaseapp.com",
    projectId: "cookbook-ee262",
    storageBucket: "cookbook-ee262.firebasestorage.app",
    messagingSenderId: "693621425800",
    appId: "1:693621425800:web:098cb3d04f2036415bc13d",
    measurementId: "G-P9537SX3LM",
  };

  const numberFormat = new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 2,
  });
  const categoryOrder = [
    "Warzywa i owoce",
    "Mięso i ryby",
    "Nabiał i jajka",
    "Zboża i pieczywo",
    "Tłuszcze i sosy",
    "Przyprawy i dodatki",
    "Inne",
  ];
  const categoryIcons = new Map(
    Object.entries({
      "Warzywa i owoce": "fas fa-carrot",
      "Mięso i ryby": "fas fa-drumstick-bite",
      "Nabiał i jajka": "fas fa-egg",
      "Zboża i pieczywo": "fas fa-bread-slice",
      "Tłuszcze i sosy": "fas fa-bottle-droplet",
      "Przyprawy i dodatki": "fas fa-mortar-pestle",
      Inne: "fas fa-basket-shopping",
    })
  );
  const categoryClasses = new Map(
    Object.entries({
      "Warzywa i owoce": "weekly-shopping-category--produce",
      "Mięso i ryby": "weekly-shopping-category--protein",
      "Nabiał i jajka": "weekly-shopping-category--dairy",
      "Zboża i pieczywo": "weekly-shopping-category--grains",
      "Tłuszcze i sosy": "weekly-shopping-category--sauces",
      "Przyprawy i dodatki": "weekly-shopping-category--spices",
      Inne: "weekly-shopping-category--other",
    })
  );
  const categoryMap = new Map(
    Object.entries({
      ananas: "Warzywa i owoce",
      awokado: "Warzywa i owoce",
      borówki: "Warzywa i owoce",
      cebula: "Warzywa i owoce",
      "cebula czerwona": "Warzywa i owoce",
      "cebula dymka": "Warzywa i owoce",
      cytryna: "Warzywa i owoce",
      "dynia piżmowa": "Warzywa i owoce",
      "fasola biała": "Warzywa i owoce",
      "fasolka szparagowa": "Warzywa i owoce",
      granat: "Warzywa i owoce",
      "liście laurowe": "Warzywa i owoce",
      limonka: "Warzywa i owoce",
      maliny: "Warzywa i owoce",
      marchewka: "Warzywa i owoce",
      "mix sałat": "Warzywa i owoce",
      mięta: "Warzywa i owoce",
      ogórek: "Warzywa i owoce",
      "ogórek zielony": "Warzywa i owoce",
      papryka: "Warzywa i owoce",
      "papryka czerwona": "Warzywa i owoce",
      "papryczka chili": "Warzywa i owoce",
      pomarańcza: "Warzywa i owoce",
      pomidor: "Warzywa i owoce",
      "pomidorki koktajlowe": "Warzywa i owoce",
      "pomidory krojone": "Warzywa i owoce",
      rukola: "Warzywa i owoce",
      "sałata rzymska": "Warzywa i owoce",
      szczypiorek: "Warzywa i owoce",

      boczek: "Mięso i ryby",
      "boczek wędzony": "Mięso i ryby",
      kurczak: "Mięso i ryby",
      "mięso mielone": "Mięso i ryby",
      "mięso z uda kurczaka": "Mięso i ryby",
      "pierś z kurczaka": "Mięso i ryby",
      "polędwiczki kurczaka": "Mięso i ryby",
      śledź: "Mięso i ryby",
      wieprzowina: "Mięso i ryby",
      łosoś: "Mięso i ryby",
      "łosoś wędzony": "Mięso i ryby",

      jajka: "Nabiał i jajka",
      "jogurt skyr": "Nabiał i jajka",
      mleko: "Nabiał i jajka",
      "mleko kokosowe": "Nabiał i jajka",
      "mleko skondensowane odchudzone": "Nabiał i jajka",
      "napój owsiany": "Nabiał i jajka",
      "napój sojowy": "Nabiał i jajka",
      parmezan: "Nabiał i jajka",
      "serek kanapkowy": "Nabiał i jajka",
      "serek wiejski": "Nabiał i jajka",
      "śmietana 18%": "Nabiał i jajka",
      "śmietanka 30%": "Nabiał i jajka",
      twaróg: "Nabiał i jajka",
      "twaróg chudy": "Nabiał i jajka",

      bułka: "Zboża i pieczywo",
      "bułka tarta": "Zboża i pieczywo",
      "kasza bulgur": "Zboża i pieczywo",
      "komosa ryżowa": "Zboża i pieczywo",
      kuskus: "Zboża i pieczywo",
      makaron: "Zboża i pieczywo",
      "mąka pszenna": "Zboża i pieczywo",
      piernik: "Zboża i pieczywo",
      "płatki owsiane": "Zboża i pieczywo",
      "ryż basmati": "Zboża i pieczywo",
      "ryż jaśminowy": "Zboża i pieczywo",
      "ryż parboiled": "Zboża i pieczywo",
      tortilla: "Zboża i pieczywo",

      ketchup: "Tłuszcze i sosy",
      majonez: "Tłuszcze i sosy",
      masło: "Tłuszcze i sosy",
      "masło orzechowe": "Tłuszcze i sosy",
      musztarda: "Tłuszcze i sosy",
      ocet: "Tłuszcze i sosy",
      olej: "Tłuszcze i sosy",
      "olej sezamowy": "Tłuszcze i sosy",
      oliwa: "Tłuszcze i sosy",
      "pasta gochujang": "Tłuszcze i sosy",
      "sok z cytryny": "Tłuszcze i sosy",
      "sos sojowy": "Tłuszcze i sosy",
      "sos teriyaki": "Tłuszcze i sosy",
      tahini: "Tłuszcze i sosy",
      "wino białe": "Tłuszcze i sosy",

      cynamon: "Przyprawy i dodatki",
      curry: "Przyprawy i dodatki",
      cukier: "Przyprawy i dodatki",
      "czosnek suszony": "Przyprawy i dodatki",
      czosnek: "Przyprawy i dodatki",
      "ekstrakt waniliowy": "Przyprawy i dodatki",
      erytrytol: "Przyprawy i dodatki",
      "gorczyca mielona": "Przyprawy i dodatki",
      "grzyby suszone": "Przyprawy i dodatki",
      imbir: "Przyprawy i dodatki",
      kakao: "Przyprawy i dodatki",
      kolendra: "Przyprawy i dodatki",
      "koncentrat pomidorowy": "Przyprawy i dodatki",
      koperek: "Przyprawy i dodatki",
      kumin: "Przyprawy i dodatki",
      miód: "Przyprawy i dodatki",
      "nasiona chia": "Przyprawy i dodatki",
      "natka pietruszki": "Przyprawy i dodatki",
      "odżywka białkowa": "Przyprawy i dodatki",
      "orzechy nerkowca": "Przyprawy i dodatki",
      "papryka chili": "Przyprawy i dodatki",
      "papryka wędzona": "Przyprawy i dodatki",
      przyprawa: "Przyprawy i dodatki",
      "przyprawa do kurczaka": "Przyprawy i dodatki",
      "przyprawa korzenna": "Przyprawy i dodatki",
      rozmaryn: "Przyprawy i dodatki",
      sezam: "Przyprawy i dodatki",
      "ziele angielskie": "Przyprawy i dodatki",
    })
  );

  function canonicalName(name) {
    return String(name || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("pl-PL");
  }

  function normalizeCheckedList(list) {
    if (!Array.isArray(list)) return [];
    return [...new Set(list.map(canonicalName).filter(Boolean))].sort((left, right) =>
      left.localeCompare(right, "pl")
    );
  }

  function readStoredState() {
    if (!storageKey) return null;
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!parsed || !Array.isArray(parsed.checked)) return null;
      return {
        checked: normalizeCheckedList(parsed.checked),
        pending: Boolean(parsed.pending),
      };
    } catch {
      return null;
    }
  }

  const storedState = readStoredState();
  const checkedSet = new Set(
    storedState ? storedState.checked : normalizeCheckedList(payload.checked)
  );

  function writeStoredState(pending) {
    if (!storageKey) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          checked: getCheckedList(),
          pending: Boolean(pending),
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // Local cache is best-effort only.
    }
  }

  function setSaveStatus(message, state) {
    if (!saveStatusNode) return;
    saveStatusNode.textContent = message || "";
    if (state) {
      saveStatusNode.dataset.state = state;
    } else {
      saveStatusNode.removeAttribute("data-state");
    }
  }

  function getCheckedList() {
    return Array.from(checkedSet).sort((left, right) => left.localeCompare(right, "pl"));
  }

  function categorizeIngredient(name) {
    const key = canonicalName(name);
    if (categoryMap.has(key)) return categoryMap.get(key);

    if (/(kurcz|łosoś|śledź|boczek|mięso|wieprz|woł|ryba)/u.test(key)) return "Mięso i ryby";
    if (/(jaj|mleko|jogurt|skyr|twaróg|serek|ser|śmietan)/u.test(key)) return "Nabiał i jajka";
    if (/(ryż|makaron|kasza|mąka|płatki|kuskus|komosa|buł|tortilla|pieczywo)/u.test(key)) return "Zboża i pieczywo";
    if (/(olej|oliwa|sos|ketchup|majonez|musztarda|ocet|masło|tahini|pasta)/u.test(key)) return "Tłuszcze i sosy";
    if (/(przypraw|czosnek|cynamon|curry|kumin|kolendra|koperek|natka|miód|cukier|erytrytol|sezam|orzech|chia)/u.test(key)) return "Przyprawy i dodatki";
    if (/(papryk|pomidor|ogórek|cebula|marchew|sałat|rukola|ananas|awokado|malin|cytryn|limonk|granat|dynia|fasol|kukurydz)/u.test(key)) return "Warzywa i owoce";

    return "Inne";
  }

  function formatAmount(value) {
    if (!Number.isFinite(value)) return "";
    return numberFormat.format(Math.round(value * 100) / 100);
  }

  function appendText(parent, tagName, text, className) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function formatAmountWithUnit(amount, unit) {
    const cleanUnit = String(unit || "").trim();
    if (!Number.isFinite(amount) || amount <= 0) return cleanUnit || "do smaku";
    return cleanUnit ? `${formatAmount(amount)} ${cleanUnit}` : formatAmount(amount);
  }

  function scaleAmount(item) {
    const amount = Number(item.amount);
    const plannedServings = Number(item.plannedServings || 1);
    const recipeServings = Number(item.recipeServings || 1);

    if (!Number.isFinite(amount) || amount <= 0) return 0;
    if (!Number.isFinite(plannedServings) || plannedServings <= 0) return 0;
    if (!Number.isFinite(recipeServings) || recipeServings <= 0) return amount * plannedServings;

    return (amount * plannedServings) / recipeServings;
  }

  function groupItems(rawItems) {
    const groups = new Map();

    rawItems.forEach((item) => {
      const name = String(item.name || "").trim();
      const key = canonicalName(name);
      if (!key) return;

      const unit = String(item.unit || "").trim();
      const scaledAmount = scaleAmount(item);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          name,
          totals: new Map(),
          details: [],
          notes: new Set(),
        });
      }

      const group = groups.get(key);
      group.totals.set(unit, (group.totals.get(unit) || 0) + scaledAmount);
      if (item.note) group.notes.add(String(item.note));
      group.details.push({
        amount: scaledAmount,
        unit,
        note: item.note || "",
        recipeTitle: item.recipeTitle || "Przepis",
        recipeUrl: item.recipeUrl || "",
        dayName: item.dayName || "",
        mealName: item.mealName || "",
        plannedServings: item.plannedServings || 1,
      });
    });

    return Array.from(groups.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "pl")
    );
  }

  function renderTotals(group) {
    return Array.from(group.totals.entries())
      .map(([unit, amount]) => formatAmountWithUnit(amount, unit))
      .filter(Boolean)
      .join(" + ");
  }

  function groupRecipeDetails(details) {
    const byRecipe = new Map();

    details.forEach((detail) => {
      const key = [
        detail.recipeUrl || detail.recipeTitle,
        detail.recipeTitle,
        detail.unit,
        detail.note,
      ].join("|");

      if (!byRecipe.has(key)) {
        byRecipe.set(key, {
          amount: 0,
          unit: detail.unit,
          note: detail.note,
          recipeTitle: detail.recipeTitle,
          recipeUrl: detail.recipeUrl,
          meals: [],
        });
      }

      const grouped = byRecipe.get(key);
      grouped.amount += detail.amount;

      const meal = [detail.dayName, detail.mealName].filter(Boolean).join(" · ");
      if (meal && !grouped.meals.includes(meal)) {
        grouped.meals.push(meal);
      }
    });

    return Array.from(byRecipe.values()).sort((left, right) =>
      left.recipeTitle.localeCompare(right.recipeTitle, "pl")
    );
  }

  function handleCheckedChange(group, checked) {
    if (checked) {
      checkedSet.add(group.key);
    } else {
      checkedSet.delete(group.key);
    }

    writeStoredState(true);
    render();
    queueSave();
  }

  function createShoppingItem(group) {
    const checked = checkedSet.has(group.key);
    const details = document.createElement("details");
    details.className = checked
      ? "weekly-shopping-item weekly-shopping-item--checked"
      : "weekly-shopping-item";
    details.dataset.shoppingKey = group.key;

    const summary = document.createElement("summary");
    summary.className = "weekly-shopping-item__summary";

    const checkbox = document.createElement("input");
    checkbox.className = "weekly-shopping-item__checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.setAttribute("aria-label", checked ? `Oznacz ${group.name} jako niekupione` : `Oznacz ${group.name} jako kupione`);
    checkbox.addEventListener("click", (event) => {
      event.stopPropagation();
    });
    checkbox.addEventListener("change", () => {
      handleCheckedChange(group, checkbox.checked);
    });
    summary.appendChild(checkbox);

    appendText(summary, "span", group.name, "weekly-shopping-item__name");
    appendText(summary, "span", renderTotals(group), "weekly-shopping-item__total");
    details.appendChild(summary);

    if (group.notes.size) {
      appendText(
        details,
        "p",
        Array.from(group.notes).join("; "),
        "weekly-shopping-item__note"
      );
    }

    const detailList = document.createElement("ul");
    detailList.className = "weekly-shopping-item__details";

    groupRecipeDetails(group.details).forEach((detail) => {
      const item = document.createElement("li");
      const amount = appendText(
        item,
        "span",
        formatAmountWithUnit(detail.amount, detail.unit),
        "weekly-shopping-item__detail-amount"
      );
      amount.setAttribute("aria-label", "Ilość");

      const recipe = document.createElement(detail.recipeUrl ? "a" : "span");
      recipe.className = "weekly-shopping-item__recipe";
      recipe.textContent = detail.recipeTitle;
      if (detail.recipeUrl) recipe.href = detail.recipeUrl;
      item.appendChild(recipe);

      appendText(item, "span", detail.meals.join("; "), "weekly-shopping-item__meal");

      if (detail.note) {
        appendText(item, "span", detail.note, "weekly-shopping-item__detail-note");
      }

      detailList.appendChild(item);
    });

    details.appendChild(detailList);
    return details;
  }

  function renderShoppingGroups(groups, container, boughtGroups) {
    const activeGroups = groups.filter((group) => !checkedSet.has(group.key));

    if (!activeGroups.length && !boughtGroups.length) {
      appendText(container, "p", "Brak składników do pokazania.", "text-gray-600");
      return;
    }

    if (!activeGroups.length && boughtGroups.length) {
      appendText(container, "p", "Wszystko kupione.", "text-gray-600");
    }

    if (activeGroups.length) {
      const list = document.createElement("div");
      list.className = "weekly-shopping-categories";
      const byCategory = new Map(categoryOrder.map((category) => [category, []]));

      activeGroups.forEach((group) => {
        const category = categorizeIngredient(group.name);
        if (!byCategory.has(category)) byCategory.set(category, []);
        byCategory.get(category).push(group);
      });

      categoryOrder.forEach((category) => {
        const categoryGroups = byCategory.get(category) || [];
        if (!categoryGroups.length) return;

        const categoryColumn = document.createElement("section");
        categoryColumn.className = [
          "weekly-shopping-category",
          categoryClasses.get(category) || "weekly-shopping-category--other",
        ].join(" ");
        const categoryTitle = document.createElement("h3");
        categoryTitle.className = "weekly-shopping-category__title";
        const categoryIcon = document.createElement("i");
        categoryIcon.className = categoryIcons.get(category) || "fas fa-basket-shopping";
        categoryIcon.setAttribute("aria-hidden", "true");
        categoryTitle.appendChild(categoryIcon);
        appendText(categoryTitle, "span", category);
        categoryColumn.appendChild(categoryTitle);

        const categoryItems = document.createElement("div");
        categoryItems.className = "weekly-shopping-list__items";
        categoryGroups.forEach((group) => {
          categoryItems.appendChild(createShoppingItem(group));
        });

        categoryColumn.appendChild(categoryItems);
        list.appendChild(categoryColumn);
      });

      container.appendChild(list);
    }

    renderBoughtGroups(boughtGroups, container);
  }

  function renderBoughtGroups(groups, container) {
    if (!groups.length) return;

    const categoryColumn = document.createElement("section");
    categoryColumn.className = "weekly-shopping-bought weekly-shopping-category weekly-shopping-category--other";

    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "weekly-shopping-category__title";
    const categoryIcon = document.createElement("i");
    categoryIcon.className = "fas fa-check";
    categoryIcon.setAttribute("aria-hidden", "true");
    categoryTitle.appendChild(categoryIcon);
    appendText(categoryTitle, "span", "Kupione");
    categoryColumn.appendChild(categoryTitle);

    const categoryItems = document.createElement("div");
    categoryItems.className = "weekly-shopping-list__items";
    groups.forEach((group) => {
      categoryItems.appendChild(createShoppingItem(group));
    });

    categoryColumn.appendChild(categoryItems);
    container.appendChild(categoryColumn);
  }

  function renderMissingRecipes(rawMissing, container) {
    const byRecipe = new Map();

    rawMissing.forEach((item) => {
      const title = item.recipeTitle || "Przepis";
      const key = item.recipeUrl || title;
      if (!byRecipe.has(key)) {
        byRecipe.set(key, {
          title,
          url: item.recipeUrl || "",
          uses: [],
        });
      }
      byRecipe.get(key).uses.push([item.dayName, item.mealName].filter(Boolean).join(" · "));
    });

    const missing = Array.from(byRecipe.values()).sort((left, right) =>
      left.title.localeCompare(right.title, "pl")
    );
    if (!missing.length) return;

    const warning = document.createElement("div");
    warning.className = "weekly-shopping-missing alert alert-warning";
    appendText(
      warning,
      "p",
      "Te przepisy nie mają jeszcze uzupełnionych składników do zakupów:",
      "weekly-shopping-missing__title"
    );

    const list = document.createElement("ul");
    missing.forEach((item) => {
      const row = document.createElement("li");
      const recipe = document.createElement(item.url ? "a" : "span");
      recipe.textContent = item.title;
      if (item.url) recipe.href = item.url;
      row.appendChild(recipe);
      appendText(row, "span", ` (${item.uses.length}x)`, "weekly-shopping-missing__count");
      list.appendChild(row);
    });

    warning.appendChild(list);
    container.appendChild(warning);
  }

  function updateCount(total, bought) {
    if (!countNode) return;
    const base = total === 1 ? "1 składnik" : `${total} składników`;
    countNode.textContent = bought ? `${base}, ${bought} kupione` : base;
  }

  function render() {
    const boughtGroups = groups.filter((group) => checkedSet.has(group.key));
    root.innerHTML = "";
    renderShoppingGroups(groups, root, boughtGroups);
    renderMissingRecipes(missingRecipes, root);
    updateCount(groups.length, boughtGroups.length);
  }

  function queueSave() {
    if (saveTimer) window.clearTimeout(saveTimer);
    setSaveStatus("Zapisywanie...", "saving");
    saveTimer = window.setTimeout(saveCheckedState, saveDelayMs);
  }

  function waitForFirebase(timeoutMs) {
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
      const tick = () => {
        if (window.firebase && firebase.auth) {
          resolve(firebase);
          return;
        }
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Firebase auth is not available"));
          return;
        }
        window.setTimeout(tick, 100);
      };
      tick();
    });
  }

  async function getFirebaseToken() {
    const firebaseApp = await waitForFirebase(5000);
    if (!firebaseApp.apps.length) {
      firebaseApp.initializeApp(firebaseConfig);
    }
    const auth = firebaseApp.auth();

    if (!auth.currentUser) {
      const provider = new firebaseApp.auth.GithubAuthProvider();
      await auth.signInWithPopup(provider);
    }

    if (!auth.currentUser) {
      throw new Error("User is not signed in");
    }

    return auth.currentUser.getIdToken();
  }

  async function saveCheckedState() {
    saveTimer = null;
    if (isSaving) {
      queueSave();
      return;
    }
    if (!planSlug || !workerUrl) {
      setSaveStatus("Błąd zapisu", "error");
      return;
    }

    isSaving = true;
    setSaveStatus("Zapisywanie...", "saving");

    try {
      const firebaseToken = await getFirebaseToken();
      const response = await fetch(`${workerUrl}/weekly-shopping`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseToken,
          planSlug,
          checked: getCheckedList(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }

      writeStoredState(false);
      setSaveStatus("Zapisano", "saved");
    } catch (error) {
      console.error("Weekly shopping save failed:", error);
      writeStoredState(true);
      setSaveStatus("Błąd zapisu", "error");
    } finally {
      isSaving = false;
    }
  }

  async function refreshCheckedStateFromRemote() {
    if (!planSlug || !workerUrl || storedState?.pending) return;

    try {
      const response = await fetch(`${workerUrl}/weekly-shopping?plan=${encodeURIComponent(planSlug)}`);
      if (!response.ok) return;
      const data = await response.json();
      const remoteChecked = normalizeCheckedList(data.checked);
      checkedSet.clear();
      remoteChecked.forEach((key) => checkedSet.add(key));
      writeStoredState(false);
      render();
    } catch (error) {
      console.warn("Weekly shopping remote refresh failed:", error);
    }
  }

  const groups = groupItems(items);
  render();
  refreshCheckedStateFromRemote();
})();
