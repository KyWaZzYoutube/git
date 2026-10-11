# Première Immo — vidéos motion design

Vidéos animées pour **premiere-immo.fr**, rendues image par image à partir de compositions HTML/GSAP, avec une bande-son entièrement synthétisée par code.

| Vidéo | Durée | Fichiers |
|---|---|---|
| **Google Ads immobilier** pour la page `/google-ads-immobilier` | 32 s | [`video/google-ads/premiere-immo-google-ads.mp4`](video/google-ads/premiere-immo-google-ads.mp4) · [`…-muet.mp4`](video/google-ads/premiere-immo-google-ads-muet.mp4) · [`poster.jpg`](video/google-ads/poster.jpg) |
| Démo générale | 25 s | [`video/demo/premiere-immo-demo.mp4`](video/demo/premiere-immo-demo.mp4) · [`…-muet.mp4`](video/demo/premiere-immo-demo-muet.mp4) · [`poster.jpg`](video/demo/poster.jpg) |

Format : 1920×1080, 30 i/s, H.264 + AAC, son normalisé à -14 LUFS (standard web). La version `-muet` n'a pas de piste audio : elle est plus légère pour une lecture automatique en arrière-plan.

## Google Ads immobilier : le film, plan par plan

La charte est celle du site, lue dans le projet Framer :
- **couleurs** : `#FF5100` orange, `#171717` encre, `#5E5E5E` gris, `#FCFCFC` fond, `#FFF1EA` orange doux, `#111111` et `#1B1B1B` pour les sections sombres ;
- **typographie** : Plus Jakarta Sans 800 avec un interlettrage serré ;
- **composants** : sur-titres orange avec point, boutons pilules avec flèche, cartes blanches arrondies, maquette Google « Position n°1 », notifications « Nouveau contact vendeur » ;
- **courbe d'animation** : `cubic-bezier(.2,.7,.2,1)` ;
- **logo** : le vrai logo du site.

| Temps | Plan | Message |
|---|---|---|
| 0–3,6 s | Recherche Google : « estimation maison » + « votre ville » | **Un propriétaire veut vendre ? Son premier réflexe : Google.** |
| 3,6–6 s | Sur « estimation maison », « Votre agence » remonte devant le concurrent et le portail. Bordure orange, badge « Position n°1 » | **Votre agence passe en tête.** La pastille « estimation maison + votre ville » se coche « N°1 » |
| 6–9,6 s | La recherche s'efface, on tape « agence immobilière ». Les résultats se rechargent avec un concurrent devant, puis « Votre agence » remonte en n°1. Clic sur l'annonce | La pastille « agence immobilière + votre ville » se coche « N°1 » |
| 9,6–13,6 s | L'annonce devient une notification, puis 3 contacts arrivent (demande d'estimation, appel entrant, formulaire) | **Les vendeurs vous contactent.** Contacts exclusifs, sans pige ni démarchage |
| 13,6–18 s | Le contact devient un RDV (« RDV fixé · Estimation jeudi 10 h »), puis un mandat signé à la main, tamponné « SIGNÉ » | **Vous estimez. Vous signez.** |
| 18–21 s | Le tampon remplit l'écran d'orange, les barres montent, la courbe grimpe | **Plus de mandats, plus de chiffre d'affaires.** |
| 21–25,6 s | Section sombre, comme « Nos leviers » sur le site : vos 4 leviers et 3 garanties | **On s'occupe de tout.** Campagne « vendeurs » · Campagne « agence + ville » · Acheteurs et locataires exclus · Appels et formulaires suivis · En ligne en 72 h · Compte à votre nom · Sans engagement |
| 25,6–28 s | Compteurs | **+500 campagnes · +8 000 contacts qualifiés · +300 professionnels accompagnés** |
| 28–32 s | Logo, ondes « secteur », bouton | **Votre secteur est-il encore disponible ?** Une seule agence par secteur · Appel de découverte gratuit · Sans engagement · 15 minutes |

Les textes reprennent ceux de la page Google Ads du site.

## Intégrer une vidéo sur le site

