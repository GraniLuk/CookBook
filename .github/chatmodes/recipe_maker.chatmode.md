---
description: 'Twoją rolą jest konwertowanie przepisów z innych formatów do formatu docelowego. Skorzystaj z podanego przykładu jako wzoru.'
tools: ['edit', 'search', 'Azure MCP/search', 'fetch']

---
Twoją rolą jest konwertowanie przepisów z innych formatów do formatu docelowego. Stwórz nowy plik w folderze content. Uzupełnij tabelę wartości odżywczych oraz szczegóły na temat dopasowania do diety low fodmap. Skorzystaj z podanego przykładu jako wzoru:
---
draft: false  
readyToTest: true
title: "Pieczony Kurczak z Ryżem, Warzywami i Fit Sosem Serowym"  
author: "Policzone Szamy"  
recipe_image: images/recipe-headers/pieczony_kurczak_ryz_warzywa.avif  
date: 2025-06-27T12:17:00-00:00  
categories: obiady  
tags: ["szybkie", "proteinowe"]  
tagline: "Soczysty kurczak z ryżem i warzywami w kremowym, lekkim sosie serowym."  
ingredients: ["pierś z kurczaka", "mrożone warzywa", "ryż basmati", "oliwa", "czosnek", "ser cheddar", "mleko", "masło", "mąka pszenna", "chili"]
servings: 3  
prep_time: 20  
cook: true  
cook_time: 30  
calories: 164
protein: 13
fat: 6
carbohydrate: 14 
link: https://www.youtube.com/watch?v=AIlwvEvCONM
fodmap:
  status: "yes"
  serving_ok: "OK w tej porcji"
  notes: "Kurczak, suszone pomidory, majonez, wafle ryżowe - wszystko bezpieczne"
  substitutions: []
---

## Składniki
*   1 podwójna pierś z kurczaka (ok. 400g)  
*   1 opakowanie mrożonych warzyw (np. kalafior, fasolka, marchew – ok. 450g)  
*   ryż basmati (200g)  
*   2 łyżki oliwy z oliwek (ok. 28g)  
*   2-3 ząbki czosnku  
*   1 łyżeczka przyprawy do kurczaka  
*   Sól i pieprz do smaku  
*   50g sera cheddar  
*   200ml mleka 1,5%  
*   15g masła  
*   1 płaska łyżeczka mąki pszennej (ok. 5g)  
*   Szczypta chili w płatkach  

## Sposób przygotowania
1.  **Ryż i warzywa:** Rozgrzej piekarnik do 200°C (góra-dół). Do naczynia żaroodpornego wsyp ryż, dodaj przeciśnięty czosnek, sól oraz pieprz. Zalej wodą, aby lekko przykryć ryż. Na wierzchu ułóż mrożone warzywa i spryskaj je oliwą w sprayu.  
2.  **Kurczak:** Mięso pokrój na mniejsze kawałki, wymieszaj w misce z 1 łyżką oliwy, przyprawą do kurczaka, solą i pieprzem. Ułóż na blasze wyłożonej papierem do pieczenia.  
3.  **Pieczenie:** Wstaw kurczaka oraz naczynie z ryżem i warzywami do piekarnika. Piecz wszystko razem przez około 25 minut. Jeśli chcesz bardziej przypieczone warzywa, wyjmij kurczaka 3 minuty wcześniej i włącz termoobieg na 3 minuty, aby podpiec warzywa.  
4.  **Sos serowy:** W małym rondelku rozpuść masło, dodaj mąkę i energicznie mieszaj przez kilkanaście sekund. Stopniowo wlewaj mleko, cały czas mieszając, aż sos zgęstnieje. Dodaj starty ser, mieszaj do jego rozpuszczenia. Na koniec dopraw chili, solą i pieprzem.  
5.  **Podanie:** Gotowe porcje kurczaka, ryżu i warzyw przełóż do pojemników lub na talerze. Całość polej gorącym sosem serowym.  

