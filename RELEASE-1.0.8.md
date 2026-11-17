# Release 1.0.8 (versionCode 9): AI exercises through the Qazaq Tili server

Branch `feat/server-ai-exercises`. **Internal testing only.** Nothing here has been run yet: every step that
needs the Expo or Play Console login is for the owner.

## What changed

- `app/ai-exercises.tsx`: AI exercises are switched on. The learner picks a topic and level, gets 5
  "say it in Kazakh" prompts, types answers and taps Check. The server grades with claude-haiku-5-5:
  correct / almost / not quite, corrections, a good answer in Cyrillic and Latin. "Report" on every exercise.
- `utils/api.js`: every AI call goes to `EXPO_PUBLIC_API_BASE_URL` (set in `eas.json`) with the Firebase ID token.
  The app contains no AI key and never calls Anthropic. Checked: the exported Android bundle contains no
  `api.anthropic.com`, `x-api-key` or `EXPO_PUBLIC_ANTHROPIC_API_KEY`.
- One-time screen before the first AI exercise: "I am 16 or older" + "I agree my answers are checked by AI".
  "I am under 16" leads back to the lessons. The app stays 13+; the server refuses AI calls without this consent.
- Limits, enforced by the server: 5 answer checks a day; the shared $0.25/day budget across the website and the app
  ("the AI is resting until tomorrow" when it is used up).
- Privacy policy (in-app screen and `privacy-policy.html`): 13+ for lessons, 16+ for AI, what is sent to Anthropic
  through our server, answers not stored.
- `app.json`: 1.0.7 → **1.0.8**, versionCode 8 → **9**. `eas.json`: API address per build profile; new submit
  profile `internal` (internal track, created as a **draft**).

## 1. Before building (owner, needs Expo login)

```bash
cd ~/Desktop/kazakh\ app
git fetch origin && git switch feat/server-ai-exercises && git pull
eas whoami || eas login

# The old key was revoked; make sure no copy is left in EAS either.
eas env:list production
eas env:list preview
# Only if EXPO_PUBLIC_ANTHROPIC_API_KEY is listed:
eas env:delete production --variable-name EXPO_PUBLIC_ANTHROPIC_API_KEY --non-interactive
eas env:delete preview --variable-name EXPO_PUBLIC_ANTHROPIC_API_KEY --non-interactive
```

EAS uploads the working folder, including uncommitted local files (notes, the root `letter_*.mp3`). They are not
imported by the app, so they do not change it; `git stash -u` first if you want a clean upload.

## 2. Build (owner, needs Expo login)

```bash
# Optional quick check on your own phone (APK, installs directly):
eas build -p android --profile preview --message "1.0.8 (9) AI exercises via server"

# The bundle for Google Play:
eas build -p android --profile production --message "1.0.8 (9) AI exercises via server"
```

When the production build finishes, download the `.aab` from the build page (expo.dev → project → Builds).

## 3. Play Console: internal testing (owner, needs Play Console login)

1. Play Console → **Qazaq Tili** → **Test and release → Testing → Internal testing**.
2. **Testers** tab → create or pick an email list (your own Google account plus any testers) → **Save**.
   Copy the **opt-in link**.
3. **Create new release** → **Upload** the `.aab` (versionCode 9). Release name: `1.0.8 (9)`.
   Release notes:
   - en-US: `AI exercises: say it in Kazakh and get your answer checked. For ages 16+, 5 checks a day.`
   - ru-RU: `ИИ-упражнения: скажите по-казахски и получите проверку ответа. С 16 лет, 5 проверок в день.`
4. **Next** → read the warnings (none expected) → **Save and publish**. Internal releases are usually available
   within minutes, without a full review.

   *Alternative to steps 3–4* (only if a Google service-account key is already set up for EAS Submit):
   `eas submit -p android --profile internal --latest` creates the internal release as a **draft**;
   then open it in Play Console and press **Review release → Start rollout**.
5. On the test phone, open the opt-in link with the tester account → **Accept** → install from Google Play.

## 4. Test on the phone

- [ ] Existing lessons, streak and progress work as before (13+ path, no AI prompt anywhere else).
- [ ] AI Exercises → consent screen. "I am under 16" → message, back to lessons, nothing sent.
- [ ] Both boxes → Continue → topics and levels → **Get exercises** → 5 prompts.
- [ ] A correct answer → "Correct!"; a wrong ending (e.g. «Мен барады») → "Almost" with the correction.
- [ ] The counter goes 5 → 0; the 6th check says "come back tomorrow".
- [ ] **Report** → choose a reason → "withdrawn until a teacher checks it".
- [ ] Airplane mode → "No connection".
- [ ] Switch the app language (EN/RU): prompts and feedback follow.

## 5. Before going beyond internal testing (not part of this release step)

- **Publish the updated privacy policy page.** The link in the app and in Play Console is the GitHub Pages copy of
  `privacy-policy.html`, which goes live only when this branch is merged into the branch Pages serves.
- **Data safety** (App content → Data safety): add *App activity → Other user-generated content* (the typed answers):
  collected, **processed ephemerally**, not shared (Anthropic and our server act on our behalf), optional,
  purpose *App functionality*. Encryption in transit: yes. Deletion: yes (website Settings, or by email).
- Check **App content** for any AI-generated content questions; the in-app Report button is what Google Play's
  AI-generated content policy asks for.
- Target audience stays as it is (13+).
