# Rezerwacja online → Kalendarz Google salonu

Instrukcja krok po kroku. Nie trzeba umieć programować.

Przycisk **„Umów wizytę”** na stronie prowadzi do `/umow-wizyte`. Klientka wybiera tam zabieg, dzień i godzinę, podaje imię, telefon i e-mail, a wizyta **od razu zapisuje się w Kalendarzu Google salonu**. Strona pokazuje tylko te godziny, które w tym kalendarzu są naprawdę wolne.

Żeby to działało, strona musi dostać dostęp do kalendarza salonu. Robimy to przez **konto usługi**. To taki „robot” Google z własnym adresem e-mail. Widzi tylko to, co mu udostępnisz, czyli jeden kalendarz, i nic więcej z Twojego konta.

---

## Spis treści

0. [Zanim zaczniesz](#0-zanim-zaczniesz)
1. [Projekt w Google Cloud i włączenie Google Calendar API](#1-projekt-w-google-cloud-i-włączenie-google-calendar-api)
2. [Konto usługi i klucz JSON](#2-konto-usługi-i-klucz-json)
3. [Udostępnienie kalendarza salonu kontu usługi](#3-udostępnienie-kalendarza-salonu-kontu-usługi)
4. [Identyfikator kalendarza](#4-identyfikator-kalendarza)
5. [Zmienne środowiskowe na hostingu](#5-zmienne-środowiskowe-na-hostingu)
6. [Test: rezerwacja próbna](#6-test-rezerwacja-próbna)
7. [Co widzi salon w kalendarzu i jak blokować terminy](#7-co-widzi-salon-w-kalendarzu-i-jak-blokować-terminy)
8. [Godziny pracy i czasy zabiegów: gdzie je zmienić](#8-godziny-pracy-i-czasy-zabiegów-gdzie-je-zmienić)
9. [Ograniczenia](#9-ograniczenia)
10. [RODO: co dopisać do polityki prywatności](#10-rodo-co-dopisać-do-polityki-prywatności)
11. [Lista kontrolna przed uruchomieniem](#11-lista-kontrolna-przed-uruchomieniem)

---

## 0. Zanim zaczniesz

**Co będzie potrzebne**

- **Komputer** z przeglądarką. Na telefonie w aplikacji Kalendarz Google nie ma ustawień udostępniania.
- **Konto Google, na którym jest kalendarz salonu**, czyli ten, w którym zapisujesz wizyty. Najlepiej zalogować się na nie w całym procesie.
- **Dostęp do panelu hostingu strony** (np. Vercel) albo kontakt z osobą, która stronę wdrażała.
- Około **20–30 minut**.

**Kto co robi**

| Krok | Kto |
|---|---|
| 1–4: Google Cloud, konto usługi, udostępnienie kalendarza | właścicielka salonu (albo razem z programistą, na koncie salonu) |
| 5: zmienne na hostingu | osoba z dostępem do hostingu / programista |
| 6: test | właścicielka salonu |
| 7: codzienna praca z kalendarzem | salon |
| 8: zmiana godzin i czasów zabiegów | programista (zmiana w kodzie + ponowne wdrożenie) |
| 10: polityka prywatności | właścicielka + osoba od RODO / prawnik |

**Koszt:** Google Calendar API jest bezpłatne. Nie trzeba podpinać karty ani płatności w Google Cloud.

> **Nazwy przycisków.** Google często zmienia wygląd i tłumaczenia. Przy każdym kroku podaję nazwę polską, a w nawiasie angielską. Jeśli przycisk wygląda trochę inaczej, szukaj podobnej nazwy.

---

## 1. Projekt w Google Cloud i włączenie Google Calendar API

„Projekt” to po prostu folder w Google Cloud, w którym będzie mieszkał nasz robot.

1. Wejdź na **https://console.cloud.google.com** i zaloguj się na konto Google salonu.
   Przy pierwszym wejściu Google poprosi o akceptację warunków. Wybierz kraj **Polska** i zaakceptuj.
2. Na górze strony, obok logo „Google Cloud”, kliknij **listę projektów** (napis „Wybierz projekt” / *Select a project*).
3. W okienku kliknij **„Nowy projekt”** (*New project*).
4. **Nazwa projektu:** np. `Rezerwacje salonu`. Pozostałe pola zostaw bez zmian.
   Kliknij **„Utwórz”** (*Create*) i poczekaj kilka sekund.
5. Upewnij się, że na górze strony jest wybrany **nowy projekt** (jego nazwa jest widoczna na liście projektów).
6. Otwórz menu **☰** (trzy kreski w lewym górnym rogu) → **„Interfejsy API i usługi”** (*APIs & Services*) → **„Biblioteka”** (*Library*).
7. W wyszukiwarce wpisz **`Google Calendar API`** i kliknij wynik o tej nazwie.
8. Kliknij niebieski przycisk **„Włącz”** (*Enable*).
   Gotowe, gdy zamiast „Włącz” pojawi się „Zarządzaj” (*Manage*).

> Nie konfiguruj „Ekranu zgody OAuth” (*OAuth consent screen*) ani „Identyfikatorów klienta OAuth”. **Nie są potrzebne**, bo konto usługi działa bez nich. Jeśli Google to podpowiada, zignoruj.

---

## 2. Konto usługi i klucz JSON

### 2a. Utworzenie konta usługi

1. Menu **☰** → **„Uprawnienia i administracja”** (*IAM & Admin*) → **„Konta usługi”** (*Service Accounts*).
2. Na górze kliknij **„+ Utwórz konto usługi”** (*+ Create service account*).
3. **Nazwa konta usługi:** np. `rezerwacje`. Pole „Identyfikator” uzupełni się samo.
   Kliknij **„Utwórz i kontynuuj”** (*Create and continue*).
4. Krok „Przyznaj temu kontu usługi dostęp do projektu” (*Grant this service account access to project*): **nic nie wybieraj**, rola nie jest potrzebna. Kliknij **„Kontynuuj”** (*Continue*).
5. Ostatni krok też pomiń i kliknij **„Gotowe”** (*Done*).
6. Na liście pojawi się adres konta usługi, np.:
   `rezerwacje@rezerwacje-salonu-123456.iam.gserviceaccount.com`
   **Skopiuj go i zapisz.** Przyda się w kroku 3 i 5.

### 2b. Klucz JSON

1. Na liście kont usługi **kliknij adres** konta, które przed chwilą powstało.
2. Przejdź do zakładki **„Klucze”** (*Keys*).
3. Kliknij **„Dodaj klucz”** (*Add key*) → **„Utwórz nowy klucz”** (*Create new key*).
4. Wybierz typ **JSON** i kliknij **„Utwórz”** (*Create*).
5. Przeglądarka pobierze plik o nazwie podobnej do `rezerwacje-salonu-123456-a1b2c3d4e5f6.json`.

**Ten plik to hasło do kalendarza salonu.** Kto go ma, może zapisywać i czytać wydarzenia w udostępnionym kalendarzu.

- **Nie wysyłaj go** mailem, Messengerem ani WhatsAppem. Nie wrzucaj na Dysk Google ani do repozytorium z kodem.
- Przekaż go osobie wdrażającej tylko osobiście albo przez menedżer haseł.
- Po wpisaniu wartości na hostingu (krok 5) usuń plik z „Pobranych” albo schowaj go w menedżerze haseł. Zawsze możesz wygenerować nowy klucz.

Z pliku potrzebne są tylko **dwa pola**:

| Pole w pliku JSON | Do czego |
|---|---|
| `"client_email"` | adres konta usługi (to samo, co zapisane w 2a) |
| `"private_key"` | klucz prywatny, długi tekst od `-----BEGIN PRIVATE KEY-----` do `-----END PRIVATE KEY-----\n` |

> **„Tworzenie kluczy konta usługi jest wyłączone”** (*Service account key creation is disabled*)?
> Ten komunikat pojawia się zwykle na firmowych kontach **Google Workspace**. Administrator organizacji musi w Google Cloud otworzyć **„Uprawnienia i administracja” → „Zasady organizacji”** (*Organization policies*). Tam znajduje zasadę **„Disable service account key creation”** (`iam.disableServiceAccountKeyCreation`) i dla tego jednego projektu ustawia ją na **„Nie egzekwuj”** (*Not enforced*). Na zwykłym koncie Gmail ten problem nie występuje.

### Gdy klucz wycieknie albo zginie

Konta usługi → kliknij konto → **„Klucze”** → przy starym kluczu ikona kosza (**usuń**). Potem utwórz nowy klucz (2b) i podmień `GOOGLE_PRIVATE_KEY` na hostingu (krok 5). Stary klucz przestaje działać od razu.

---

## 3. Udostępnienie kalendarza salonu kontu usługi

1. Wejdź na **https://calendar.google.com** (na komputerze) i zaloguj się na konto salonu.
2. Po lewej stronie, w sekcji **„Moje kalendarze”** (*My calendars*), najedź myszką na kalendarz salonu. Kliknij **⋮** (trzy kropki) → **„Ustawienia i udostępnianie”** (*Settings and sharing*).
3. Przewiń do sekcji **„Udostępnij konkretnym osobom lub grupom”** (*Share with specific people or groups*).
4. Kliknij **„+ Dodaj osoby i grupy”** (*+ Add people and groups*).
5. Wklej **adres konta usługi** z kroku 2a (`…@….iam.gserviceaccount.com`).
6. W polu **„Uprawnienia”** (*Permissions*) wybierz:
   **„Wprowadzanie zmian w wydarzeniach”** (*Make changes to events*).

   | Uprawnienie | Czy wystarczy? |
   |---|---|
   | Wyświetlanie tylko informacji o wolnych/zajętych | ❌ strona nie zapisze wizyty |
   | Wyświetlanie wszystkich szczegółów wydarzeń | ❌ strona pokaże godziny, ale nie zapisze wizyty |
   | **Wprowadzanie zmian w wydarzeniach** | ✅ **to wybieramy** |
   | Wprowadzanie zmian i zarządzanie udostępnianiem | ⚠️ działa, ale daje więcej niż trzeba, więc nie wybieraj |

7. Kliknij **„Wyślij”** (*Send*). Jeśli Google ostrzeże, że adres jest spoza organizacji, potwierdź.
   Konto usługi nie odbiera poczty i **niczego nie musi akceptować**. Dostęp działa od razu.

**Sprawdź przy okazji:** w tych samych ustawieniach, w sekcji **„Uprawnienia dostępu do wydarzeń”** (*Access permissions for events*), pole **„Udostępnij publicznie”** (*Make available to public*) musi być **wyłączone**. W kalendarzu będą dane klientek.

> **Konto firmowe Google Workspace:** administrator mógł zablokować udostępnianie kalendarzy poza firmą. Wtedy w konsoli administratora trzeba otworzyć **Aplikacje → Google Workspace → Kalendarz → Ustawienia udostępniania** (*Apps → Google Workspace → Calendar → Sharing settings*). W opcji udostępniania na zewnątrz (*External sharing options for primary calendars*) należy zezwolić, żeby **osoby z zewnątrz mogły zmieniać kalendarze** (*… outside users can change calendars*).

---

## 4. Identyfikator kalendarza

Jesteś nadal w **„Ustawieniach i udostępnianiu”** tego kalendarza.

1. Przewiń w dół do sekcji **„Integracja kalendarza”** (*Integrate calendar*).
2. Pierwsze pole to **„Identyfikator kalendarza”** (*Calendar ID*). Skopiuj je.
   - kalendarz **główny** konta (nazywa się jak Ty) ma identyfikator równy **adresowi Gmail**, np. `salon@gmail.com`,
   - kalendarz **dodatkowy**, założony osobno, ma długi identyfikator zakończony na `@group.calendar.google.com`.

**Który kalendarz wybrać?** Strona sprawdza zajętość **tylko w tym jednym kalendarzu**.

| Wybór | Zaleta | Na co uważać |
|---|---|---|
| **Kalendarz główny** (adres Gmail) | Blokuje wszystko, co w nim zapisujesz, także sprawy prywatne. | Robot ma dostęp do całego kalendarza. Strona czyta wyłącznie godziny zajętości, nigdy tytuły ani opisy. |
| **Osobny kalendarz „Salon”** | Oddzielenie spraw prywatnych od salonowych. | Prywatne wydarzenia z innych kalendarzy **nie blokują** terminów. Dni wolne trzeba wpisywać w kalendarz „Salon”. |

Jeśli wizyty zapisujesz dziś w kalendarzu głównym, najprościej zostać przy nim.

---

## 5. Zmienne środowiskowe na hostingu

Ten krok wykonuje osoba z dostępem do hostingu. Wartości **nigdy nie trafiają do kodu ani do repozytorium**. Wpisuje się je wyłącznie w panelu hostingu. Wzór jest w pliku [`booking.env.example`](../booking.env.example).

### Co wpisać

| Nazwa (Key) | Wartość (Value) | Skąd |
|---|---|---|
| `BOOKING_PROVIDER` | `google` | wpisz dokładnie tak |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `rezerwacje@….iam.gserviceaccount.com` | pole `client_email` z pliku JSON (krok 2) |
| `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIE…\n-----END PRIVATE KEY-----\n` | pole `private_key` z pliku JSON (krok 2), patrz niżej |
| `GOOGLE_CALENDAR_ID` | `salon@gmail.com` albo `…@group.calendar.google.com` | krok 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://adres-strony.pl` | docelowy adres strony, zwykle już ustawiony |
| `BOOKING_ALLOWED_ORIGINS` | *(opcjonalnie)* `https://www.adres.pl,https://adres.pl` | tylko gdy strona działa pod kilkoma adresami, a rezerwacja z któregoś zwraca błąd „forbidden” |
| `BOOKING_SECRET` | *(zalecane)* losowy ciąg min. 32 znaków | np. wynik polecenia `openssl rand -hex 32`. Służy do podpisów i skrótów (rozdz. 9). Bez niego strona wylicza sekret z klucza konta usługi. Po zmianie limit „2 wizyty na telefon/e-mail” nie rozpozna wizyt zapisanych wcześniej. |
| `TURNSTILE_SITE_KEY` i `TURNSTILE_SECRET_KEY` | *(zalecane)* klucze z Cloudflare Turnstile | ochrona przed robotami (rozdz. 9). Działa tylko, gdy ustawione są **obie** zmienne. |
| `BOOKING_CLIENT_IP_HEADER` | *(tylko poza Vercelem)* np. `cf-connecting-ip` | nagłówek z prawdziwym adresem IP klientki (rozdz. 5, „Inny hosting niż Vercel”) |

Jeśli którejś z trzech zmiennych `GOOGLE_*` brakuje, rezerwacja online jest **wyłączona**. Strona uczciwie informuje wtedy, że rezerwacja jest chwilowo niedostępna, i kieruje do `/kontakt` oraz na Instagram. Nic się nie psuje.

### Vercel krok po kroku

1. Wejdź na **vercel.com**, otwórz projekt strony → **Settings** → **Environment Variables**.
2. Dla każdej zmiennej z tabeli: w polu **Key** wpisz nazwę, w polu **Value** wartość.
   Przy **Environments** zaznacz **Production** (i **Preview**, jeśli wersje testowe też mają rezerwować).
   Jeśli widzisz przełącznik **Sensitive**, włącz go dla `GOOGLE_PRIVATE_KEY`.
3. Kliknij **Save**.
4. **Ważne:** zmienne działają dopiero po ponownym wdrożeniu. Wejdź w **Deployments** → przy najnowszym wdrożeniu **⋯** → **Redeploy**.

### Jak wkleić klucz (`GOOGLE_PRIVATE_KEY`)

1. Otwórz plik JSON w zwykłym edytorze tekstu (Mac: TextEdit, Windows: Notatnik).
2. Znajdź linię `"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv…`.
3. Skopiuj **wszystko między cudzysłowami**: od `-----BEGIN PRIVATE KEY-----` do `-----END PRIVATE KEY-----\n` włącznie.
   W środku będą znaki **`\n`**. **Zostaw je.** Kod sam zamienia `\n` na nowe linie.
4. Wklej jako wartość `GOOGLE_PRIVATE_KEY`.

Działają oba sposoby: jedna linia z `\n` (jak w pliku JSON) albo klucz w wielu liniach. Cudzysłowy na początku i końcu też nie przeszkadzają.

Najczęstsze błędy:
- ucięty początek albo koniec, np. brak `-----END PRIVATE KEY-----`,
- skopiowany **przecinek** po zamykającym cudzysłowie,
- klucz z **innego** pliku JSON niż adres `client_email`. E-mail i klucz muszą pochodzić z tego samego pliku.

### Inny hosting niż Vercel

Tak samo: w panelu hostingu (sekcja zwykle nazywa się *Environment variables* / *Zmienne środowiskowe*) dodaj te same nazwy i wartości, a potem wdroż stronę ponownie. Jeśli panel nie przyjmuje wartości w wielu liniach, wklej klucz w jednej linii z `\n`.

**Dodatkowo, poza Vercelem — wymagane:**

1. **`BOOKING_CLIENT_IP_HEADER`** wskazuje nagłówek, w którym serwer pośredniczący przekazuje prawdziwy adres klientki. Przykłady: `cf-connecting-ip` za Cloudflare, `x-real-ip` za nginx z `proxy_set_header X-Real-IP $remote_addr;`. Bez tej zmiennej limit prób „na adres IP” da się obejść podrobionym nagłówkiem. W logach pojawi się wtedy jednorazowe ostrzeżenie `BOOKING_CLIENT_IP_HEADER is not set`. Na Vercelu nie trzeba nic ustawiać, bo Vercel sam nadpisuje te nagłówki.
2. **Reguła limitu na brzegu** dla `POST /api/booking`, np. w Cloudflare: *Security → WAF → Rate limiting rules*, najwyżej 5 żądań na 10 minut z jednego IP. Limit w samej aplikacji jest tylko „na ile się da”, bo każda instancja serwera liczy osobno.

### Lokalnie, na komputerze programisty

Skopiuj `booking.env.example` do pliku **`.env.local`** w katalogu projektu, uzupełnij wartości i uruchom ponownie `npm run dev`. Pliki `.env*` są w `.gitignore`, więc nie trafią do repozytorium.
Żeby testować bez Google, wpisz `BOOKING_PROVIDER=memory`. Powstanie wtedy kalendarz w pamięci z przykładowymi zajętościami. Działa **tylko w trybie deweloperskim**, a na produkcji jest ignorowany.

---

## 6. Test: rezerwacja próbna

### 6a. Szybkie sprawdzenie połączenia (bez zapisywania wizyty)

Otwórz w przeglądarce, podstawiając adres strony i bieżący lub następny miesiąc:

```
https://adres-strony.pl/api/booking/slots?month=2026-10&treatment=korekta
```

| Wynik | Znaczenie |
|---|---|
| `{"month":"2026-10", … "days":{"2026-10-01":0, … }}` | ✅ połączenie z kalendarzem działa |
| `{"error":"disabled"}` | brakuje zmiennych albo nie było **Redeploy** (krok 5) |
| `{"error":"calendar"}` | zmienne są, ale Google odmawia. Patrz 6d. |

### 6b. Rezerwacja testowa

1. Otwórz **`/umow-wizyte`** na stronie.
2. Wybierz zabieg, dzień (najwcześniej **za 24 godziny**) i godzinę.
3. Dane:
   - **Imię:** `Test Rezerwacji`. Dozwolone są tylko litery, spacje, łącznik i apostrof, więc bez cyfr i myślników „—”,
   - **Telefon i e-mail:** własne,
   - **Uwagi:** `TEST – do usunięcia`.
4. Kliknij **„Zarezerwuj wizytę”**. Nie spiesz się: formularz wysłany szybciej niż 3 sekundy od otwarcia jest traktowany jak robot.
5. Powinien pojawić się ekran **„Wizyta zapisana”** z przyciskiem **„Dodaj do kalendarza (.ics)”**.

### 6c. Sprawdzenie w kalendarzu i usunięcie

1. Otwórz **Kalendarz Google** salonu na wybrany dzień.
   Powinno tam być wydarzenie **„Wizyta: {zabieg} — Test Rezerwacji”** z telefonem, e-mailem i uwagami w opisie.
2. Wróć na `/umow-wizyte`, odśwież stronę i wybierz ten sam zabieg i dzień. **Zarezerwowanej godziny już nie ma** (sąsiednich może też nie być, bo zabieg trwa dłużej niż 30 minut i ma bufor 15 minut).
3. **Usuń wydarzenie testowe:** kliknij je w kalendarzu → ikona **kosza** (*Usuń wydarzenie*).
4. Odśwież `/umow-wizyte`. Godzina znów jest wolna.

**Test blokady (polecany):** dodaj w kalendarzu wydarzenie „Test blokady” na jakąś godzinę. Na stronie ta godzina (i 15 minut przed nią i po niej) przestanie być dostępna. Potem usuń wydarzenie.

> Z jednego adresu IP można wysłać **najwyżej 5 prób rezerwacji w ciągu 10 minut**. Przy wielu testach pod rząd strona może chwilowo odmówić. Wystarczy odczekać 10 minut.
>
> Na ten sam telefon **albo** e-mail strona przyjmie najwyżej **2 przyszłe wizyty** (rozdz. 9). Przy kolejnych testach z tymi samymi danymi najpierw usuń testowe wpisy z kalendarza. Strona wstrzymuje też rezerwacje po **6 wpisach w godzinę albo 15 na dobę**, więc nie rób kilkunastu testów pod rząd.

### 6d. Gdy coś nie działa

**Objawy na stronie**

| Co widać | Najczęstsza przyczyna | Co zrobić |
|---|---|---|
| „Rezerwacja online jest chwilowo niedostępna” | brak zmiennych, literówka w nazwie, brak Redeploy, `BOOKING_PROVIDER` inny niż `google` | krok 5 |
| to samo, ale dopiero **po kliknięciu „Zarezerwuj”**, a w logu `volume fuse tripped` | zadziałał bezpiecznik: w ostatniej godzinie lub dobie przyszło więcej rezerwacji ze strony, niż przewiduje próg | sprawdź kalendarz. Jeśli to atak, zobacz „Sprzątanie po ataku” (rozdz. 9). Rezerwacje wrócą same, gdy starsze wpisy wyjdą poza okno godziny lub doby. |
| „Na ten numer telefonu lub adres e-mail są już zarezerwowane wizyty” | ta osoba ma już 2 przyszłe wizyty ze strony | kolejną wizytę salon wpisuje ręcznie |
| „Nie udało się potwierdzić, że formularz wysyła człowiek” | Cloudflare Turnstile odrzucił próbę albo nie odpowiedział | spróbować ponownie. Jeśli powtarza się u wszystkich, sprawdź klucze `TURNSTILE_*`. |
| Godzin nie widać, pojawia się błąd połączenia z kalendarzem | kalendarz nieudostępniony, zły identyfikator, API niewłączone, uszkodzony klucz | krok 1–4, poniżej logi |
| **Godziny widać, ale zapis kończy się błędem** | kalendarz udostępniony z uprawnieniem tylko do **wyświetlania** | krok 3: zmień na „Wprowadzanie zmian w wydarzeniach” |
| „Ten termin właśnie się zajął” | ktoś zajął godzinę chwilę wcześniej (to prawidłowe zachowanie) | wybrać inną godzinę |
| Żadnych godzin w danym dniu | dzień zamknięty w godzinach pracy, całodniowe wydarzenie w kalendarzu albo termin bliżej niż 24 h lub dalej niż 60 dni | krok 7 i 8 |

**Logi (dla programisty).** Vercel → projekt → **Logs**, wyszukaj `[booking]`. W logach **nigdy nie ma danych osobowych ani klucza**, jest tylko rodzaj błędu, np.
`[booking] slots: calendar error { name: 'CalendarApiError', kind: 'api', status: 200, reason: 'notFound' }`

| W logu | Znaczenie | Rozwiązanie |
|---|---|---|
| `CalendarConfigError` | zmienna w złym formacie: klucz ucięty lub bez BEGIN/END, e-mail bez `@`, pusty identyfikator | wkleić wartości ponownie (krok 5) |
| `CalendarAuthError` + `invalid_grant` | Google nie przyjął klucza: klucz usunięty albo z innego konta usługi niż e-mail | e-mail i klucz z **tego samego** pliku JSON; w razie wątpliwości nowy klucz (2b) |
| `reason: 'notFound'` | kalendarz **nie jest udostępniony** kontu usługi albo **zły identyfikator** | krok 3 i 4 |
| `status: 403`, `reason: 'accessNotConfigured'` | **Google Calendar API nie jest włączone** w tym projekcie | krok 1, pkt 6–8 |
| `status: 403`, `reason: 'requiredAccessLevel'` / `'forbidden'` | za niskie uprawnienie udostępnienia | krok 3, pkt 6 |
| `status: 429`, `rateLimitExceeded` / `quotaExceeded` | przekroczony limit zapytań Google | odczekać (patrz rozdz. 9) |
| `CalendarTimeoutError` / `CalendarNetworkError` | Google nie odpowiedział w 10 s albo wystąpił błąd sieci | zwykle przejściowe; spróbować ponownie |

Kody odpowiedzi API: `503 disabled` / `paused` (bezpiecznik) · `502 calendar` / `captcha` · `409 taken` / `limit` (2 wizyty na kontakt) · `429 rate_limited` · `403 forbidden` (obca domena, patrz `BOOKING_ALLOWED_ORIGINS`) · `400 invalid` / `too_fast` / `form_expired` (formularz otwarty ponad dobę albo wysłany z pominięciem strony) / `captcha`.

---

## 7. Co widzi salon w kalendarzu i jak blokować terminy

### Tak wygląda wizyta zapisana ze strony

- **Tytuł:** `Wizyta: Perfect Lips — Anna`
- **Czas:** od wybranej godziny przez **czas zabiegu** (np. 120 min). Bufor 15 minut nie jest osobnym wydarzeniem, strona po prostu trzyma ten czas wolny.
- **Miejsce:** nazwa i adres salonu (pełny adres pojawi się, gdy zostanie uzupełniony w `src/lib/site.js`).
- **Opis:**
  ```
  Zabieg: Perfect Lips (120 min)
  Cena: 1700 zł
  Telefon: +48 600 000 000
  E-mail: anna@example.com

  Zapis ze strony www · ID rezerwacji: 3f2a…

  Uwagi klientki (tekst z formularza):
  │ pierwszy zabieg
  ```
  Uwagi są zawsze na końcu, a każda ich linia zaczyna się od `│`. Dzięki temu nikt nie podrobi w uwagach linii „Telefon:” ani „ID rezerwacji”. Strona nie przyjmuje w uwagach linków ani znaczników HTML.
- **Przypomnienia:** domyślne przypomnienia Twojego kalendarza.
- **Goście:** brak. Klientka nie jest dodana jako gość (patrz rozdz. 9).
- Jako twórca wydarzenia może być widoczny adres konta usługi (`…iam.gserviceaccount.com`). To normalne.

Wizytę możesz dowolnie **edytować, przesunąć** (przeciągnij na inną godzinę) albo **usunąć**. Strona od razu to uwzględni: zwolniona godzina wraca do rezerwacji, a nowa jest zajęta. **Klientka nie dostaje o tym automatycznej informacji**, więc zadzwoń albo napisz do niej.

### Każde wydarzenie w tym kalendarzu blokuje terminy

Strona traktuje jako zajęty **każdy** wpis w kalendarzu z kroku 4, niezależnie od tytułu, koloru i ustawienia „Zajęty/Dostępny”. Między każdym wpisem a wizytą ze strony zostaje co najmniej **15 minut** przerwy.

Wyjątki, które **nie** blokują terminów:
- **urodziny**, które Google dopisuje sam z Kontaktów Google i z profilu konta,
- dzienne **„miejsce pracy”** (*Working location*) na kontach Google Workspace,
- zaproszenia, które **odrzuciłaś** (odpowiedź „Nie”).

| Chcę… | Zrób w Kalendarzu Google |
|---|---|
| zablokować kilka godzin (lekarz, szkolenie, sprawy prywatne) | zwykłe wydarzenie na te godziny, tytuł dowolny, np. „Zajęte” |
| **urlop / dzień wolny** | wydarzenie z zaznaczonym **„Cały dzień”**. Na urlop kilkudniowy wystarczy **jedno** wydarzenie od–do (np. 3–14 sierpnia). |
| stałą przerwę (np. obiad codziennie 13:00–13:30) | wydarzenie **cykliczne** (*Nie powtarza się* → *Codziennie w dni robocze*) |
| przyjąć klientkę umówioną telefonicznie | wpisz ją do kalendarza jak zwykle, a godzina zniknie ze strony |
| odblokować termin | usuń wydarzenie |

**⚠️ Święta państwowe nie blokują się same.** Kalendarz „Święta w Polsce” to osobny kalendarz, a strona go nie sprawdza. Na początku roku wpisz w kalendarz salonu całodniowe wydarzenia „Salon zamknięty” na święta w dni robocze (np. 11 listopada, 24–26 grudnia, 1 i 6 stycznia, Poniedziałek Wielkanocny, Boże Ciało). Można też poprosić programistę o dopisanie tych dat do `closedDates` w `config.js`.

Zaproszenia od innych osób, które widnieją w tym kalendarzu, też blokują czas, chyba że je odrzucisz. Jeśli któreś nie powinno blokować, odrzuć je albo usuń z kalendarza.

**Czego strona NIE czyta:** tytułów, opisów ani listy uczestników Twoich wydarzeń. Pobiera wyłącznie godziny zajętości, rodzaj wydarzenia (np. urodziny) i Twoją odpowiedź na zaproszenie.

### Czasowe wyłączenie rezerwacji online

Najprościej zablokować dni w kalendarzu (patrz wyżej). Żeby całkowicie wyłączyć formularz, ustaw na hostingu `BOOKING_PROVIDER=off` i zrób **Redeploy**. Przyciski „Umów wizytę” wrócą wtedy do formularza kontaktowego, a sama strona /umow-wizyte pokaże komunikat i skieruje do kontaktu oraz na Instagram. Powrót: `BOOKING_PROVIDER=google` + Redeploy.

Cel przycisków „Umów wizytę” w całym serwisie jest ustalany **w chwili buildu** (`next.config.mjs` → `NEXT_PUBLIC_BOOKING_ENABLED`) z tych samych zmiennych, więc każda zmiana zmiennych wymaga Redeploy.

---

## 8. Godziny pracy i czasy zabiegów: gdzie je zmienić

Wszystko jest w jednym pliku: **`src/lib/booking/config.js`**. Zmiana wymaga poprawki w kodzie i ponownego wdrożenia strony, dlatego robi to programista.
**Jednorazowe** zmiany (krótszy dzień, dzień wolny) rób w kalendarzu (rozdz. 7), bez programisty.

### Godziny pracy: ⚠️ DO POTWIERDZENIA

Obecne ustawienie: **poniedziałek–piątek 10:00–18:00, sobota i niedziela zamknięte**. Godziny wzięliśmy ze sklepu internetowego, więc **prosimy o potwierdzenie albo poprawienie**.

```js
const WORKING_HOURS = Object.freeze({
  0: null,                                  // niedziela: zamknięte
  1: Object.freeze(['10:00', '18:00']),     // poniedziałek
  2: Object.freeze(['10:00', '18:00']),     // wtorek
  3: Object.freeze(['10:00', '18:00']),     // środa
  4: Object.freeze(['10:00', '18:00']),     // czwartek
  5: Object.freeze(['10:00', '18:00']),     // piątek
  6: null,                                  // sobota: zamknięte, np. ['10:00', '14:00'] = otwarte 10–14
});
```

Zabieg **razem z 15-minutowym buforem** musi się skończyć najpóźniej o godzinie zamknięcia. Przy godzinach 10:00–18:00 daje to:

| Zabieg | Czas blokady | Pierwsza godzina | Ostatnia godzina |
|---|---|---|---|
| Super Natural Brows | 120 min | 10:00 | 15:30 |
| Perfect Powder Brows | 120 min | 10:00 | 15:30 |
| Perfect Lips | 120 min | 10:00 | 15:30 |
| Perfect Eyeliners | 90 min | 10:00 | 16:00 |
| Odświeżenie (Refresh) | 90 min | 10:00 | 16:00 |
| Korekta do 3 miesięcy | 60 min | 10:00 | 16:30 |
| Usuwanie — laser / remover | 45 min | 10:00 | 17:00 |

### Czasy zabiegów

W tym samym pliku, w liście `TREATMENTS`, pole `durationMin` (w minutach). Obecne wartości to górne granice z opisu zabiegów na stronie `/uslugi`. Każdy zabieg obejmuje konsultację, architekturę twarzy i rysunek wstępny, więc osobnej „konsultacji” w rezerwacji nie ma.

### Ceny

Ceny **nie są** w `config.js`. Pochodzą z cenników w `src/lib/site.js` (`PRICING_PMU`, `PRICING_REFRESH`, `PRICING_REMOVAL`), tych samych, które widać na stronie `/uslugi`. Zmiana w jednym miejscu zmienia cenę wszędzie.

### Pozostałe ustawienia w `config.js`

| Ustawienie | Obecnie | Znaczenie |
|---|---|---|
| `slotStepMin` | `30` | co ile minut można zacząć wizytę (10:00, 10:30, …) |
| `bufferMin` | `15` | wolny czas po każdej wizycie i każdym wydarzeniu |
| `minLeadHours` | `24` | najwcześniej za tyle godzin od teraz |
| `maxDaysAhead` | `60` | najdalej za tyle dni |
| `closedDates` | `[]` | dodatkowe dni zamknięte, np. `['2026-11-11', '2026-12-24']` |
| `eventColorId` | `null` | kolor wizyt w Kalendarzu Google: `'1'`–`'11'`, `null` = domyślny kolor kalendarza |
| `abuse.maxActivePerContact` | `2` | ile przyszłych wizyt ze strony może mieć ten sam telefon **albo** e-mail |
| `abuse.maxPerHour` / `abuse.maxPerDay` | `6` / `15` | bezpiecznik: po tylu nowych rezerwacjach ze strony w godzinę lub dobę rezerwacja online jest chwilowo wstrzymana |

Zmiana czasu letni/zimowy (strefa `Europe/Warsaw`) jest obsługiwana automatycznie.

Po każdej zmianie programista uruchamia testy poleceniem **`npm test`**, a potem wdraża stronę.

---

## 9. Ograniczenia

Warto o nich wiedzieć przed uruchomieniem:

1. **Klientka nie dostaje maila ani SMS-a.** Potwierdzeniem jest ekran „Wizyta zapisana” i plik **.ics**, który klientka może dodać do swojego kalendarza (z przypomnieniem dzień wcześniej). Strona nie wysyła żadnych wiadomości.
   **Dobra praktyka:** po nowej rezerwacji wyślij klientce krótkiego SMS-a z potwierdzeniem.
2. **Konto usługi nie może zapraszać uczestników.** Wymagałoby to firmowego Google Workspace i dodatkowej konfiguracji administratora. Dlatego klientka **nie jest gościem** wydarzenia, a jej dane są w opisie.
3. **Salon nie dostaje osobnego powiadomienia o nowej rezerwacji.** Wizyta po prostu pojawia się w kalendarzu. Warto zaglądać do kalendarza codziennie albo włączyć w ustawieniach kalendarza e-mail z **codziennym planem dnia** (*Daily agenda*). Powiadomienia Google o wydarzeniach dodanych automatycznie nie są gwarantowane.
4. **Klientka nie odwoła ani nie przełoży wizyty sama na stronie.** Robi to telefonicznie lub przez Instagram, a salon zmienia wpis w kalendarzu.
5. **Jeden kalendarz = jedno stanowisko.** Strona nie zapisze dwóch wizyt w tym samym czasie.
6. **Brak zaliczek i płatności online.**
7. **Okno rezerwacji:** najwcześniej za 24 h, najpóźniej za 60 dni. Wizyty „na jutro rano” trzeba umawiać telefonicznie.
8. **Limity zapytań.**
   - **Strona:** z jednego adresu IP najwyżej 5 prób rezerwacji w 10 minut i 60 zapytań o wolne godziny na minutę. Adresy IPv6 liczone są po całej sieci /64, czyli po jednym łączu domowym. To ochrona „na ile się da”: przy hostingu typu Vercel każda instancja liczy osobno. Na produkcji warto dodać regułę limitu w **Vercel Firewall** albo w Cloudflare. **Poza Vercelem taka reguła jest wymagana** (rozdz. 5).
   - Identyczne zapytania o wolne godziny strona łączy i przez 30 sekund odpowiada z pamięci, więc ruch na stronie nie przekłada się 1:1 na zapytania do Google. Przy samym zapisie wizyty strona zawsze sprawdza kalendarz na świeżo.
   - **Google:** Calendar API ma dzienne i minutowe limity zapytań na projekt. Ruch salonu jest wielokrotnie mniejszy. Po przekroczeniu limitu strona chwilowo pokaże błąd połączenia z kalendarzem. Limity można sprawdzić w Google Cloud: **Interfejsy API i usługi → Google Calendar API → Limity** (*Quotas*).
9. **Równoczesne kliknięcia.** Gdy dwie osoby w tej samej chwili rezerwują ten sam termin, zapisze się dokładnie jedna. Druga zobaczy „Ten termin właśnie się zajął” i wybierze inną godzinę. Wpis dodany ręcznie przez salon zawsze ma pierwszeństwo.
10. **Błąd w trakcie zapisu nie tworzy duplikatów.** Czasem Google zapisze wizytę, ale odpowiedź nie dotrze do strony. Klientka widzi wtedy „Spróbuj ponownie”. Kolejne kliknięcie rozpozna już zapisany wpis i potwierdzi go, zamiast dodać drugi.

### Ochrona przed zablokowaniem kalendarza

Formularz jest publiczny, więc ktoś mógłby napisać skrypt, który zarezerwuje wszystkie wolne godziny. Strona ma przed tym kilka zabezpieczeń:

| Zabezpieczenie | Co robi |
|---|---|
| **Cloudflare Turnstile** (zalecane) | niewidoczne sprawdzenie „czy to człowiek”, bez przepisywania znaków. Tylko ono realnie zatrzymuje skrypt, który podaje za każdym razem inne dane. |
| **2 wizyty na telefon lub e-mail** | kolejna przyszła wizyta z tym samym telefonem **albo** e-mailem jest odrzucana. Klientka widzi prośbę o kontakt przez Instagram. W wydarzeniu zapisujemy tylko skrót (HMAC) numeru i adresu, z którego nie da się ich odczytać. |
| **Bezpiecznik** | po 6 nowych rezerwacjach ze strony w godzinę albo 15 na dobę rezerwacja online jest wstrzymana, a w logu pojawia się `volume fuse tripped`. W najgorszym razie w kalendarzu przybywa tylko tyle wpisów. |
| **Limit na IP** | 5 prób na 10 minut (patrz pkt 8). |
| **Podpisany formularz i pole-pułapka** | żądanie musi pochodzić z wyświetlonej strony, wysłanej najwcześniej 3 sekundy po jej otwarciu, a niewidoczne pole musi zostać puste. To zatrzymuje tylko najprostsze roboty. |

**Jak włączyć Turnstile (bezpłatnie, ok. 10 minut):**
1. Załóż konto na **dash.cloudflare.com** (nie trzeba przenosić domeny) → **Turnstile** → **Add widget**.
2. Nazwa dowolna. W **Hostnames** wpisz domenę strony, np. `as-loveliness.eu`. Tryb (*Widget mode*): **Managed**.
3. Skopiuj **Site Key** do `TURNSTILE_SITE_KEY`, a **Secret Key** do `TURNSTILE_SECRET_KEY` na hostingu, potem zrób **Redeploy**.
4. Do testów lokalnych Cloudflare udostępnia klucze testowe, które zawsze przepuszczają: site key `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

Turnstile przetwarza dane techniczne przeglądarki (m.in. adres IP) w Cloudflare — przy samej weryfikacji w imieniu salonu, a przy ulepszaniu usługi jako odrębny administrator. Polityka prywatności (pkt 6, 10, 11) i Polityka cookies (pkt 3) już to opisują, warunkowo („jeśli jest włączony”); klauzula pod przyciskiem rezerwacji dopisuje wtedy zdanie o Turnstile. Skrypt Cloudflare ładuje się dopiero, gdy ktoś zaczyna wypełniać krok 04 „Twoje dane” (albo wysyła formularz), a nie przy otwarciu strony. Czy włączać Turnstile, decyduje klientka (docs/dokumenty-prawne.md).

### Sprzątanie po ataku

Wpisy ze strony mają w opisie tekst **„Zapis ze strony www”**. Kilka sztuk usuniesz ręcznie: wyszukaj w Kalendarzu Google (lupa) `Zapis ze strony www`, otwórz wydarzenie i kliknij kosz.

Przy wielu wpisach programista może użyć skryptu. Skrypt usuwa **wyłącznie** przyszłe wpisy ze strony (`source=www`) utworzone w podanym czasie. Wpisów dodanych ręcznie nie dotyka.

```bash
# podgląd: co zostałoby usunięte (niczego nie usuwa)
node --env-file=.env.local src/lib/booking/cleanup-www.mjs --since 2026-10-05T12:00 --until 2026-10-05T18:00
# usunięcie po sprawdzeniu listy
node --env-file=.env.local src/lib/booking/cleanup-www.mjs --since 2026-10-05T12:00 --until 2026-10-05T18:00 --delete
```

Czas podaje się w czasie polskim. Plik `.env.local` musi zawierać te same zmienne `GOOGLE_*` (i `BOOKING_SECRET`, jeśli jest ustawiony) co hosting.

---

## 10. RODO: co dopisać do polityki prywatności

> To nie jest porada prawna. Poniższe punkty i wzór tekstu trzeba **zweryfikować z prawnikiem / IOD** przed publikacją.

### Co się dzieje z danymi

- Formularz zbiera: **imię, telefon, e-mail, wybrany zabieg, termin i uwagi**. **Nie pyta o zdrowie.** Wywiad zdrowotny prowadź w salonie. Gdyby klientka sama wpisała w uwagach informacje o zdrowiu, traktuj je poufnie.
- Dane trafiają **do Kalendarza Google salonu** (w opisie wydarzenia). **Google przetwarza je w imieniu salonu, jako podmiot przetwarzający.** Trzeba to wpisać do polityki prywatności.
- Dane przechodzą też przez **serwer hostingu** (np. Vercel). Hosting to kolejny podmiot przetwarzający. Strona nie zapisuje danych klientek w logach ani w żadnej własnej bazie.
- W wydarzeniu zapisujemy też **skróty (HMAC) telefonu i e-maila**. Służą wyłącznie do limitu „2 wizyty na osobę” i nie da się z nich odczytać danych.
- Jeśli włączony jest **Cloudflare Turnstile**, Cloudflare przetwarza dane techniczne przeglądarki (m.in. adres IP) w celu ochrony formularza przed robotami. To kolejny podmiot, który trzeba wpisać do polityki.
- **Podstawa prawna:** art. 6 ust. 1 lit. b RODO, czyli działania na żądanie osoby przed zawarciem umowy. **Checkbox ze zgodą nie jest potrzebny.** Potrzebna jest za to **klauzula informacyjna** (art. 13 RODO) i link do Regulaminu. Pod przyciskiem rezerwacji wyświetlają się automatycznie, gdy dokumenty prawne są publiczne (`LEGAL_PUBLIC` w `src/lib/legal.js`). Decyzja Filipa z 30.09.2026: dokumenty i klauzula są publiczne już przed uzupełnieniem danych firmy – do tego czasu klauzula wskazuje markę AS COMPANY LOVELINESS (Babushkina Academy), miasto i Instagram, a po wpisaniu `LEGAL` (firma, adres, NIP, rejestr) i `CONTACT` (e-mail, telefon) w `src/lib/site.js` pokaże pełne dane sama. Rezerwacja online włącza się więc po ustawieniu zmiennych Google; bez nich strona pokazuje „chwilowo niedostępna”, API odpowiada 503, a przyciski „Umów wizytę” prowadzą do /kontakt. Dokumenty w pełni obowiązują po uzupełnieniu danych i wpisaniu `LEGAL.documentsApproved` (`LEGAL_PUBLISHED`).

### Umowa powierzenia z Google

- **Konto firmowe Google Workspace:** w konsoli administratora można zaakceptować umowę powierzenia (*Cloud Data Processing Addendum*, sekcja **Konto → Ustawienia konta → Kwestie prawne i zgodność** / *Account → Account settings → Legal and compliance*). **To zalecane rozwiązanie.**
- **Prywatne, bezpłatne konto Gmail:** Google nie zawiera z użytkownikiem umowy powierzenia. Warto omówić to z prawnikiem. Bezpieczniej jest trzymać kalendarz salonu na koncie firmowym.
- Google może przekazywać dane poza Europejski Obszar Gospodarczy (USA). Informacja o tym i podstawie transferu (np. EU-US Data Privacy Framework lub standardowe klauzule umowne) powinna być w polityce.

### Okres przechowywania

Wizyty zostają w kalendarzu, dopóki ich nie usuniesz. **Ustal okres przechowywania**, np. „12 miesięcy od wizyty” (do decyzji z prawnikiem). Starsze wpisy usuwaj albo wykasuj z nich telefon i e-mail.

### Bezpieczeństwo

- Dostęp do kalendarza oznacza dostęp do danych klientek. Włącz **weryfikację dwuetapową** na koncie Google salonu, **nie udostępniaj** kalendarza publicznie, a każdej osobie, której go udostępniasz, nadaj upoważnienie do przetwarzania danych.
- Klucz konta usługi (plik JSON) chroń jak hasło (rozdz. 2). Po zakończeniu współpracy z programistą **wygeneruj nowy klucz** i usuń stary.

### Treść polityki prywatności

Polityka prywatności, polityka cookies i regulamin są gotowe w `src/content/legal/{privacy,cookies,terms}.{pl,en,ru}.json` (rezerwację opisują w polityce prywatności pkt 5, 6, 10, 11 i 12, a w regulaminie pkt 9 i 10). Dane firmy podstawia `src/lib/legal.js` z `LEGAL` i `CONTACT` w `src/lib/site.js`. Decyzje, które klientka musi potwierdzić przed publikacją (m.in. okres przechowywania rezerwacji, konto Google Workspace, region hostingu, Turnstile), są w `docs/dokumenty-prawne.md`.

---

## 11. Lista kontrolna przed uruchomieniem

- [ ] Projekt w Google Cloud utworzony, **Google Calendar API włączone** (1)
- [ ] Konto usługi utworzone, **klucz JSON** pobrany i bezpiecznie przechowany (2)
- [ ] Kalendarz salonu **udostępniony** adresowi konta usługi z uprawnieniem **„Wprowadzanie zmian w wydarzeniach”**, kalendarz **nie jest publiczny** (3)
- [ ] **Identyfikator kalendarza** skopiowany (4)
- [ ] Zmienne `BOOKING_PROVIDER`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` ustawione na hostingu i zrobiony **Redeploy** (5)
- [ ] `BOOKING_SECRET` ustawiony, **Cloudflare Turnstile** włączony (`TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`) (5, 9)
- [ ] Poza Vercelem: `BOOKING_CLIENT_IP_HEADER` i reguła limitu dla `POST /api/booking` na brzegu (5)
- [ ] Rezerwacja testowa widoczna w kalendarzu i **usunięta** (6)
- [ ] **Godziny pracy potwierdzone** (8)
- [ ] Święta i urlopy wpisane w kalendarz jako wydarzenia całodniowe (7)
- [ ] **Dane w `LEGAL` i `CONTACT`** uzupełnione, decyzje z `docs/dokumenty-prawne.md` potwierdzone, `LEGAL.documentsApproved` wpisane – rezerwacja działa już przy publicznych dokumentach bez danych firmy (`LEGAL_PUBLIC`, decyzja Filipa z 30.09.2026), ale dopiero z tymi danymi dokumenty w pełni obowiązują (10)
- [ ] Ustalony sposób potwierdzania wizyt klientkom (np. SMS od salonu) (9)
