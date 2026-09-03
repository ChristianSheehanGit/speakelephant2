import numpy as np
import soundfile as sf
import os
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import librosa

input_dir = "elephant_calls_clean"
output_dir = "cluster_samples"
os.makedirs(output_dir, exist_ok=True)

def extract_features(filepath):
    audio, sr = sf.read(filepath)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)
    audio = audio.astype(np.float32)

    f0, _, _ = librosa.pyin(audio, fmin=23.5, fmax=500, sr=sr)
    f0_clean = f0[~np.isnan(f0)]
    mean_f0 = np.mean(f0_clean) if len(f0_clean) > 0 else 0

    centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
    mean_centroid = np.mean(centroid)

    rms = librosa.feature.rms(y=audio)
    mean_rms = np.mean(rms)
    rms_variance = np.var(rms)

    duration = len(audio) / sr

    zcr = librosa.feature.zero_crossing_rate(audio)
    mean_zcr = np.mean(zcr)

    mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=5)
    mfcc_means = np.mean(mfccs, axis=1)

    return np.array([
        mean_f0, mean_centroid, mean_rms, rms_variance,
        duration, mean_zcr, *mfcc_means
    ])

print("Extracting features...")
files = [f for f in os.listdir(input_dir) if f.endswith(".wav")]
features = []
valid_files = []

for f in files:
    try:
        feat = extract_features(os.path.join(input_dir, f))
        features.append(feat)
        valid_files.append(f)
        print(f"  {f}")
    except Exception as e:
        print(f"  SKIP {f}: {e}")

X = np.array(features)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

N_CLUSTERS = 8
print(f"\nClustering into {N_CLUSTERS} groups...")
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
labels = kmeans.fit_predict(X_scaled)

print("\nSaving representative samples...")
results = {}
for cluster_id in range(N_CLUSTERS):
    cluster_files = [valid_files[i] for i, l in enumerate(labels) if l == cluster_id]

    cluster_indices = [i for i, l in enumerate(labels) if l == cluster_id]
    center = kmeans.cluster_centers_[cluster_id]
    distances = np.linalg.norm(X_scaled[cluster_indices] - center, axis=1)
    closest = np.argsort(distances)[:3]
    samples = [valid_files[cluster_indices[i]] for i in closest]

    cluster_dir = os.path.join(output_dir, f"cluster_{cluster_id}")
    os.makedirs(cluster_dir, exist_ok=True)
    for s in samples:
        src = os.path.join(input_dir, s)
        dst = os.path.join(cluster_dir, s)
        audio, sr = sf.read(src)
        sf.write(dst, audio, sr)

    results[cluster_id] = {
        "count": len(cluster_files),
        "samples": samples,
        "files": cluster_files
    }
    print(f"  Cluster {cluster_id}: {len(cluster_files)} calls — samples: {samples[:3]}")

with open("cluster_map.json", "w") as f:
    json.dump({str(k): v for k, v in results.items()}, f, indent=2)

print("\nDone. Listen to cluster_samples/ and assign meanings.")
print("Then edit cluster_map.json to add a 'label' field to each cluster.")