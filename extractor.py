import pandas as pd
import soundfile as sf
import numpy as np
import os

df = pd.read_csv("timestamps.csv")  # or read_csv

output_dir = "elephant_calls"
os.makedirs(output_dir, exist_ok=True)

for i, row in df.iterrows():
    filename = row["Sound_file"]
    start_sec = row["Start_time"]
    end_sec = row["End_time"]

    audio, samplerate = sf.read(f"recordings/{filename}")
    
    start_sample = int(start_sec * samplerate)
    end_sample = int(end_sec * samplerate)
    clip = audio[start_sample:end_sample]
    
    sf.write(f"{output_dir}/call_{i:03d}.wav", clip, samplerate)
    print(f"Exported call {i}")