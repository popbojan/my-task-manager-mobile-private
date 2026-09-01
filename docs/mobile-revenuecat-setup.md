# RevenueCat Mobile Setup (Android)

Kurzanleitung für die In-App-Abo-Integration in der React-Native-App. Verbindliche Fachspezifikation: `my-task-manager-backend-private/docs/architecture/subscription-system.md`.

## Grundprinzipien

- Mobile-Käufe laufen **ausschließlich** über das RevenueCat SDK (`react-native-purchases`).
- Es gibt **keinen** Backend-Checkout für Mobile.
- Premium-Status kommt aus **`GET /subscriptions/me`** → **`hasPremiumAccess`**.
- RevenueCat `app_user_id` = interne Backend-**`user.id`** (niemals E-Mail, Anonymous ID oder JWT).
- **Kein Polling** für `/subscriptions/me` — nur diskrete, einmalige Aufrufe.

## Android Public SDK Key

Trage den **öffentlichen** SDK-Key in `src/config/revenueCat.local.ts` ein:

```typescript
export const revenueCatLocalOverrides = {
  androidPublicSdkKey: 'goog_xxxxxxxx',       // Release / Play
  androidTestStoreSdkKey: 'test_xxxxxxxx',    // nur DEBUG
  iosPublicSdkKey: '',
  iosTestStoreSdkKey: '',
};
```

Vorlage: `src/config/revenueCat.local.example.ts`

### Test Store (`test_…`) vs Google Play (`goog_…`)

| Key-Typ | Build | App |
| --- | --- | --- |
| `test_…` in `androidTestStoreSdkKey` | DEBUG | „My Task Manager DEBUG“ |
| `goog_…` in `androidPublicSdkKey` | Release | „My Task Manager“ |

**Release + `test_`-Key → App schließt sich** („Wrong API Key“). Test-Key nie in `androidPublicSdkKey` legen.

| Key-Typ | SDK-Minimum |
| --- | --- |
| `test_…` | `react-native-purchases` **≥ 9.5.4** |
| `goog_…` | ab 8.x |

**Wichtig bei Test Store:** Im RevenueCat-Dashboard müssen die **Packages im Current Offering Test-Store-Produkte** enthalten (nicht nur Google-Play-Produkte). Sonst laden die Offerings leer.

Fehler wie `Store does not contain element with name 'test_store'` bedeuten: SDK zu alt für den `test_`-Key → App neu bauen nach `npm install`.

**Niemals** Secret API Keys oder Webhook-Secrets in die Mobile-App legen — diese gehören ausschließlich ins Backend (`REVENUECAT_SECRET_API_KEY`, `REVENUECAT_WEBHOOK_SIGNING_SECRET`, …).

## RevenueCat & Google Play Konfiguration

| Einstellung | Wert |
| --- | --- |
| Entitlement | `my_task_manager_pro` |
| Monatsprodukt | `monthly` |
| Lifetime-Produkt | `lifetime` |
| Android Package Name | `app.mytaskmanager` |

In RevenueCat:

1. Android-App mit Package `app.mytaskmanager` anlegen.
2. Google Play Service Credentials verknüpfen.
3. Produkte `monthly` und `lifetime` aus Google Play importieren.
4. Entitlement `my_task_manager_pro` mit beiden Produkten verknüpfen.
5. **Current Offering** mit Monthly- und Lifetime-Packages konfigurieren.
6. Backend-Webhook auf `POST /webhooks/revenuecat` (Secret nur im Backend).

## App-Start- und Login-Reihenfolge

1. `RevenueCatBootstrap` — SDK einmal pro App-Lauf konfigurieren (Android Public Key).
2. Backend-Login / Session-Restore.
3. `CurrentUserBootstrap` — `GET /users/me`.
4. `SubscriptionSessionProvider` — `Purchases.logIn(user.id)`.
5. `SubscriptionBootstrap` — genau ein `GET /subscriptions/me`.
6. Profil-Tab — wenn `hasPremiumAccess === false`, RevenueCat Offerings laden und Kauf anbieten.

## Logout

1. `Purchases.logOut()`
2. Backend `POST /auth/logout` (best effort)
3. Lokale Auth-, User- und Subscription-Caches leeren

## Testen mit Google Play Lizenztester

1. Lizenztester in Google Play Console hinzufügen.
2. Debug-/Internal-Track-Build mit signiertem APK/AAB installieren.
3. Mit Test-Account einloggen → Profil → Premium-Abo.

### Szenarien

| Szenario | Erwartetes Verhalten |
| --- | --- |
| **Kauf** | Vor Kauf: `/subscriptions/me` → kein Premium → Store-Kauf → ein `/subscriptions/me` → Premium oder „Aktivierung wird verarbeitet“ |
| **Abbruch** | Keine technische Fehlermeldung |
| **Restore** | `restorePurchases()` → ein `/subscriptions/me` |
| **Aktives Stripe-Abo** | `hasPremiumAccess === true` → keine Kaufbuttons, Hinweis auf Web-Abo |
| **Verzögerter Webhook** | „Kauf erfolgreich – Aktivierung wird verarbeitet“ + manuell „Status erneut prüfen“ (kein Auto-Polling) |
| **RevenueCat-Ausfall** | Login und normale Nutzung bleiben möglich |

## iOS (vorbereitet, noch nicht aktiv)

- Plattformauswahl in `src/config/revenueCat.ts` / `revenueCat.local.ts` (`iosPublicSdkKey`).
- Native iOS-Konfiguration (App Store Connect, RevenueCat iOS-App) folgt separat.
- Bundle ID ist bereits `app.mytaskmanager`.

## Geänderte Architektur (Mobile)

| Pfad | Rolle |
| --- | --- |
| `src/revenuecat/revenueCatService.ts` | Configure, logIn, logOut, Offerings, Kauf, Restore |
| `src/subscription/subscriptionQuery.ts` | `/subscriptions/me` Cache |
| `src/subscription/SubscriptionSessionProvider.tsx` | RevenueCat Identity nach Login |
| `src/subscription/subscriptionPurchaseFlow.ts` | Kauf-/Restore-Orchestrierung |
| `src/pages/profile/ProfileScreen.tsx` | Premium-/Paywall-UI im Profil-Tab |
