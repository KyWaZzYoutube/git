# Première Immo — vidéo démo motion design (25 s)

Bande démo de 25 secondes pour **premiere-immo.fr** : elle explique en un coup d'œil aux agents immobiliers
ce que fait Première Immo, avec un maximum de mouvement et un minimum de texte.

| Fichier | Usage |
|---|---|
| [`video/premiere-immo-demo.mp4`](video/premiere-immo-demo.mp4) | Version principale : 1920×1080, 30 i/s, H.264 + AAC, avec musique et design sonore |
| [`video/premiere-immo-demo-muet.mp4`](video/premiere-immo-demo-muet.mp4) | Même image sans piste audio, plus légère pour une vidéo d'arrière-plan en lecture auto |
| [`video/poster.jpg`](video/poster.jpg) | Image d'affiche (signature finale), affichée avant la lecture |

## Le film, plan par plan

Tout est calé sur une musique à 120 BPM (1 temps = 0,5 s) : les coupes et les apparitions tombent sur le rythme.

| Temps | Scène | Message |
|---|---|---|
| 0–2,5 s | Un téléphone sonne, « Le démarchage téléphonique » est barré d'un trait rouge | **… c'est fini.** · Depuis le 11 août 2026 |
| 2,5–4 s | Question en typographie cinétique, la caméra avance, montée musicale | **Et si les vendeurs vous trouvaient d'eux-mêmes ?** |
| 4–7 s | *Drop* : un cercle part du « ? » et devient une barre de recherche. On tape « estimer ma maison », « Votre agence » passe en tête avec le badge N°1 | **Ils vous trouvent en premier.** |
| 7–9,6 s | La fiche s'agrandit jusqu'à remplir l'écran et devient le moteur Première Immo. Google Ads, Facebook, Instagram, SEO local et e-mailing l'alimentent | **On s'occupe de tout.** |
| 9,6–12,2 s | Travelling latéral : chaque lead doré arrive sur le téléphone au moment où tombe la notification | **Les leads vendeurs arrivent en direct.** |
| 12,2–14,5 s | La notification se déplie en fiche contact, un doigt appuie sur « Rappeler » et l'appel part | **Votre seul travail : rappeler.** |
| 14,5–18 s | Le bouton d'appel remplit l'écran. ×2, puis le tableau de bord mensuel avec compteurs et courbe | **Doublez vos mandats · Vos résultats, chaque mois · Interlocuteur dédié · Sans engagement** |
| 18–20 s | Liste des cibles, roulement de caisse claire | **Pour les agents immobiliers, mandataires, directeurs d'agence, réseaux indépendants** |
| 20–25 s | Impact final, signature, appel à l'action | **Première Immo · Devenez l'agent n°1 de votre secteur · Appel découverte gratuit · 15 min · Sans engagement · premiere-immo.fr** |

Techniques utilisées : texte révélé par masques, lettre par lettre ; raccords de mouvement (le « ? » devient un cercle, puis une barre de recherche ; la fiche devient l'écran suivant ; le bouton d'appel devient le fond) ; tracés dessinés en SVG ; particules synchronisées sur la musique ; travelling avec parallaxe ; perspective 3D ; caméra qui avance et tremble sur les impacts. Le **flou de mouvement** est réel : chaque image est la moyenne de 5 sous-images, comme un obturateur à 180°.

## Intégrer la vidéo sur le site

```html
<video
  src="/videos/premiere-immo-demo.mp4"
  poster="/videos/poster.jpg"
  autoplay muted loop playsinline controls
  style="width:100%;height:auto;border-radius:16px">
</video>
```

- Les navigateurs n'autorisent la lecture automatique que **sans le son** (`muted`). Gardez `controls` pour que le visiteur puisse activer la musique.
- Pour un fond de section purement décoratif, utilisez `premiere-immo-demo-muet.mp4` sans `controls`.
- Sur Webflow, Wix, WordPress ou Framer, envoyez le MP4 dans la médiathèque, puis choisissez l'élément « Vidéo » ou « Background video ».

## Personnaliser

Tout se modifie dans `src/`, puis on relance le rendu.

- **Couleurs de marque** : les variables `:root` en haut de `src/styles.css` (`--accent`, `--gold`, `--ink`, etc.).
- **Textes** : directement dans `src/index.html`. Les notifications et les canaux sont dans `src/main.js` (`NOTIFS`, `CHANNELS`).
- **Logo** : le monogramme (maison + « 1 ») et le logotype « Première Immo » sont **provisoires**. Remplacez le `<symbol id="i-mark">` et le bloc `.logo` de `src/index.html` par votre logo SVG.
- **Rythme** : chaque scène a sa fonction `buildS1()` … `buildS9()` dans `src/main.js`, avec des temps en secondes.

## Refaire le rendu

Prérequis : Node 18+, Python 3.9+ et ffmpeg (sinon `pip install imageio-ffmpeg` en fournit un).

```bash
npm install
pip install numpy scipy pillow imageio-ffmpeg
npx playwright install chromium       # si Chromium n'est pas déjà présent

npm run preview                       # aperçu temps réel dans le navigateur (espace = pause, ←/→ = ±1 s)
npm run stills -- 4.5 12.8 23         # images fixes dans build/stills/
npm run build                         # rendu final complet → video/ (≈ 5 min)
./scripts/build.sh --sub 1            # rendu rapide sans flou de mouvement
```

Fonctionnement : `src/index.html` contient toute l'animation, sous forme d'une timeline GSAP en pause.
`scripts/render.mjs` la pilote image par image dans Chromium (Playwright) et envoie les images à ffmpeg.
La timeline exporte aussi ses repères sonores (`build/cues.json`). `scripts/audio.py` s'en sert pour synthétiser
la musique et chaque effet au bon moment. La loudness est normalisée à -14 LUFS, le standard web.

## Crédits et droits

- Animation : [GSAP](https://gsap.com), gratuit y compris en usage commercial ([licence standard « no charge »](https://gsap.com/standard-license)).
- Polices : Inter, Inter Tight et Instrument Serif (SIL Open Font License), embarquées via Fontsource.
- Icônes : tracés [Feather Icons](https://feathericons.com) (MIT).
- Musique et effets sonores : **entièrement synthétisés par code** (`scripts/audio.py`), sans aucun échantillon externe, donc libres de droits.

## À vérifier avant publication

- Le site premiere-immo.fr n'était pas accessible depuis l'environnement de production (politique réseau). Les messages viennent
  des informations publiques du site remontées par la recherche web : agence marketing digital immobilier, « devenez l'agent n°1
  de votre secteur », « doublez vos mandats », fin du démarchage téléphonique au 11 août 2026, « votre seul travail : rappeler
  les prospects », statistiques mensuelles, interlocuteur dédié, sans engagement, appel découverte gratuit de 15 min.
  Vérifiez qu'ils correspondent toujours à votre offre.
- Les chiffres du tableau de bord (32 leads, 14 RDV, +100 % de mandats), la fiche « Sophie M. » et les notifications sont
  **illustratifs**.
- Couleurs et logo : à aligner sur votre charte (voir « Personnaliser »).