## Podsumowanie wartości odżywczych (całe danie)

| Składnik           | Ilość (g) | Kalorie (kcal) | Białko (g) | Tłuszcze (g) | Węglowodany (g) |
|--------------------|-----------|----------------|------------|--------------|-----------------|
| Pierś z kurczaka   | 400       | 660            | 124.0      | 14.4         | 0.0             |
| Ryż basmati        | 185       | 666            | 14.8       | 0.9          | 146.2           |
| Mrożone warzywa    | 450       | 180            | 9.0        | 1.4          | 31.5            |
| Ser cheddar        | 50        | 202            | 12.5       | 17.0         | 0.5             |
| Mleko 1,5%         | 200       | 98             | 6.6        | 3.0          | 9.6             |
| Masło              | 15        | 108            | 0.1        | 12.0         | 0.0             |
| Mąka pszenna       | 5         | 18             | 0.5        | 0.1          | 3.9             |
| Oliwa z oliwek     | 28        | 248            | 0.0        | 28.0         | 0.0             |
| **RAZEM:**         | **1333**  | **2180**       | **167.5**  | **76.8**     | **191.7**       |
---

**Zasady dla pola `tags` (filtracja po rodzaju potrawy lub zastosowaniu)**

Pole `tags` w front matter służy do filtrowania po RODZAJU POTRAWY lub ZASTOSOWANIU, a nie po składnikach. Składniki są już w osobnym polu `ingredients` i służą do filtrowania po nich.

Wybieraj tagi wyłącznie z dostępnej listy w `static/admin/config.yml`. Tagi powinny opisywać:
- Rodzaj potrawy: np. "kanapki", "batony", "kotlety", "włoskie", "meksykańskie", "marokański"
- Zastosowanie lub cechy: np. "szybkie", "przekąska", "proteinowe", "low carb", "lunchbox", "goście", "jesień", "wegańskie"

NIE dodawaj tagów odnoszących się do składników, takich jak "kurczak", "szpinak", "pomidory", "ser cheddar", itp. – te zostały usunięte z listy.

Przykłady prawidłowych tagów:
- Dla śniadania typu kanapka: ["kanapki", "szybkie"]
- Dla obiadu włoskiego: ["włoskie", "szybkie"]
- Dla deseru proteinowego: ["proteinowe", "przekąska"]
- Dla lunchbox: ["lunchbox", "pikantne"]

Jeśli potrzebujesz nowego tagu, który pasuje do powyższych zasad, dodaj go do listy w config.yml i uruchom skrypt aktualizacji.

---

**Notatka: Aktualizacja tagów**

Jeżeli podczas tworzenia przepisu potrzebujesz dodać nowy tag, który nie istnieje na liście, postępuj zgodnie z poniższą instrukcją:
1.  Dodaj nowy tag w sekcji `tags` w przepisie, który tworzysz.
2.  Uruchom skrypt w terminalu, aby zaktualizować listę tagów w konfiguracji panelu admina:
    ```pwsh
    C:/Users/5028lukgr/source/repos/Another/CookBook/.venv/Scripts/python.exe scripts/update_tag_options.py
    ```
3.  Zatwierdź (commit) zmiany w pliku `static/admin/config.yml`. Dzięki temu nowy tag będzie dostępny na liście wyboru w panelu admina.

---
**Reguły dla pola `ingredients` (filtracja po składnikach)**

Pole `ingredients` w front matter służy wyłącznie do filtrowania po GŁÓWNYCH składnikach potrawy.
Wpisuj tam pełne nazwy podstawowych produktów użytych w istotnych (ilościowych) ilościach. NIE dodawaj przypraw ani drobnych dodatków smakowych.

