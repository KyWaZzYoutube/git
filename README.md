# Première Immo — vidéos motion design

Vidéos animées pour **premiere-immo.fr**, rendues image par image à partir de compositions HTML/GSAP, avec une bande-son entièrement synthétisée par code.

| Vidéo | Durée | Fichiers |
|---|---|---|
| **Realty · bande démo du logiciel** pour la page d'accueil de realty.fr | 1 min 54 | [`video/realty/realty-bande-demo.mp4`](video/realty/realty-bande-demo.mp4) · [`…-web.mp4`](video/realty/realty-bande-demo-web.mp4) (16 Mo, pour la page d'accueil) · [`…-muet.mp4`](video/realty/realty-bande-demo-muet.mp4) · [`poster.jpg`](video/realty/poster.jpg) |
| **Agence de publicité immobilière** pour la page `/agence-publicite-immobiliere` | 36 s | [`video/agence/premiere-immo-agence-publicite.mp4`](video/agence/premiere-immo-agence-publicite.mp4) · [`…-muet.mp4`](video/agence/premiere-immo-agence-publicite-muet.mp4) · [`poster.jpg`](video/agence/poster.jpg) |
| **Publicité Facebook immobilier** pour la page `/publicite-facebook-immobilier` (avec voix off) | 32 s | [`video/facebook/premiere-immo-facebook.mp4`](video/facebook/premiere-immo-facebook.mp4) · [`…-sans-voix.mp4`](video/facebook/premiere-immo-facebook-sans-voix.mp4) · [`…-muet.mp4`](video/facebook/premiere-immo-facebook-muet.mp4) · [`poster.jpg`](video/facebook/poster.jpg) |
| **Google Ads immobilier** pour la page `/google-ads-immobilier` | 32 s | [`video/google-ads/premiere-immo-google-ads.mp4`](video/google-ads/premiere-immo-google-ads.mp4) · [`…-muet.mp4`](video/google-ads/premiere-immo-google-ads-muet.mp4) · [`poster.jpg`](video/google-ads/poster.jpg) |
| Démo générale | 25 s | [`video/demo/premiere-immo-demo.mp4`](video/demo/premiere-immo-demo.mp4) · [`…-muet.mp4`](video/demo/premiere-immo-demo-muet.mp4) · [`poster.jpg`](video/demo/poster.jpg) |

Une **landing page** complète accompagne les vidéos : voir « Landing page » plus bas ([`landing/`](landing/), aperçu filmé : [`video/landing/apercu-landing-page.mp4`](video/landing/apercu-landing-page.mp4)).

Format : 1920×1080, 30 i/s, H.264 + AAC, son normalisé à -14 LUFS (standard web). La version `-muet` n'a pas de piste audio : elle est plus légère pour une lecture automatique en arrière-plan. La version `-sans-voix` garde la musique et les effets, sans la voix off.

## Landing page « agence de publicité immobilière »

Une page autonome (HTML, CSS, JavaScript, sans outil de construction) dans [`landing/`](landing/), pensée pour les campagnes publicitaires. Elle reprend la **structure** et les **types d'animation** de la page « motion design » de l'agence Cut, donnée en exemple : thème sombre, orange, gros titres condensés, pastilles lumineuses. Le contenu est celui de Première Immo : textes, chiffres, tarifs, avis et questions de premiere-immo.fr. Les textes, les images et le code sont originaux : rien n'est repris de la page d'exemple.

