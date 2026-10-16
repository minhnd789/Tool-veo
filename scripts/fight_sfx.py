"""Tổng hợp âm thanh cho cảnh NinjaFight (chỉ cần numpy).

Chạy: python3 scripts/fight_sfx.py  ->  public/fight/sfx.wav
Các mốc thời gian khớp với src/fight/timeline.ts.
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 30.0
rng = np.random.default_rng(7)
out = np.zeros((int(SR * DUR), 2))


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(t / max(attack, 1e-4), 1.0) * np.exp(-t / decay)


def lowpass(x, cutoff):
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1 / (1 + (freqs / cutoff) ** 4)
    return np.fft.irfft(spec, len(x))


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def place(sig, at, gain=1.0, pan=0.0):
    start = int(at * SR)
    end = min(len(out), start + len(sig))
    if end <= start:
        return
    sig = sig[: end - start] * gain
    out[start:end, 0] += sig * (1 - pan) / 2 * 2 ** 0.5
    out[start:end, 1] += sig * (1 + pan) / 2 * 2 ** 0.5


def noise(seconds):
    return rng.standard_normal(int(SR * seconds))


def whoosh(seconds=0.35):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    sweep = np.sin(np.pi * t / seconds) ** 2
    return highpass(lowpass(noise(seconds), 2500), 300) * sweep * 0.5


def thump(size=1.0):
    n = int(SR * 0.6)
    t = np.arange(n) / SR
    freq = 120 * np.exp(-t * 8) + 45
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.002, 0.18)
    crack = lowpass(noise(0.6), 4000) * env(n, 0.001, 0.04)
    return (body * 0.9 + crack * 0.5) * size


def clang():
    n = int(SR * 0.9)
    t = np.arange(n) / SR
    partials = [(1870, 1.0), (2630, 0.6), (3410, 0.45), (4980, 0.3), (1210, 0.4)]
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + f / 1500)) for f, a in partials)
    return ring * 0.25 + highpass(noise(0.9), 3000) * env(n, 0.001, 0.02) * 0.4


def roar(seconds, cutoff=900, attack=0.3, release=0.5):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    shape = np.minimum(t / attack, 1) * np.minimum((seconds - t) / release, 1).clip(0, 1)
    flicker = 1 + 0.3 * lowpass(noise(seconds), 8)
    return lowpass(noise(seconds), cutoff) * shape * flicker


def explosion(size=1.0, seconds=2.0):
    n = int(SR * seconds)
    return lowpass(noise(seconds), 500) * env(n, 0.005, 0.5) * 1.6 * size


def chirps(seconds):
    """Tiếng 'ngàn chim hót' của Chidori: tiếng rít điện + nhiều tiếng chíp ngắn."""
    n = int(SR * seconds)
    t = np.arange(n) / SR
    buzz = highpass(noise(seconds), 2500) * (0.5 + 0.5 * (np.sin(2 * np.pi * 37 * t) > 0.3))
    sig = buzz * 0.25
    for _ in range(int(seconds * 28)):
        at = rng.uniform(0, seconds - 0.08)
        m = int(SR * 0.06)
        tt = np.arange(m) / SR
        f = rng.uniform(2500, 4200) + 9000 * tt
        chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.06)
        s = int(at * SR)
        sig[s : s + m] += chirp * 0.2
    shape = np.minimum(t / 0.4, 1) * np.minimum((seconds - t) / 0.2, 1).clip(0, 1)
    return sig * shape


def flutter(seconds):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    beats = (np.sin(2 * np.pi * 18 * t) > 0).astype(float)
    return lowpass(noise(seconds), 1800) * beats * np.exp(-t / (seconds * 0.6)) * 0.6


def taiko(at, gain):
    n = int(SR * 0.7)
    t = np.arange(n) / SR
    freq = 90 * np.exp(-t * 6) + 50
    place(np.sin(2 * np.pi * np.cumsum(freq) / SR) * env(n, 0.003, 0.25), at, gain)


# --- Nhạc nền: trống taiko 140 BPM + tiếng drone trầm.
drone_t = np.arange(len(out)) / SR
drone = (np.sin(2 * np.pi * 55 * drone_t) + 0.5 * np.sin(2 * np.pi * 82.4 * drone_t)) * 0.06
drone *= np.clip(drone_t / 2, 0, 1) * np.clip((29.2 - drone_t) / 0.5, 0, 1)
out[:, 0] += drone
out[:, 1] += drone
beat = 60 / 140
b = 3.0
while b < 28.4:
    if not (16.85 < b < 19.3):
        step = round((b - 3.0) / beat)
        taiko(b, 0.5 if step % 4 == 0 else 0.25)
        if step % 8 == 6:
            taiko(b + beat / 2, 0.25)
    b += beat

# --- Intro: hai nhân vật lướt vào, chữ VS đập xuống.
place(whoosh(0.9), 0.1, 0.8, -0.6)
place(whoosh(0.9), 0.1, 0.8, 0.6)
place(thump(1.3), 1.2, 0.9)
place(clang(), 1.2, 0.4)

# --- Ba lần lao vào chém nhau.
for t in [6.0, 6.55, 7.1, 7.65]:
    place(whoosh(), t, 0.7)
for t in [6.35, 6.9, 7.45, 8.0]:
    place(clang(), t, 0.9)
    place(thump(0.8), t, 0.7)
place(whoosh(0.6), 8.25, 0.5)

# --- Hoả độn.
place(roar(2.0, 400), 10.0, 0.6, -0.5)
place(roar(1.6, 1200, 0.1, 0.6), 12.0, 1.0, 0.2)
place(whoosh(0.5), 12.45, 0.6, 0.5)
place(explosion(1.0), 13.35, 1.0, 0.8)
place(thump(1.6), 13.35, 0.8, 0.8)

# --- Chidori và bầy quạ.
place(chirps(2.5), 14.4, 0.9, 0.5)
place(whoosh(0.4), 16.5, 0.9)
place(thump(1.2), 16.85, 0.9, -0.5)
place(flutter(1.4), 16.9, 0.9, -0.3)
place(flutter(1.2), 18.3, 0.7, -0.3)
place(whoosh(0.7), 17.7, 0.5, 0.4)

# --- Combo.
place(whoosh(0.4), 20.0, 0.8)
for k in range(12):
    t = 20.4 + k * 0.3 + 0.15
    pan = 0.3 if k % 2 == 0 else -0.3
    place(thump(0.9), t, 0.8, pan)
    if k % 3 == 2:
        place(clang(), t, 0.5, pan)
    place(whoosh(0.2), t - 0.12, 0.35, pan)
place(whoosh(0.5), 24.0, 0.6)

# --- Đối chưởng và vụ nổ cuối.
place(roar(1.0, 500), 25.0, 0.5, -0.6)
place(chirps(1.0), 25.0, 0.6, 0.6)
place(roar(2.6, 1500, 0.05, 0.1), 26.0, 0.9, -0.3)
place(chirps(2.6), 26.0, 0.9, 0.3)
place(explosion(1.8, 3.0), 28.5, 1.0)
place(thump(2.0), 28.5, 1.0)

# Chuẩn hoá và ghi file 16-bit.
out /= np.max(np.abs(out)) / 0.9
pcm = (out * 32767).astype(np.int16)
path = Path(__file__).resolve().parent.parent / 'public' / 'fight' / 'sfx.wav'
path.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(path), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f'Đã ghi {path}')
