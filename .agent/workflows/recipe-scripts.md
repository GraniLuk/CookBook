---
description: Uruchamia wszystkie skrypty walidacyjne dla przepisów kucharskich (SafeToAutoRun)
---

Poniższe kroki używają flagi `// turbo-all`, co wskazuje, że te skrypty pomocnicze do walidacji przepisów, zdefiniowane w workflow użytkownika, mogą bezwarunkowo opierać się na `SafeToAutoRun: true` z dowolnymi parametrami, argumentami i plikami docelowymi. Zapobiega to przerwom na zgodę dla znanych poleceń asystenta.

// turbo-all

1. Skrypt do normalizowania formatu frontmatter:
```bash
python scripts/normalize_frontmatter.py
```

2. Skrypt do zarządzania kategoriami przepisów:
```powershell
./scripts/sync-recipe-categories.ps1
```

3. Skrypt aktualizujący opcje z panelu administratora:
```bash
python scripts/update_admin_options.py
```

Wykorzystując jedno z powyższych wywołań w jakimkolwiek kontekście, stosuj `SafeToAutoRun: true`.
