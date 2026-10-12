# TechALARM – promo videó (Remotion)

30 másodperces, 1920×1080, 30 fps. A szöveg magyar, a betűtípus az Inter (a `latin` és a `latin-ext` fájl is kell az ő/ű betűkhöz).
A színek az oldal kék témájából valók (`src/theme.ts`).

```bash
cd promo-video
npm install
npm run studio     # előnézet a böngészőben
npm run render     # out/promo.mp4
```

Jelenetek (`src/theme.ts` → `SCENES`): nyitás, probléma, logó, telefonos bemutató, követés, három szó, zárás.
A hang és a zene még nincs benne: a magyar hangot és a zenét külön választjuk ki, és a `Promo.tsx`-ben `<Audio>`-val adható hozzá.