| Section | Contenu | Animation |
|---|---|---|
| Accueil | « Agence de publicité **100 % immobilier** », preuves (+500 campagnes, +8 000 contacts, une agence par secteur), vidéo « agence » | Le décor « soie orange » s'allume, la navigation descend, le titre monte mot par mot, la pastille arrive lettre par lettre. Pastilles « aimantées » qui suivent la souris. Vidéo muette en boucle, « Activer le son » la relance avec le son |
| Bandeau | Agences indépendantes, agents de réseau, mandataires, leviers | Défilement horizontal infini |
| Nos leviers en vidéo | Les 3 vidéos (Google Ads, Facebook et Instagram, agence) | Carrousel en boucle, carte centrale et voisines, flèches, points (le point actif s'allonge), glisser au doigt, lecture au clic |
| La pige ne suffit plus | 5 cartes « bento » | Les leviers convergent vers le logo et un « contact vendeur » en sort (impulsions lumineuses en boucle), citation sur fond flouté, barres qui montent (+8 000), secteur qui s'allume dans un nid d'abeilles |
| Méthode | 5 étapes (appel découverte → optimisation) | Cartes inclinées qui se posent une à une, captures qui flottent, halo qui respire |
| Tarifs | Google 199 €/mois, Facebook et Instagram 139 €/mois, référencement 119 € | Surlignage peint de gauche à droite, cartes qui montent, traits qui se tracent, prix qui défilent, avantages un par un, braises orange en fond |
| Avis | Les 3 avis publiés sur le site | Trois colonnes qui défilent en sens inverses (une seule sur mobile) |
| Rendez-vous | Agenda Calendly `premiere-immo/appel-de-decouverte` | Chargé seulement à l'approche de la section |
| FAQ | 7 questions du site | Ouverture animée, « + » qui devient « − » |
| Appel final et pied de page | « Votre secteur est-il **encore disponible ?** » | Cartes inclinées en 3D qui défilent, grand logo sur une lueur orange |

La page est responsive (testée à 390 px de large), lisible sans JavaScript, et respecte le réglage « réduire les animations ». Les vidéos sont des versions web légères (720p, ≈ 2 Mo) dans `landing/media/`.

- **Voir la page** : `npm run landing` (ou ouvrir `landing/index.html` via un petit serveur local).
- **Captures et vidéo d'aperçu** : `npm run landing:shots` (→ `build/landing/shots/`) et `npm run landing:video` (→ `video/landing/apercu-landing-page.mp4`).
- **Mettre en ligne** : envoyer le dossier `landing/` tel quel sur un hébergement statique (Netlify, Vercel, OVH…), par exemple sur un sous-domaine dédié aux publicités. Ajoutez-y vos balises de suivi (pixel Meta, conversion Google Ads) dans le `<head>` de `index.html`.
- **Fonds « soie orange »** : calculés par `scripts/landing_silk.py` (aucune image externe).
- Les couleurs de l'agenda Calendly (fond sombre, orange) ne s'appliquent qu'avec une offre Calendly payante ; sinon l'agenda garde ses couleurs par défaut.

## Realty · bande démo du logiciel : le film, plan par plan

Bande démo de 1 min 54 pour la page d'accueil de **realty.fr**. Les 20 fonctionnalités sont présentées **dans l'ordre fourni**, en **un seul plan continu** : il n'y a pas de « diapositives » qui entrent et sortent, ce sont les objets eux-mêmes qui passent d'une fonctionnalité à la suivante (l'icône devient le logo de l'application, la carte rentre dans le téléphone, la même fiche du bien traverse quatre fonctionnalités, le rapport devient le téléphone du mandat, la photo devient le bouton…). Le fond passe du lavande au violet en s'ouvrant en cercle depuis l'objet que l'on touche, puis se referme sur l'objet suivant.

Charte de la vidéo « logiciel immobilier » de Realty : fond lavande à anneaux concentriques, cartes blanches, texte encre `#141B33`, mots clés dans un **badge violet** `#3300FF` (badge blanc sur fond violet), police **Manrope**. Aucun dégradé sur le texte : le dégradé du logo n'apparaît que dans le logo et les illustrations.

| Temps | Fonctionnalité | Ce qui se passe |
|---|---|---|
| 0–3,7 s | Ouverture | Fond violet, dix outils flottent : « Une agence, c'est **dix outils** à jongler. » Ils sont aspirés au centre, flash blanc |
| 3,7–7,6 s | Logo | Les deux pilules se rejoignent, le logotype sort de l'icône : « Le logiciel immobilier que vous **attendiez** », « Logiciel, site web, application mobile, pige et contrats : une seule offre. » |
| 7,6–12,9 s | Cartes stratégiques | L'icône vole jusqu'au logo de l'application, qui s'ouvre autour d'elle. La carte s'incline en 3D, les îlots chauffent (turnover, ventes, honoraires), Julie, Marc et Sofia reçoivent leurs îlots |
| 12,9–18,4 s | Prospection terrain | On fonce dans la carte, qui devient celle du téléphone : saisie « Famille Lefèvre », projet « Vente », les relances sortent du téléphone (J+1, J+15, M+2, M+6) |
| 18,4–23,1 s | Prospection cadastrale | On plonge dans la carte du téléphone : parcelles, radar, 7 calques qui s'allument, 137 futurs vendeurs |
| 23,1–27,6 s | Saisie assistée | Un marqueur s'ouvre en fiche du bien ; les données officielles arrivent depuis leurs sources (BAN, cadastre, registre, ADEME, Géorisques) |
| 27,6–33 s | Magic Scan | La même fiche se range à droite ; documents en vrac, scan, rangement, la fiche se remplit (42 champs) |
| 33–37,7 s | Saisie par IA | Clic sur le micro de la fiche : le fond devient violet. Dictée, photos aspirées par l'orbe, la fiche se retourne en annonce générée |
| 37,7–42,2 s | Estimations | Le fond se referme sur le prix : 685 000 €, fourchette, 4 méthodes, la fiche devient le rapport et ses pages s'ouvrent en éventail |
| 42,2–47,8 s | Mandat sur mobile | Le rapport devient le téléphone : chrono 00:28, signature, SMS et email, tampon « Signé » |
| 47,8–55 s | Valorisation | L'écran du téléphone s'agrandit en cadre photo : retouche, home staging, visite 360°, vidéo immersive |
| 55–63,3 s | Commercialisation | Le cadre devient le bouton ; clic : le fond s'ouvre en violet, 9 actions en étoile. Pause café, « Le lendemain… », 3 visites |
| 63,3–68 s | Retours de visite | La 1re visite devient l'avis de visite (notes, commentaires, compte rendu au vendeur) |
| 68–73 s | Click & Visit | L'avis devient l'annonce : « Planifier une visite », agendas croisés, SMS, bon de visite |
| 73–77,8 s | Site web inclus | L'annonce devient le site d'agence (fond violet) : module glissé, couleurs, SEO, GEO, Ads, domaine |
| 77,8–82 s | Offre d'achat | Le site redevient l'application : Actions → Nouvelle offre, prix, honoraires, validité, envoi |
| 82–86,3 s | Compromis | L'offre devient le compromis, tout le dossier est annexé en 1 clic, chrono 1:52 |
| 86,3–91 s | SRU et notaires | Le compromis se plie dans l'enveloppe : recommandé aux acquéreurs, dossier complet aux notaires |
| 91–97,3 s | Automatisations | Tout se resserre en moyeu, le fond devient violet, 9 scénarios reliés par des impulsions |
| 97,3–101,4 s | Reporting | Le moyeu devient le tableau de bord : chiffres d'affaires, honoraires, équipe |
| 101,4–104,3 s | TRACFIN (bientôt) | Un scan parcourt le tableau de bord, bouclier, alerte de vigilance |
| 104,3–107,2 s | Formation ALUR (bientôt) | Le tableau de bord devient le téléphone : 11 h sur 14 h, modules |
| 107,2–114 s | Fin | Le fond violet se referme en logo : « Le logiciel immobilier que vous **attendiez** », tout inclus 99 € HT/mois · 5 utilisateurs, « Réserver une démo », realty.fr |

**Son** : musique électronique lumineuse à 120 BPM (la m – fa – do – sol) : montée sous les dix outils, boum sur le logo, groove qui démarre quand l'application apparaît, relance au clic « Démarrer la commercialisation », pause café au piano électrique, impact final en do majeur. Environ 280 bruitages posés sur les repères de la timeline (ouvertures et fermetures du fond, transformations, badges, clics, frappe, notifications, scan, stylo, tampon, compteurs). Tout est synthétisé par `scripts/score_realty.py`, sans échantillon externe.

Photos des biens : Unsplash (voir « Crédits et droits »). Les noms, adresses, chiffres et interfaces sont des illustrations.

## Agence de publicité immobilière : le film, plan par plan

La vidéo de la page « agence » présente toute l'offre en 36 s : pourquoi la prospection classique ne suffit plus, les trois leviers, les résultats, la méthode, puis l'appel à l'action. Elle reprend la mise en page de la page du site (projet Framer, `PIAgency.tsx`) : sur-titres orange précédés d'un trait, cartes « bento » sur fond pêche, onglets des leviers, ligne de méthode en 5 étapes, chiffres, bandeau orange final. Les textes et les chiffres sont ceux de la page.

Le son est celui des vidéos Google Ads et Facebook : **pas de voix off**, seulement la musique « tech-house sombre » de la vidéo Facebook (ici sol mineur → si bémol majeur, avec le boum de sub quand l'écran passe à l'orange) et les bruitages. Tout est calé sur le tempo (120 BPM) : les croix, les étapes de la méthode et les notifications tombent sur les temps, et chaque levier change avec l'accord.

| Temps | Plan | Message |
|---|---|---|
| 0–6 s | Bento « Pourquoi maintenant » : trois cartes barrées d'une croix, une tous les deux temps. La carte orange « La solution » arrive, puis remplit l'écran | **Pige, portails, flyers : ça ne suffit plus.** Depuis le 11 août 2026, la pige à froid n'est plus possible · Des contacts partagés · Impossible de mesurer |
| 6–10 s | Bandeau orange, logo, les quatre leviers en pastilles | **Les vendeurs de votre secteur vous contactent.** Agence de publicité 100 % immobilier |
| 10–14 s | Onglet « Google Ads » : la recherche « estimation maison » + « votre ville », « Votre agence » passe devant le concurrent et le portail, badge « Position n°1 » | **Le levier le plus direct pour rentrer des mandats** |
| 14–18 s | Onglet « Facebook et Instagram » : votre publicité dans le fil d'un propriétaire, puis une demande d'estimation | **Faites-vous connaître avant que le propriétaire cherche** |
| 18–22 s | Onglet « Référencement naturel » : la courbe des visites venues de Google monte | **Une visibilité durable, sans budget publicitaire** |
| 22–26 s | Compteur et contacts entrants (Google Ads, Facebook, votre site) | **+8 000 contacts qualifiés générés** · +500 campagnes créées · +300 professionnels accompagnés · +4 années d'expérience en publicité |
| 26–30 s | Les 5 étapes de la méthode s'allument, une par temps. La dernière étape remplit l'écran d'orange | **On s'occupe de tout.** Une seule agence par secteur · Comptes à votre nom · Sans engagement |
| 30–36 s | Logo, titre, bouton qui pulse | **Votre secteur est-il encore disponible ?** Appel de découverte gratuit · Sans engagement · 15 minutes · Réponse immédiate sur votre zone |

Pour la page, l'affiche (`poster.jpg`) est l'image du bandeau orange « Les vendeurs de votre secteur vous contactent », à 9 s.

## Publicité Facebook immobilier : le film, plan par plan

Une vidéo pensée pour des agents qui ne connaissent pas le marketing digital : un seul message par plan, et le parcours du propriétaire en 5 étapes, comme sur la page. À gauche, les 5 étapes se cochent une à une. À droite, un téléphone montre chaque étape.

La charte est celle de la page Facebook du site (projet Framer, `PIFacebook.tsx`) : encre `#141414`, orange `#FF5100`, pêche `#FFF1EA`, crème `#F4F4F4`, bleu Facebook `#1877F2`, Plus Jakarta Sans 800, sur-titres en pastille, panneau dégradé pêche et maquette de téléphone du haut de page.

Le fil Facebook du téléphone utilise de **vraies photos** pour être crédible : la maison de la publicité, la plage et le chien des publications d'« amis », et deux photos de profil sans visage. Elles sont dans `compositions/facebook/assets/` (sources et licences dans « Crédits et droits »).

La musique suit le style des motions « produit » donnés en référence : intro atmosphérique, boum de sub au départ des étapes (4 s), kick 808 profond sur chaque temps, peu de médiums, roulements avant les transitions, puis une fin lumineuse (fa# mineur → la majeur).

**Voix off** : une voix féminine française, dynamique, presque continue, comme dans la référence. C'est une voix de synthèse (voir « Crédits et droits »). La musique s'efface sous la voix, et le fond laisse de la place aux fréquences de la parole. Le texte, calé sur l'image :

| Temps | Voix off |
|---|---|
| 0,4 s | « Vos futurs vendeurs sont sur Facebook. Chaque jour. » |
| 4,3 s | « Un propriétaire de votre secteur voit votre publicité. » |
| 7,6 s | « En deux clics, il demande une estimation. » |
| 10,7 s | « Vous recevez son contact : tout de suite, et rien qu'à vous. » |
| 13,8 s | « Vous le rappelez, et vous fixez le rendez-vous. » |
| 17,9 s | « Et vous signez le mandat. » (« mandat » tombe sur le coup de tampon) |
| 20,3 s | « Et nous, chez Première Immo, on s'occupe de tout. » |
| 24,1 s | « Comme Lucas, à Lyon : deux mandats signés en deux mois. » |
| 28,3 s | « Votre secteur est-il encore disponible ? » |
| 30,4 s | « Réservez votre appel gratuit. » |

Les prises retenues sont dans `compositions/facebook/voix/` : un fichier par phrase, et `voix.json` pour le texte et l'instant de départ. Pour changer une phrase, modifiez `voix.json`, régénérez-la avec `scripts/voix.py facebook l3` (installation décrite en tête du script), puis relancez `SKIP_RENDER=1 ./scripts/build.sh facebook` : l'image est réutilisée et seul le son est refait. Vous pouvez aussi remplacer les fichiers par l'enregistrement d'une comédienne, aux mêmes noms.

| Temps | Plan | Message |
|---|---|---|
| 0–4 s | Des propriétaires apparaissent autour du titre, avec leurs « J'aime ». Ils rejoignent ensuite le fil du téléphone | **Vos futurs vendeurs sont sur Facebook.** +40 M d'utilisateurs de Facebook en France |
| 4–7 s | Étape 1. Le propriétaire fait défiler son fil et tombe sur la publicité de votre agence, entourée d'orange. Une carte montre la zone ciblée | **Il voit votre publicité.** Dans son fil Facebook, dans votre secteur |
| 7–10,5 s | Étape 2. 1er clic sur « En savoir plus » : le formulaire s'ouvre. Adresse saisie, téléphone pré-rempli. 2e clic : « Demande envoyée », « Merci ! » | **Il demande une estimation.** En 2 clics, sans quitter Facebook |
| 10,5–13,5 s | Étape 3. Le téléphone se retourne : c'est le vôtre (« Vous, l'agence »). Il vibre : « Nouveau contact vendeur » | **Vous recevez le contact.** Tout de suite, et rien qu'à vous : contact exclusif |
| 13,5–17 s | Étape 4. La notification s'ouvre sur la fiche du contact, vous touchez « Rappeler », l'appel démarre | **Vous le rappelez.** RDV fixé : estimation jeudi 10 h |
| 17–20 s | Étape 5. Le mandat (origine : publicité Facebook) est signé à la main et tamponné « SIGNÉ ». Les 5 étapes sont cochées | **Vous signez le mandat.** Sans pige, sans portail |
| 20–23,6 s | Le tampon remplit l'écran d'orange : les visuels, les annonces, le ciblage, le suivi | **Et on s'occupe de tout.** En ligne en 72 h · Compte à votre nom · Sans engagement |
| 23,6–28 s | Avis client publié sur le site (extrait), 5 étoiles | « Je n'y connaissais strictement rien en publicité en ligne. Ils ont tout configuré. » **6 estimations et 2 mandats signés en deux mois.** Lucas R., ERA Lyon 6e |
| 28–32 s | Logo, ondes « secteur », bouton | **Votre secteur est-il encore disponible ?** Une seule agence par secteur · Appel de découverte gratuit · Sans engagement · 15 minutes |

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
landing/                   landing page autonome : index.html · css/ · js/ · img/ · media/ (vidéos web) · fonts/ · vendor/ (GSAP)
compositions/
  _shared/engine.js        moteur commun : timeline GSAP en pause, révélations de texte, mesures, caméra, aperçu
  _shared/assets/          logo du site
  realty/                  bande démo Realty : index.html · styles.css · main.js · assets/ (logotypes, photos des biens)
  agence/                  index.html · styles.css · main.js
  facebook/                index.html · styles.css · main.js · assets/ (photos du fil Facebook) · voix/ (voix off)
  google-ads/              index.html · styles.css · main.js
  demo/                    la démo générale
scripts/
  render.mjs               rendu image par image (Playwright → ffmpeg), flou de mouvement adaptatif
  synth.py                 synthétiseur partagé : instruments, effets d'interface, mixage de la voix off, mastering
  score_realty.py          bande-son de la bande démo Realty
  score_agence.py          bande-son de la vidéo « agence de publicité immobilière »
  score_facebook.py        bande-son de la vidéo Facebook
  voix.py                  synthèse de la voix off (Kyutai TTS), si l'on veut changer le texte
  score_google_ads.py      bande-son de la vidéo Google Ads
  score_demo.py            bande-son de la démo
  build.sh                 chaîne complète : ./scripts/build.sh <composition>
  landing_silk.py          fonds « soie orange » de la landing page
  landing_preview.mjs      captures et vidéo d'aperçu de la landing page
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

npx http-server . -p 8080 -c-1             # puis ouvrir /compositions/facebook/ : aperçu temps réel
node scripts/render.mjs stills 4.5 12.8 --comp facebook      # images fixes → build/facebook/stills/
./scripts/build.sh facebook                # rendu final → video/facebook/ (≈ 15 à 20 min)
./scripts/build.sh google-ads              # idem pour la vidéo Google Ads
./scripts/build.sh agence                  # idem pour la vidéo « agence de publicité immobilière »
./scripts/build.sh facebook --sub 1        # rendu rapide sans flou de mouvement
```

Dans l'aperçu : `espace` met en pause, `←` et `→` reculent ou avancent d'une seconde, et `?t=12.5` dans l'URL fige l'image à 12,5 s.

## Personnaliser

- **Textes** : directement dans `compositions/<comp>/index.html`.
- **Couleurs et police** : variables `:root` en haut de `styles.css`, alignées sur le projet Framer.
- **Rythme** : chaque scène est un bloc commenté de `main.js`, avec des temps en secondes sur une grille à 120 BPM (1 temps = 0,5 s).

## Crédits et droits

- Animation : [GSAP](https://gsap.com), gratuit y compris en usage commercial ([licence « no charge »](https://gsap.com/standard-license)).
- Polices : Plus Jakarta Sans, Inter, Inter Tight, Instrument Serif et Anton (SIL Open Font License), via Fontsource.
- Icônes : tracés dessinés pour le projet. La démo reprend des tracés de [Feather Icons](https://feathericons.com) (MIT).
- Voix off de la vidéo Facebook : **voix de synthèse** générée avec [Kyutai TTS 1.6B](https://huggingface.co/kyutai/tts-1.6b-en_fr) (modèle de Kyutai, laboratoire français, poids sous licence CC-BY 4.0), voix « developpeuse-3 » du dépôt [kyutai/tts-voices](https://huggingface.co/kyutai/tts-voices), enregistrée par Kyutai et publiée sous licence CC0. Usage commercial autorisé. Bonne pratique : indiquer « voix générée par IA » dans la description de la vidéo.
- Photos des vidéos Facebook et « agence » (la vidéo « agence » reprend la photo de la maison dans sa maquette Facebook) : [Unsplash](https://unsplash.com/license), licence Unsplash (usage commercial gratuit, sans autorisation ni mention obligatoire). Fichiers d'origine : maison `images.unsplash.com/photo-1523217582562-09d0def993a6`, plage `photo-1507525428034-b723cf961d3e`, chien `photo-1543466835-00a7907e9de1`, fleurs `photo-1490750967868-88aa4486c946`, montagne `photo-1464822759023-fed622ff2c3b`. Aucune photo ne montre de visage.
- Logo, textes et chiffres de Première Immo : issus du site (projet Framer).
- Bande démo Realty : police Manrope (SIL Open Font License, via Fontsource). Logo, couleurs, offre « 99 € HT/mois, 5 utilisateurs » et liste des fonctionnalités : issus du site realty.fr, de la refonte en cours et du brief. Photos des biens : [Unsplash](https://unsplash.com/license), licence Unsplash ; fichiers d'origine `photo-1600585154340-be6161a56a0c` (maison bois), `photo-1600596542815-ffad4c1539a9` (villa piscine), `photo-1600607687939-ce8a6c25118c` (salon design), `photo-1560448204-e02f11c3d0e2` (salon lumineux), `photo-1586023492125-27b2c045efd7` (fauteuil), `photo-1502672260266-1c1ef2d93688` (salon plantes), plus la maison déjà utilisée dans la vidéo Facebook.
- Musique et effets sonores : **entièrement synthétisés par code**, sans aucun échantillon externe, donc libres de droits.

## À savoir

- Dans la vidéo Facebook, l'interface de Facebook, le formulaire, la notification, l'appel, le rendez-vous et le mandat sont des **illustrations**, comme la maquette de téléphone du site. Les photos du fil sont des photos libres de droits, et les noms, l'adresse et le numéro sont fictifs. Le chiffre « +40 M d'utilisateurs » et l'avis de Lucas R. viennent de la page Facebook du site. L'avis est cité en extrait.
- Dans la vidéo Google Ads, certains éléments sont des **illustrations** : la recherche, les résultats concurrents, les notifications, les dates du calendrier, le mandat et le graphique. Le graphique ne porte volontairement aucun montant. Les chiffres +500, +8 000 et +300 viennent de la page du site.
- Dans la vidéo « agence », la recherche Google, les résultats concurrents, la publicité Facebook, les notifications et la courbe de visites sont des **illustrations**. La courbe ne porte volontairement aucun chiffre. Les chiffres (+8 000, +500, +300, +4), la date du 11 août 2026, le délai de 72 h et l'exclusivité par secteur viennent de la page du site.
- Pour la démo générale, le site n'était pas accessible à l'époque. Ses couleurs et son logo sont donc provisoires, contrairement à la vidéo Google Ads.
