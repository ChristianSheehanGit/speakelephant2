import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt
import os
import subprocess

def bandpass_filter(audio, samplerate, low_hz=1, high_hz=800):
    sos = butter(6, [low_hz, high_hz], btype='band', fs=samplerate, output='sos')
    return sosfilt(sos, audio)

def soft_spectral_subtraction(audio, samplerate, noise_duration=0.5, strength=0.3):
    noise_samples = int(noise_duration * samplerate)
    chunk_size = 2048
    hop_size = chunk_size // 2
    window = np.hanning(chunk_size)

    noise_chunks = []
    for i in range(0, noise_samples - chunk_size, hop_size):
        chunk = audio[i:i+chunk_size] * window
        noise_chunks.append(np.abs(np.fft.rfft(chunk)))
    noise_profile = np.mean(noise_chunks, axis=0)

    output = np.zeros(len(audio) + chunk_size)
    for i in range(0, len(audio) - chunk_size, hop_size):
        chunk = audio[i:i+chunk_size] * window
        spectrum = np.fft.rfft(chunk)
        magnitude = np.abs(spectrum)
        phase = np.angle(spectrum)
        clean_magnitude = np.maximum(magnitude - noise_profile * strength, magnitude * 0.4)
        clean_spectrum = clean_magnitude * np.exp(1j * phase)
        clean_chunk = np.fft.irfft(clean_spectrum) * window
        output[i:i+chunk_size] += clean_chunk

    return output[:len(audio)]

def normalize_rms(audio, target_rms=0.3):
    current_rms = np.sqrt(np.mean(audio**2))
    if current_rms == 0:
        return audio
    return audio * (target_rms / current_rms)

input_dir = "elephant_calls"
clean_dir = "elephant_calls_clean"
mp3_dir = "elephant_calls_mp3"

os.makedirs(clean_dir, exist_ok=True)
os.makedirs(mp3_dir, exist_ok=True)

for filename in os.listdir(input_dir):
    if not filename.endswith(".wav"):
        continue

    audio, samplerate = sf.read(f"{input_dir}/{filename}")
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    audio = bandpass_filter(audio, samplerate)
    audio = soft_spectral_subtraction(audio, samplerate)
    audio = normalize_rms(audio)

    wav_path = os.path.join(clean_dir, filename)
    mp3_path = os.path.join(mp3_dir, filename.replace(".wav", ".mp3"))

    sf.write(wav_path, audio, samplerate)

    subprocess.run(
        ["ffmpeg", "-i", wav_path, "-q:a", "4", mp3_path, "-y"],
        capture_output=True
    )

    print(f"Done: {filename}")