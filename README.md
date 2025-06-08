# 🧠 Quiz GUI - Interaktywny System Quizów

Nowoczesna, webowa wersja systemu quizów z zaawansowanym algorytmem uczenia i pięknym interfejsem użytkownika.
Live at: https://jejis06.github.io/QuizGui/

![Quiz GUI](https://img.shields.io/badge/Status-Ready-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Web-blue)
![Language](https://img.shields.io/badge/Language-JavaScript-yellow)

## 📋 Opis

Quiz GUI to zaawansowany system nauki z adaptacyjnym algorytmem powtórek, który maksymalizuje efektywność uczenia się. Aplikacja została przepisana z C++ na nowoczesną technologię webową, zachowując wszystkie funkcjonalności oryginalnego systemu kolejkowego.

### ✨ Kluczowe funkcjonalności

- **🎨 Nowoczesny interfejs** - Piękny, responsywny design z animacjami
- **🧠 Inteligentny algorytm uczenia** - Adaptacyjny system powtórek oparty na psychologii nauki
- **📱 Cross-platform** - Działa w każdej przeglądarce na każdym urządzeniu
- **🎯 Zaawansowane sprawdzanie odpowiedzi** - Tolerancja błędów, wielowyrazowe odpowiedzi
- **📊 Szczegółowe statystyki** - Śledzenie postępów i analizy wyników
- **🔧 Konfigurowalne ustawienia** - Dostosowanie sposobu sprawdzania odpowiedzi

## 🚀 Jak uruchomić

### Szybki start
1. Pobierz pliki projektu
2. Otwórz `index.html` w przeglądarce
3. Załaduj plik z pytaniami (lub użyj przykładowego)
4. Rozpocznij quiz!

### Wymagania
- Nowoczesna przeglądarka internetowa (Chrome, Firefox, Safari, Edge)
- Brak dodatkowych instalacji - działa od razu!

## 📚 Jak używać

### 1. Uruchomienie quizu
1. **Załaduj plik z pytaniami** - przeciągnij lub wybierz plik `.txt`
2. **Skonfiguruj ustawienia** - znaki białe, wielkie litery, sprawdzanie błędów
3. **Kliknij "Rozpocznij Quiz"**

### 2. Podczas quizu
- **Wpisz odpowiedź** i naciśnij Enter lub kliknij "Sprawdź"
- **Wpisz "."** aby cofnąć błędną odpowiedź (jeśli była poprawna)
- **Wpisz "e"** aby zakończyć quiz
- **Kliknij "Pomiń"** aby przejść do następnego pytania

### 3. System uczenia
- **Pierwsza runda**: Wszystkie pytania zadawane raz w losowej kolejności
- **Tryb powtórki**: Błędne odpowiedzi wracają do inteligentnej kolejki
- **Adaptacyjny priorytet**: Częstsze powtarzanie trudnych pytań

## 📝 Format plików quizowych

### Podstawowy format
```
Pytanie? -Odpowiedź
```

### Przykład pliku
```
0 0 1
// Komentarz - ten tekst zostanie zignorowany
Kto napisał "Pan Tadeusz"? -Adam Mickiewicz
W którym roku Polska odzyskała niepodległość? -1918, 1918 rok
K/ Wymień trzy największe miasta Polski -Warszawa, Kraków, Wrocław
```

### Ustawienia (pierwsza linia - opcjonalne)
```
0 0 1
```
- **1. wartość**: Czy znaki białe mają znaczenie (0=nie, 1=tak)
- **2. wartość**: Czy wielkie litery mają znaczenie (0=nie, 1=tak)  
- **3. wartość**: Czy literówki są zawsze niedozwolone (0=nie, 1=tak)

### Typy pytań

#### Standardowe pytania
```
Stolica Polski? -Warszawa
```

#### Wiele możliwych odpowiedzi
```
W którym wieku żył Kopernik? -XV, XVI, 15, 16
```

#### Odpowiedzi wielowyrazowe (K/)
```
K/ Wymień polskich noblistów -Henryk Sienkiewicz, Czesław Miłosz, Wisława Szymborska
```

#### Komentarze
```
// To jest komentarz
// Sekcja historii Polski
```

## 🧠 Zaawansowany System Kolejkowy

### Algorytm adaptacyjny
Aplikacja implementuje zaawansowany algorytm uczenia składający się z dwóch faz:

#### Faza 1: Pierwsza runda
- Wszystkie pytania zadawane **raz w losowej kolejności**
- Zbieranie informacji o trudności pytań
- Jeśli wynik = 100% → opcja kontynuacji lub zakończenie

#### Faza 2: Tryb powtórki  
- **Priority Queue**: Pytania sortowane według trudności
- **F-Factor**: Pytanie nie może być powtórzone przez ostatnie 20% pytań
- **Dynamiczny priorytet**: Poprawne odpowiedzi zwiększają priorytet (rzadsze powtarzanie)
- **Natychmiastowy powrót**: Błędne odpowiedzi wracają do kolejki z niskim priorytetem

### Przykład działania
```
1. Quiz: 10 pytań
2. F-Factor = 2 (20% z 10)
3. Pytanie błędne → priorytet = 0
4. Pytanie poprawne → priorytet += wartość_czasu
5. Sortowanie: [pytanie_trudne_0, pytanie_łatwe_15, ...]
6. Kolejne pytanie: najniższy priorytet + nie w ostatnich F
```

## 🎨 Interfejs użytkownika

### Ekran startowy
- **Hero section** z wprowadzeniem
- **Upload area** z drag & drop
- **Ustawienia quizu** z przełącznikami
- **Tutorial** z instrukcjami

### Ekran quizu
- **Progress bar** pokazujący postęp
- **Wynik w czasie rzeczywistym**
- **Duże, czytelne pytania**
- **System feedbacku** (poprawne/błędne/info)

### Ekran wyników
- **Szczegółowe statystyki**
- **Procentowy wynik**
- **Ikony osiągnięć** (trofeum/medal)
- **Opcje kontynuacji**

## 🔧 Funkcje techniczne

### Sprawdzanie odpowiedzi
- **Levenshtein distance** dla tolerancji błędów
- **Normalizacja tekstu** (spacje, wielkie litery)
- **Detekcja liczb** dla ścisłego sprawdzania dat
- **Multi-word parsing** dla odpowiedzi K/

### Responsywność
- **Mobile-first design**
- **Flexible layouts**
- **Touch-friendly buttons**
- **Adaptive typography**

### Performance
- **Efficient algorithms** O(n log n) sorting
- **Memory management** dla dużych zestawów pytań
- **Smooth animations** 60fps
- **Fast file processing**

## 📊 Porównanie z wersją C++

| Funkcja | C++ (oryginał) | GUI (nowa) |
|---------|----------------|------------|
| Platform | Linux tylko | Wszystkie OS |
| Interface | Terminal | Nowoczesne GUI |
| Algorytm | ✅ | ✅ Identyczny |
| Format plików | ✅ | ✅ Kompatybilny |
| Responsywność | ❌ | ✅ |
| Instalacja | Kompilacja | Brak |
| Mobilność | ❌ | ✅ |

## 🎯 Dla kogo?

- **Studenci** przygotowujący się do egzaminów
- **Nauczyciele** tworzący materiały edukacyjne  
- **Osoby uczące się** nowych języków
- **Wszyscy** chcący efektywnie zapamiętywać informacje

## 🛠️ Rozwój projektu

### Planowane funkcje
- [ ] Import z różnych formatów (CSV, JSON)
- [ ] Eksport statystyk do plików
- [ ] Tryb multiplayer
- [ ] Integracja z bazami danych
- [ ] API dla zewnętrznych aplikacji

### Zgłaszanie błędów
Jeśli znajdziesz błąd lub masz sugestię, utwórz issue w repozytorium.

## 📄 Licencja

Ten projekt zachowuje kompatybilność z oryginalnym systemem. Kod dostępny na zasadach open source.

## 🙏 Podziękowania

Projekt bazuje na oryginalnym systemie quizów napisanym w C++. Zachowuje wszystkie algorytmy i logikę, przenosząc je do nowoczesnego środowiska webowego.

---

**Stworzono z ❤️ dla efektywnej nauki**

> "Najlepszy system uczenia to ten, który dostosowuje się do Twoich potrzeb" - Quiz GUI
