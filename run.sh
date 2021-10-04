#!/bin/bash
eval "$(/root/miniconda/bin/conda shell.bash hook)"
conda activate brave
cd /root/brave
pipenv run ./brave.py -c ./config/default.yaml