```html
<video src="/videos/premiere-immo-google-ads.mp4" poster="/videos/poster.jpg"
       autoplay muted loop playsinline controls style="width:100%;height:auto;border-radius:24px"></video>
```

- La lecture automatique n'est autorisée que **sans le son** (`muted`). Gardez `controls` pour que le visiteur puisse activer la musique.
- Dans Framer, envoyez le MP4 dans un composant **Video**, puis réglez Autoplay, Muted, Loop et le poster.
- Pour un fond décoratif, utilisez la version `-muet.mp4` sans `controls`.

## Structure du projet

```
compositions/
  _shared/engine.js        moteur commun : timeline GSAP en pause, révélations de texte, mesures, caméra, aperçu
  google-ads/              index.html · styles.css · main.js · assets/ (logo du site)
  demo/                    la démo générale
scripts/
  render.mjs               rendu image par image (Playwright → ffmpeg), flou de mouvement adaptatif
  synth.py                 synthétiseur partagé : instruments, effets d'interface, mastering
  score_google_ads.py      bande-son de la vidéo Google Ads
  score_demo.py            bande-son de la démo
  build.sh                 chaîne complète : ./scripts/build.sh <composition>
video/<composition>/       fichiers finaux
```

Fonctionnement :
1. Chaque composition est une timeline GSAP en pause. `window.__seek(t)` affiche l'image exacte à l'instant t.
2. `render.mjs` pilote la page dans Chromium. Il mesure d'abord la quantité de mouvement de chaque image, puis fait la moyenne de 6 à 48 sous-images selon la vitesse : c'est un vrai flou de mouvement, comme un obturateur à 180°. La conversion vers H.264 utilise la matrice de couleurs BT.709.
3. La timeline exporte ses repères sonores dans `build/<comp>/cues.json`. La partition s'en sert pour poser chaque bruitage au bon moment, sur une musique calée à 120 BPM.

## Refaire le rendu

Prérequis : Node 18+, Python 3.9+, ffmpeg (sinon `pip install imageio-ffmpeg`).

```bash
npm install
pip install numpy scipy pillow imageio-ffmpeg
npx playwright install chromium            # si Chromium n'est pas déjà présent

npx http-server . -p 8080 -c-1             # puis ouvrir /compositions/google-ads/ : aperçu temps réel
node scripts/render.mjs stills 4.5 12.8 --comp google-ads    # images fixes → build/google-ads/stills/
./scripts/build.sh google-ads              # rendu final → video/google-ads/ (≈ 15 à 20 min)
./scripts/build.sh google-ads --sub 1      # rendu rapide sans flou de mouvement
```

Dans l'aperçu : `espace` met en pause, `←` et `→` reculent ou avancent d'une seconde, et `?t=12.5` dans l'URL fige l'image à 12,5 s.

## Personnaliser

- **Textes** : directement dans `compositions/<comp>/index.html`.
- **Couleurs et police** : variables `:root` en haut de `styles.css`, alignées sur le projet Framer.
- **Rythme** : chaque scène est un bloc commenté de `main.js`, avec des temps en secondes sur une grille à 120 BPM (1 temps = 0,5 s).

## Crédits et droits

- Animation : [GSAP](https://gsap.com), gratuit y compris en usage commercial ([licence « no charge »](https://gsap.com/standard-license)).
- Polices : Plus Jakarta Sans, Inter, Inter Tight et Instrument Serif (SIL Open Font License), via Fontsource.
- Icônes : tracés dessinés pour le projet. La démo reprend des tracés de [Feather Icons](https://feathericons.com) (MIT).
- Logo, textes et chiffres de Première Immo : issus du site (projet Framer).
- Musique et effets sonores : **entièrement synthétisés par code**, sans aucun échantillon externe, donc libres de droits.

## À savoir

- Dans la vidéo Google Ads, certains éléments sont des **illustrations** : la recherche, les résultats concurrents, les notifications, les dates du calendrier, le mandat et le graphique. Le graphique ne porte volontairement aucun montant. Les chiffres +500, +8 000 et +300 viennent de la page du site.
- Pour la démo générale, le site n'était pas accessible à l'époque. Ses couleurs et son logo sont donc provisoires, contrairement à la vidéo Google Ads.
