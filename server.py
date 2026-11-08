import asyncio
import json
import math
import random
import websockets

SUBCARRIERS = 30
BASE_DISTANCE = 2.5

def process_csi_data(tick):
    csi_amplitudes = []
    movement_factor = math.sin(tick * 0.1) * 1.5

    for i in range(SUBCARRIERS):
        noise = random.uniform(-0.2, 0.2)
        amp = 20 + math.sin(i * 0.3 + tick * 0.15) * 5 + movement_factor + noise
        csi_amplitudes.append(round(amp, 2))

    mean_amp = sum(csi_amplitudes) / len(csi_amplitudes)
    variance = sum((x - mean_amp) ** 2 for x in csi_amplitudes) / len(csi_amplitudes)

    angle = (tick * 5) % 360
    detected = variance > 1.2
    estimated_distance = round(BASE_DISTANCE + math.sin(tick * 0.05) * 0.8, 2)

    return {
        "timestamp": tick,
        "csi_raw": csi_amplitudes,
        "variance": round(variance, 3),
        "human_detected": detected,
        "radar": {
            "angle": angle,
            "distance_m": estimated_distance if detected else 0,
            "signal_strength_dbm": int(-50 - (variance * 2))
        }
    }

async def csi_stream(websocket):
    print("Client conectat la studioul WiFi CSI!")
    tick = 0
    try:
        while True:
            data = process_csi_data(tick)
            await websocket.send(json.dumps(data))
            tick += 1
            await asyncio.sleep(0.05)
    except websockets.exceptions.ConnectionClosed:
        print("Client deconectat.")

async def main():
    print("Serverul WiFi CSI Spatial Vision ruleaza pe ws://localhost:8765")
    async with websockets.serve(csi_stream, "0.0.0.0", 8765):
        await asyncio.get_running_loop().create_future()

if __name__ == "__main__":
    asyncio.run(main())
