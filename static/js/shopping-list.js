(function () {
  "use strict";

  const LIST_PATH = ["shoppingLists", "current", "items"];
  const PAGE_URL = `${window.baseUrl || ""}/shopping-list/`;
  const firebaseConfig = {
    apiKey: "AIzaSyBlDt8i7XqmibwycGXIpYKBj1G5MS7BDqo",
    authDomain: "cookbook-ee262.firebaseapp.com",
    projectId: "cookbook-ee262",
    storageBucket: "cookbook-ee262.firebasestorage.app",
    messagingSenderId: "693621425800",
    appId: "1:693621425800:web:098cb3d04f2036415bc13d",
    measurementId: "G-P9537SX3LM",
  };

  const categoryOrder = [
    "Warzywa i owoce",
    "Mięso i ryby",
    "Nabiał i jajka",
    "Zboża i pieczywo",
    "Tłuszcze i sosy",
    "Przyprawy i dodatki",
    "Inne",
  ];

  const categoryIcons = {
    "Warzywa i owoce": "fas fa-carrot",
    "Mięso i ryby": "fas fa-drumstick-bite",
    "Nabiał i jajka": "fas fa-egg",
    "Zboża i pieczywo": "fas fa-bread-slice",
    "Tłuszcze i sosy": "fas fa-bottle-droplet",
    "Przyprawy i dodatki": "fas fa-mortar-pestle",
    Inne: "fas fa-basket-shopping",
  };

  const categoryClasses = {
    "Warzywa i owoce": "weekly-shopping-category--produce",
    "Mięso i ryby": "weekly-shopping-category--protein",
    "Nabiał i jajka": "weekly-shopping-category--dairy",
    "Zboża i pieczywo": "weekly-shopping-category--grains",
    "Tłuszcze i sosy": "weekly-shopping-category--sauces",
    "Przyprawy i dodatki": "weekly-shopping-category--spices",
    Inne: "weekly-shopping-category--other",
  };

  const numberFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });
  let auth = null;
  let db = null;
  let currentUser = null;
  let unsubscribe = null;
  let widgetUnsubscribe = null;
  let pageItems = [];
  let widgetItems = [];

  function showToast(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
      return;
    }

    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.classList.add("toast-notification--visible"), 10);
    window.setTimeout(() => {
      toast.classList.remove("toast-notification--visible");
      window.setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function canonicalName(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("pl-PL");
  }

  function documentId(name, unit) {
    return encodeURIComponent(`${canonicalName(name)}|${canonicalName(unit)}`);
  }

  function roundAmount(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return 0;
    return Math.round(amount * 100) / 100;
  }

  function formatAmount(amount, unit) {
    const cleanUnit = String(unit || "").trim();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) return cleanUnit || "";
    return cleanUnit ? `${numberFormat.format(roundAmount(amount))} ${cleanUnit}` : numberFormat.format(roundAmount(amount));
  }

  function categorizeIngredient(name) {
    const key = canonicalName(name);
    if (/(kurcz|łosoś|śledź|boczek|mięso|wieprz|woł|ryba|indyk|krewet)/u.test(key)) return "Mięso i ryby";
    if (/(jaj|mleko|jogurt|skyr|twaróg|serek|ser|śmietan|mozzarella|feta)/u.test(key)) return "Nabiał i jajka";
    if (/(ryż|makaron|kasza|mąka|płatki|kuskus|komosa|buł|tortilla|pieczywo|chleb)/u.test(key)) return "Zboża i pieczywo";
    if (/(olej|oliwa|sos|ketchup|majonez|musztarda|ocet|masło|tahini|pasta|mleko kokosowe)/u.test(key)) return "Tłuszcze i sosy";
    if (/(przypraw|czosnek|cynamon|curry|kumin|kolendra|koperek|natka|miód|cukier|erytrytol|sezam|orzech|chia|kakao|imbir)/u.test(key)) return "Przyprawy i dodatki";
    if (/(papryk|pomidor|ogórek|cebula|marchew|sałat|rukola|ananas|awokado|malin|cytryn|limonk|granat|dynia|fasol|kukurydz|ziemniak|cukinia|truskawk|banan|kapust|rzodkiew)/u.test(key)) return "Warzywa i owoce";
    return "Inne";
  }

  function waitForFirebase(timeoutMs) {
    const startedAt = Date.now();
    return new Promise((resolve, reject) => {
      const tick = () => {
        if (window.firebase && firebase.auth && firebase.firestore) {
          if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
          auth = firebase.auth();
          db = firebase.firestore();
          resolve();
          return;
        }
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Firebase SDK is not available"));
          return;
        }
        window.setTimeout(tick, 100);
      };
      tick();
    });
  }

  function itemsCollection() {
    return db.collection(LIST_PATH[0]).doc(LIST_PATH[1]).collection(LIST_PATH[2]);
  }

  function sourceKey(source) {
    return [source.type || "manual", source.id || source.url || source.title || "manual"].join(":");
  }

  function mergeSources(existingSources, source) {
    const sources = Array.isArray(existingSources) ? existingSources.slice() : [];
    if (!source) return sources;
    const key = sourceKey(source);
    if (!sources.some((item) => sourceKey(item) === key)) {
      sources.push(source);
    }
    return sources;
  }

  function mergeSourceLists(...lists) {
    const merged = [];
    lists.flat().filter(Boolean).forEach((source) => {
      const key = sourceKey(source);
      if (!merged.some((item) => sourceKey(item) === key)) merged.push(source);
    });
    return merged;
  }

  function buildItem(raw, source) {
    const name = String(raw.name || "").trim();
    const unit = String(raw.unit || "").trim();
    return {
      name,
      normalizedName: canonicalName(name),
      amount: roundAmount(raw.amount || 0),
      unit,
      note: String(raw.note || "").trim(),
      category: raw.category || categorizeIngredient(name),
      checked: Boolean(raw.checked),
      source,
    };
  }

  async function signIn(providerName) {
    await waitForFirebase(5000);
    const provider = providerName === "google"
      ? new firebase.auth.GoogleAuthProvider()
      : new firebase.auth.GithubAuthProvider();
    await auth.signInWithPopup(provider);
  }

  async function ensureSignedIn() {
    await waitForFirebase(5000);
    if (auth.currentUser) return auth.currentUser;
    await signIn("github");
    return auth.currentUser;
  }

  async function addShoppingItem(raw, source) {
    await ensureSignedIn();
    const item = buildItem(raw, source);
    if (!item.name) return;
    const ref = itemsCollection().doc(documentId(item.name, item.unit));
    const now = firebase.firestore.FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const existing = snapshot.exists ? snapshot.data() : {};
      const existingAmount = roundAmount(existing.amount || 0);
      const nextAmount = roundAmount(existingAmount + item.amount);

      transaction.set(ref, {
        name: existing.name || item.name,
        normalizedName: item.normalizedName,
        amount: nextAmount,
        unit: item.unit,
        note: existing.note || item.note,
        category: existing.category || item.category,
        checked: snapshot.exists ? Boolean(existing.checked) : false,
        sources: mergeSources(existing.sources, item.source),
        createdAt: existing.createdAt || now,
        updatedAt: now,
        updatedBy: auth.currentUser ? auth.currentUser.uid : "",
      }, { merge: true });
    });
  }

  async function addItems(rawItems, source) {
    const items = Array.isArray(rawItems) ? rawItems : [];
    if (!items.length) {
      showToast("Brak składników do dodania.");
      return;
    }

    await ensureSignedIn();
    for (const item of items) {
      await addShoppingItem(item, source);
    }
    showToast(items.length === 1 ? "Dodano składnik do listy." : `Dodano ${items.length} składników do listy.`);
  }

  function parsePayload(scriptId) {
    const node = document.getElementById(scriptId);
    if (!node) return null;
    try {
      const payload = JSON.parse(node.textContent || "{}");
      return typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (error) {
      console.error("Shopping payload parse failed:", error);
      return null;
    }
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

  function payloadItems(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    return items.map((item) => ({
      name: item.name,
      amount: scaleAmount(item),
      unit: item.unit,
      note: item.note,
    }));
  }

  function setupImportButtons() {
    document.querySelectorAll("[data-shopping-action]").forEach((button) => {
      button.addEventListener("click", async () => {
        const payload = parsePayload(button.dataset.shoppingPayload);
        if (!payload) {
          showToast("Nie udało się wczytać składników.");
          return;
        }

        const source = {
          type: button.dataset.shoppingSource || "manual",
          id: payload.recipeSlug || payload.planSlug || payload.sourceId || "",
          title: payload.recipeTitle || payload.planTitle || payload.sourceTitle || "",
          url: payload.recipeUrl || payload.planUrl || window.location.href,
        };

        button.disabled = true;
        try {
          await addItems(payloadItems(payload), source);
        } catch (error) {
          console.error("Shopping import failed:", error);
          showToast("Nie udało się dodać składników.");
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  function setupWidget() {
    const widget = document.getElementById("shopping-widget");
    if (!widget) return;

    const toggle = document.getElementById("shopping-widget-toggle");
    const panel = document.getElementById("shopping-widget-panel");
    const close = document.getElementById("shopping-widget-close");

    widget.hidden = false;

    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const isOpen = !panel.hidden;
        panel.hidden = isOpen;
        toggle.setAttribute("aria-expanded", String(!isOpen));
      });
    }

    if (close && panel && toggle) {
      close.addEventListener("click", () => {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
    }

    waitForFirebase(5000).then(() => {
      auth.onAuthStateChanged((user) => {
        if (widgetUnsubscribe) widgetUnsubscribe();
        widgetUnsubscribe = null;
        if (!user) {
          widgetItems = [];
          renderWidget(false);
          return;
        }

        widgetUnsubscribe = itemsCollection().onSnapshot((snapshot) => {
          widgetItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          renderWidget(true);
        }, (error) => {
          console.error("Shopping widget listener failed:", error);
          renderWidget(true, "Nie udało się wczytać listy.");
        });
      });
    }).catch(() => {
      renderWidget(false, "Firebase niedostępny.");
    });
  }

  function renderWidget(isSignedIn, errorMessage) {
    const count = document.getElementById("shopping-widget-count");
    const body = document.getElementById("shopping-widget-body");
    if (!count || !body) return;

    if (errorMessage) {
      count.hidden = true;
      body.textContent = errorMessage;
      return;
    }

    if (!isSignedIn) {
      count.hidden = true;
      body.textContent = "Zaloguj się, aby zobaczyć listę.";
      return;
    }

    const activeItems = widgetItems.filter((item) => !item.checked);
    if (!activeItems.length) {
      count.hidden = true;
      body.textContent = "Lista jest pusta.";
      return;
    }

    count.hidden = false;
    count.textContent = String(activeItems.length);
    body.innerHTML = "";

    const list = document.createElement("ul");
    list.className = "shopping-widget__items";
    activeItems
      .sort((left, right) => String(left.normalizedName || left.name || "").localeCompare(String(right.normalizedName || right.name || ""), "pl"))
      .slice(0, 5)
      .forEach((item) => {
        const row = document.createElement("li");
        appendText(row, "span", item.name, "shopping-widget__item-name");
        appendText(row, "span", formatAmount(item.amount, item.unit), "shopping-widget__item-amount");
        list.appendChild(row);
      });

    body.appendChild(list);
    if (activeItems.length > 5) {
      appendText(body, "p", `+ ${activeItems.length - 5} więcej`, "shopping-widget__more");
    }
  }

  function appendText(parent, tagName, text, className) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function setStatus(message) {
    const status = document.getElementById("shopping-list-status");
    if (status) status.textContent = message || "";
  }

  function renderAuthState() {
    const authBox = document.getElementById("shopping-list-auth");
    const form = document.getElementById("shopping-list-manual-form");
    const clear = document.getElementById("shopping-list-clear-checked");
    if (authBox) authBox.style.display = currentUser ? "none" : "flex";
    if (form) form.toggleAttribute("hidden", !currentUser);
    if (clear) clear.disabled = !currentUser || !pageItems.some((item) => item.checked);
  }

  function sourceLabel(source) {
    if (!source) return "";
    if (source.type === "recipe") return source.title || "Przepis";
    if (source.type === "weekly-plan") return source.title || "Plan tygodniowy";
    return "Ręcznie";
  }

  function createPageItem(item) {
    const details = document.createElement("details");
    details.className = item.checked
      ? "weekly-shopping-item weekly-shopping-item--checked"
      : "weekly-shopping-item";

    const summary = document.createElement("summary");
    summary.className = "weekly-shopping-item__summary";

    const checkbox = document.createElement("input");
    checkbox.className = "weekly-shopping-item__checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = item.checked;
    checkbox.addEventListener("click", (event) => event.stopPropagation());
    checkbox.addEventListener("change", () => updateItem(item.id, { checked: checkbox.checked }, true));
    summary.appendChild(checkbox);

    appendText(summary, "span", item.name, "weekly-shopping-item__name");
    appendText(summary, "span", formatAmount(item.amount, item.unit), "weekly-shopping-item__total");
    details.appendChild(summary);

    const editor = document.createElement("form");
    editor.className = "shopping-list-item-editor";
    editor.innerHTML = `
      <label><span>Ilość</span><input class="input input-bordered input-sm" name="amount" type="number" min="0" step="0.01" value="${item.amount || ""}"></label>
      <label><span>Jednostka</span><input class="input input-bordered input-sm" name="unit" type="text" value="${escapeAttribute(item.unit || "")}"></label>
      <label><span>Notatka</span><input class="input input-bordered input-sm" name="note" type="text" value="${escapeAttribute(item.note || "")}"></label>
      <button class="btn btn-primary btn-sm" type="submit"><i class="fas fa-save" aria-hidden="true"></i><span>Zapisz</span></button>
      <button class="btn btn-ghost btn-sm" type="button" data-shopping-delete><i class="fas fa-trash" aria-hidden="true"></i><span>Usuń</span></button>
    `;
    editor.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(editor);
      await saveItemEdit(item, {
        amount: roundAmount(formData.get("amount")),
        unit: String(formData.get("unit") || "").trim(),
        note: String(formData.get("note") || "").trim(),
      });
    });
    editor.querySelector("[data-shopping-delete]").addEventListener("click", () => deleteItem(item.id));
    details.appendChild(editor);

    if (item.note) appendText(details, "p", item.note, "weekly-shopping-item__note");

    const sources = Array.isArray(item.sources) ? item.sources.map(sourceLabel).filter(Boolean) : [];
    if (sources.length) {
      appendText(details, "p", `Źródło: ${sources.join(", ")}`, "weekly-shopping-item__meal");
    }

    return details;
  }

  function escapeAttribute(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderItems() {
    const root = document.getElementById("shopping-list-items");
    if (!root) return;
    root.innerHTML = "";

    if (!currentUser) {
      setStatus("");
      renderAuthState();
      return;
    }

    if (!pageItems.length) {
      setStatus("Lista jest pusta.");
      renderAuthState();
      return;
    }

    setStatus(`${pageItems.length} pozycji, ${pageItems.filter((item) => item.checked).length} kupione`);
    const activeItems = pageItems.filter((item) => !item.checked);
    const checkedItems = pageItems.filter((item) => item.checked);
    const wrapper = document.createElement("div");
    wrapper.className = "weekly-shopping-categories shopping-list-categories";

    categoryOrder.forEach((category) => {
      const categoryItems = activeItems.filter((item) => (item.category || "Inne") === category);
      if (!categoryItems.length) return;
      wrapper.appendChild(createCategory(category, categoryItems));
    });

    if (checkedItems.length) wrapper.appendChild(createCategory("Kupione", checkedItems, true));
    root.appendChild(wrapper);
    renderAuthState();
  }

  function createCategory(category, items, bought) {
    const section = document.createElement("section");
    section.className = bought
      ? "weekly-shopping-bought weekly-shopping-category weekly-shopping-category--other"
      : `weekly-shopping-category ${categoryClasses[category] || "weekly-shopping-category--other"}`;

    const title = document.createElement("h2");
    title.className = "weekly-shopping-category__title";
    const icon = document.createElement("i");
    icon.className = bought ? "fas fa-check" : categoryIcons[category] || "fas fa-basket-shopping";
    icon.setAttribute("aria-hidden", "true");
    title.appendChild(icon);
    appendText(title, "span", category);
    section.appendChild(title);

    const list = document.createElement("div");
    list.className = "weekly-shopping-list__items";
    items.forEach((item) => list.appendChild(createPageItem(item)));
    section.appendChild(list);
    return section;
  }

  async function saveItemEdit(item, patch) {
    if (!currentUser) return;
    const nextId = documentId(item.name, patch.unit);
    if (nextId === item.id) {
      await updateItem(item.id, patch);
      return;
    }

    const oldRef = itemsCollection().doc(item.id);
    const nextRef = itemsCollection().doc(nextId);
    const now = firebase.firestore.FieldValue.serverTimestamp();

    try {
      await db.runTransaction(async (transaction) => {
        const nextSnapshot = await transaction.get(nextRef);
        const nextData = nextSnapshot.exists ? nextSnapshot.data() : {};
        const nextAmount = nextSnapshot.exists
          ? roundAmount((nextData.amount || 0) + patch.amount)
          : patch.amount;

        transaction.set(nextRef, {
          name: item.name,
          normalizedName: item.normalizedName || canonicalName(item.name),
          amount: nextAmount,
          unit: patch.unit,
          note: nextData.note || patch.note || item.note || "",
          category: nextData.category || item.category || categorizeIngredient(item.name),
          checked: nextSnapshot.exists ? Boolean(nextData.checked && item.checked) : Boolean(item.checked),
          sources: mergeSourceLists(nextData.sources || [], item.sources || []),
          createdAt: nextData.createdAt || item.createdAt || now,
          updatedAt: now,
          updatedBy: currentUser.uid,
        }, { merge: true });

        transaction.delete(oldRef);
      });
      showToast("Zapisano.");
    } catch (error) {
      console.error("Shopping item move failed:", error);
      showToast("Nie udało się zapisać zmiany.");
    }
  }

  async function updateItem(id, patch, optimistic) {
    if (!currentUser) return;
    if (optimistic) {
      const item = pageItems.find((entry) => entry.id === id);
      if (item) Object.assign(item, patch);
      renderItems();
    }
    try {
      await itemsCollection().doc(id).set({
        ...patch,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: currentUser.uid,
      }, { merge: true });
      showToast("Zapisano.");
    } catch (error) {
      console.error("Shopping item update failed:", error);
      showToast("Nie udało się zapisać zmiany.");
    }
  }

  async function deleteItem(id) {
    if (!currentUser) return;
    try {
      await itemsCollection().doc(id).delete();
      showToast("Usunięto z listy.");
    } catch (error) {
      console.error("Shopping item delete failed:", error);
      showToast("Nie udało się usunąć pozycji.");
    }
  }

  async function clearChecked() {
    if (!currentUser) return;
    const checked = pageItems.filter((item) => item.checked);
    if (!checked.length) return;
    const batch = db.batch();
    checked.forEach((item) => batch.delete(itemsCollection().doc(item.id)));
    try {
      await batch.commit();
      showToast("Wyczyszczono kupione pozycje.");
    } catch (error) {
      console.error("Shopping clear checked failed:", error);
      showToast("Nie udało się wyczyścić listy.");
    }
  }

  function subscribePage() {
    if (unsubscribe) unsubscribe();
    setStatus("Ładowanie listy...");
    unsubscribe = itemsCollection()
      .onSnapshot((snapshot) => {
        pageItems = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((left, right) => {
            const leftCategory = categoryOrder.indexOf(left.category || "Inne");
            const rightCategory = categoryOrder.indexOf(right.category || "Inne");
            if (leftCategory !== rightCategory) return leftCategory - rightCategory;
            return String(left.normalizedName || left.name || "").localeCompare(String(right.normalizedName || right.name || ""), "pl");
          });
        renderItems();
      }, (error) => {
        console.error("Shopping list listener failed:", error);
        setStatus("Nie udało się wczytać listy zakupów.");
      });
  }

  function setupPage() {
    const root = document.getElementById("shopping-list-items");
    if (!root) return;

    document.querySelectorAll("[data-shopping-auth-provider]").forEach((button) => {
      button.addEventListener("click", () => signIn(button.dataset.shoppingAuthProvider).catch(() => showToast("Błąd logowania.")));
    });

    const form = document.getElementById("shopping-list-manual-form");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        try {
          await addShoppingItem({
            name: data.get("name"),
            amount: data.get("amount") || 1,
            unit: data.get("unit"),
            note: data.get("note"),
          }, { type: "manual", id: "manual", title: "Ręcznie" });
          form.reset();
          showToast("Dodano do listy.");
        } catch (error) {
          console.error("Manual shopping add failed:", error);
          showToast("Nie udało się dodać pozycji.");
        }
      });
    }

    const clear = document.getElementById("shopping-list-clear-checked");
    if (clear) clear.addEventListener("click", clearChecked);

    waitForFirebase(5000).then(() => {
      auth.onAuthStateChanged((user) => {
        currentUser = user;
        if (user) {
          subscribePage();
        } else {
          if (unsubscribe) unsubscribe();
          pageItems = [];
          renderItems();
        }
      });
    }).catch((error) => {
      console.error(error);
      setStatus("Firebase nie jest dostępny.");
    });
  }

  function init() {
    setupImportButtons();
    setupWidget();
    setupPage();
  }

  window.shoppingList = {
    addItems,
    signIn,
    pageUrl: PAGE_URL,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
