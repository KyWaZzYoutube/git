#!/usr/bin/env python3
"""
Voix off des vidéos : synthèse vocale française.

Les prises retenues sont déjà dans compositions/<vidéo>/voix/ (avec voix.json :
texte, fichier, instant de début dans la vidéo, graine de la prise). Ce script ne
sert qu'à les régénérer, par exemple après avoir changé le texte.

  Modèle : Kyutai TTS 1.6B en/fr (kyutai/tts-1.6b-en_fr, poids sous licence CC-BY 4.0)
  Voix   : « developpeuse-3 » du dépôt kyutai/tts-voices, enregistrée par Kyutai
           et publiée sous licence CC0 (usage commercial libre)

Installation (environnement à part, sur processeur ≈ 8 s de calcul par seconde de voix) :
  python3 -m venv venv-voix
  venv-voix/bin/pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu
  venv-voix/bin/pip install moshi==0.2.11 sphn
  venv-voix/bin/python scripts/voix.py facebook            # régénère toutes les lignes
  venv-voix/bin/python scripts/voix.py agence a4 a7        # ou seulement certaines

Après une régénération, vérifiez l'instant « debut » de chaque ligne dans voix.json,
puis relancez ./scripts/build.sh <vidéo>.
"""
import json
import os
import sys

import numpy as np
import sphn
import torch
from moshi.models.loaders import CheckpointInfo
from moshi.models.tts import DEFAULT_DSM_TTS_REPO, TTSModel

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if len(sys.argv) < 2:
    sys.exit('usage : voix.py <vidéo> [lignes…]   (vidéo : facebook, agence…)')
DIR = os.path.join(ROOT, 'compositions', sys.argv[1], 'voix')
VOICE = 'unmute-prod-website/developpeuse-3.wav'

cfg = json.load(open(os.path.join(DIR, 'voix.json'), encoding='utf-8'))
only = set(sys.argv[2:])
torch.set_num_threads(os.cpu_count() or 4)
tts = TTSModel.from_checkpoint_info(CheckpointInfo.from_hf_repo(DEFAULT_DSM_TTS_REPO), n_q=32,
                                    temp=cfg['temperature'], device='cpu', dtype=torch.float32)
cond = tts.make_condition_attributes([tts.get_voice_path(VOICE)], cfg_coef=cfg['cfg'])
for line in cfg['lignes']:
    if only and line['id'] not in only:
        continue
    torch.manual_seed(line['prise']['graine'])
    entries = tts.prepare_script([line['texte']], padding_between=1)
    with torch.no_grad():
        res = tts.generate([entries], [cond])
        with tts.mimi.streaming(1):
            pcm = np.concatenate([np.clip(tts.mimi.decode(f[:, 1:, :]).cpu().numpy()[0, 0], -1, 1)
                                  for f in res.frames[tts.delay_steps:]], axis=-1)
    sphn.write_wav(os.path.join(DIR, line['fichier']), pcm, tts.mimi.sample_rate)
    print(f"{line['id']} : {len(pcm) / tts.mimi.sample_rate:.2f} s — {line['texte']}")