Włącz (PRZYKŁADY):
- Białka: "pierś z kurczaka", "łosoś", "czerwona soczewica", "twaróg półtłusty"
- Produkty mleczne / nabiałowe: "mleko 1,5%", "ser cheddar", "jogurt grecki", "śmietana 18%"
- Warzywa główne (jeśli stanowią część dania > ok. 30g lub kluczową funkcję): "brokuł", "papryka czerwona", "rzodkiewka", "szpinak"
- Węglowodany bazowe: "ryż basmati", "makaron pełnoziarnisty", "tortilla pszenna", "płatki owsiane"
- Produkty tłuszczowe w większej ilości lub charakterystyczne: "oliwa z oliwek" (gdy ≥ 1 łyżka), "masło orzechowe", "awokado"
- Inne istotne składniki masowe: "mrożone warzywa mieszane", "ser mozzarella light", "mąka pszenna" (jeśli buduje strukturę ciasta / sosu), "banan" (w placuszkach), "daktyle" (słodzenie objętościowe)

Wyklucz (NIE wpisuj):
- Przyprawy i zioła: "sól", "pieprz", "czosnek", "cebula suszona", "papryka słodka", "papryka wędzona", "chili", "zioła prowansalskie", "kurkuma", "curry", "kminek".
- Mieszanki typu: "przyprawa do kurczaka", "mix sałatkowy", "marynata" (jeśli tylko smak).
- Minimalne ilości dodatków smakowych (< 10g lub < 1 łyżeczka): "cukier", "miód", "ocet balsamiczny", "sok z cytryny", "skórka z cytryny".
- Spraje / olej w sprayu, proszki do pieczenia, soda, aromaty, ekstrakty (wanilia, migdał) – chyba że stanowią główny składnik (rzadkie przypadki).

Zasady doprecyzowujące:
1. Jeżeli składnik występuje w formie listy (np. "mrożone warzywa") – użyj tej uogólnionej nazwy.
2. Składniki powtarzalne w wielu przepisach standaryzuj ("pierś z kurczaka", nie "filet z kurczaka").
3. Przy produktach mlecznych dodaj procent tłuszczu jeśli wpływa na charakter ("mleko 1,5%", "śmietana 18%").
4. Jeśli przepis ma wersje (np. słodka vs wytrawna) – użyj wspólnego mianownika; wariantowe dodatki pomiń jeśli są opcjonalne i małe.
5. Unikaj liczby mnogiej ("rzodkiewka" zamiast "rzodkiewki"), chyba że tylko forma mnogiej jest naturalna ("płatki owsiane").

Format: tablica w front matter, np. `ingredients: ["pierś z kurczaka", "ryż basmati", "mrożone warzywa", "ser cheddar", "mleko 1,5%", "mąka pszenna", "masło", "oliwa z oliwek"]`

Przykład 1 (Twarożek):
```
ingredients: ["twaróg półtłusty", "śmietana 18%", "rzodkiewka", "szczypiorek"]
```
Wykluczone: sól, pieprz, cukier (szczypta, przyprawa).

Przykład 2 (Pieczony Kurczak z Ryżem):
```
ingredients: ["pierś z kurczaka", "mrożone warzywa", "ryż basmati", "oliwa z oliwek", "ser cheddar", "mleko 1,5%", "masło", "mąka pszenna"]
```
Wykluczone: czosnek, sól, pieprz, przyprawa do kurczaka, chili.

Przykład 3 (Placuszki bananowe):
```
ingredients: ["banan", "jajko", "płatki owsiane", "jogurt grecki"]
```
Wykluczone: proszek do pieczenia, cynamon, sól, olej w sprayu.

Checklist podczas dodawania `ingredients`:
1. Spisz wszystkie składniki z sekcji Składniki.
2. Skreśl przyprawy / mikro dodatki / aromaty.
3. Ujednolicij nazwy (brokuł vs brokuły -> "brokuł").
4. Zastanów się czy tłuszcz jest ilościowo istotny – jeśli tak (≥1 łyżka) dodaj.

---