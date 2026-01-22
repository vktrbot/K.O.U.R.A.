from __future__ import annotations

import argparse
import asyncio
import json
from typing import Dict

import websockets
from websockets.exceptions import ConnectionClosed, WebSocketException


from lerobot.teleoperators.so101_leader import (
    SO101Leader,
    SO101LeaderConfig,
)


async def send_arm_actions(ws, leader: SO101Leader, fps: int) -> None:
    period = 1.0 / float(fps)

    while True:
        action: Dict[str, float] = await asyncio.to_thread(leader.get_action)

        payload = {
            "type": "arm_action",
            "content": {"joints": action},
        }
        await ws.send(json.dumps(payload))
        await asyncio.sleep(period)


async def bridge_main(
    pi_ws_url: str,
    teleop_port: str,
    teleop_id: str,
    fps: int,
) -> None:
    cfg = SO101LeaderConfig(
        port=teleop_port,
        id=teleop_id,
        use_degrees=True,
    )
    leader = SO101Leader(cfg)

    #connect with calibration
    leader.connect()
    print(
        f"[leader_bridge] SO101Leader connected on {teleop_port} "
        f"(id={teleop_id})"
    )

    try:
        while True:
            try:
                #disable client ping
                async with websockets.connect(
                    pi_ws_url,
                    ping_interval=None,
                    max_queue=1,
                ) as ws:
                    print(
                        f"[leader_bridge] Connected to Raspberry WS at {pi_ws_url}"
                    )

                    #turn robot power ON on every new  connection
                    power_msg = {
                        "type": "power",
                        "content": {"enabled": True},
                    }
                    await ws.send(json.dumps(power_msg))
                    print("[leader_bridge] Sent power ON")

                    #start main loop
                    await send_arm_actions(ws, leader, fps)

            except (ConnectionClosed, WebSocketException, OSError) as exc:
                print(f"[leader_bridge] WebSocket connection lost: {exc!r}")
                print("[leader_bridge] Reconnecting in 3 seconds...")
                await asyncio.sleep(3.0)
                continue
    finally:
        print("[leader_bridge] Disconnecting SO101Leader")
        leader.disconnect()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Bridge SO101Leader -> RaspberryPi SO101Follower over WebSocket",
    )
    parser.add_argument(
        "--pi-ws-url",
        type=str,
        default="ws://10.42.0.1:8080/ws",
        help="WebSocket URL Raspberry Pi (server_pi.py)",
    )
    parser.add_argument(
        "--teleop-port",
        type=str,
        required=True,
        help="Serial/USB",
    )
    parser.add_argument(
        "--teleop-id",
        type=str,
        default="so101_leader_laptop",
        help="ID for SO101Leader teleop",
    )
    parser.add_argument(
        "--fps",
        type=int,
        default=60,
        help="Send Hz",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    try:
        asyncio.run(
            bridge_main(
                pi_ws_url=args.pi_ws_url,
                teleop_port=args.teleop_port,
                teleop_id=args.teleop_id,
                fps=args.fps,
            )
        )
    except KeyboardInterrupt:
        print("\n[leader_bridge] Stopped by user")
