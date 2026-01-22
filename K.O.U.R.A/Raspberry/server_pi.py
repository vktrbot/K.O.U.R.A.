# server_pi
import json
import asyncio
import base64
import subprocess
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uvicorn

from move_pi import RobotController  

from so101_follower_wrapper import (
    SO101FollowerWrapper,
    SO101FollowerSettings,
)


app = FastAPI()
robot = RobotController()
arm_follower: Optional[SO101FollowerWrapper] = None


@app.get("/")
async def get_root():
    return HTMLResponse("<html><body><h1>Koura robot server</h1></body></html>")


async def handle_move(ws: WebSocket, content: dict):
    """
    Handle messages with type == 'move'.
    Expects content = { "direction": [angular, linear] }.
    """
    if not robot.enabled:
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": "Robot power is OFF (power_off). Ignoring move command.",
                }
            )
        )
        return

    direction = content.get("direction")
    print("handle_move got:", direction)

    if not isinstance(direction, list) or len(direction) != 2:
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": "content.direction must be a list [angular, linear]",
                }
            )
        )
        return

    angular, linear = direction
    robot.set_direction(linear, angular)

    await ws.send_text(
        json.dumps(
            {
                "type": "ack",
                "status": "ok",
                "received": {"direction": direction},
            }
        )
    )


async def handle_stop(ws: WebSocket, content: dict):
    robot.stop()
    await ws.send_text(json.dumps({"type": "ack", "status": "stopped"}))


async def handle_power(ws: WebSocket, content: dict):
    enabled = content.get("enabled")
    if isinstance(enabled, bool):
        if enabled:
            robot.power_on()
            status = "enabled"
        else:
            robot.power_off()
            status = "disabled"
    else:
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": "content.enabled must be a boolean (true/false)",
                }
            )
        )
        return

    await ws.send_text(json.dumps({"type": "ack", "status": status}))



async def handle_trunk(ws: WebSocket, content: dict):
    if not robot.enabled:
        await ws.send_text(json.dumps({
            "type": "error",
            "message": "Robot power is OFF (power_off). Ignoring trunk command."
        }))
        return
    direction = content.get("direction", 0)
    try:
        direction_f = float(direction)
    except (TypeError, ValueError):
        await ws.send_text(json.dumps({
            "type": "error",
            "message": "trunk.content.direction must be a number in [-1, 1]"
        }))
        return
    robot.set_trunk(direction_f)
    await ws.send_text(json.dumps({
        "type": "ack",
        "status": "ok",
        "received": {"direction": direction_f}
    }))



async def handle_arm_action(ws: WebSocket, content: dict):
    """
    type == 'arm_action'
    content = { "joints": { "shoulder_pan.pos": float, ... } }
    """
    global arm_follower

    if not robot.enabled:
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": "Robot power is OFF (power_off). Ignoring arm_action.",
                }
            )
        )
        return

    joints = content.get("joints")
    if not isinstance(joints, dict):
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": (
                        "arm_action.content.joints must be a dict "
                        "of joint_name -> float."
                    ),
                }
            )
        )
        return

   
    if arm_follower is None:
        settings = SO101FollowerSettings(
            port="/dev/ttyACM0", 
            robot_id="so101_follower_pi",
            use_degrees=True,
            calibrate_on_connect=False,
        )
        arm_follower = SO101FollowerWrapper(settings)
        try:
            arm_follower.connect()
            print("[server_pi] SO101 follower connected")
        except Exception as exc:
            print(f"[server_pi] Failed to connect SO101 follower: {exc}")
            await ws.send_text(
                json.dumps(
                    {
                        "type": "error",
                        "message": (
                            f"Cannot connect SO101 follower on {settings.port}: {exc}"
                        ),
                    }
                )
            )
            return

    try:
        applied = arm_follower.send_joint_action(joints)
        await ws.send_text(
            json.dumps(
                {
                    "type": "arm_action_ack",
                    "applied": applied,
                }
            )
        )
    except Exception as exc: 
  
        print(f"[server_pi] Error while sending arm_action: {exc}")
        await ws.send_text(
            json.dumps(
                {
                    "type": "error",
                    "message": f"SO101 follower error: {exc}",
                }
            )
        )


HANDLERS = {
    "move": handle_move,
    "stop": handle_stop,
    "power": handle_power,
    "arm_action": handle_arm_action,
    "trunk": handle_trunk,
}


async def capture_jpeg_bytes() -> Optional[bytes]:
   
    try:
        proc = await asyncio.to_thread(
            subprocess.run,
            ["libcamera-jpeg", "-n", "-o", "-"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if proc.returncode == 0 and proc.stdout:
            return proc.stdout

        print(
            "libcamera-jpeg failed:",
            proc.returncode,
            proc.stderr.decode("utf-8", "ignore"),
        )
        return None
    except Exception as e:  
        print("Exception in capture_jpeg_bytes:", e)
        return None


async def video_sender(ws: WebSocket, stop_event: asyncio.Event):
    """
    JSON type:
    { "type": "frame", "content": { "camera": "vehicle", "mime": "image/jpeg", "data": "<base64>" } }
    """
    try:
        while not stop_event.is_set():
            frame_bytes = await capture_jpeg_bytes()
            if not frame_bytes:
                await asyncio.sleep(0.2)
                continue

            b64 = base64.b64encode(frame_bytes).decode("ascii")
            msg = {
                "type": "frame",
                "content": {
                    "camera": "vehicle",
                    "mime": "image/jpeg",
                    "data": b64,
                },
            }

            try:
                await ws.send_text(json.dumps(msg))
            except WebSocketDisconnect:
                break

            await asyncio.sleep(0.12)
    except asyncio.CancelledError:
        pass


async def message_receiver(ws: WebSocket, stop_event: asyncio.Event):

    try:
        while True:
            data = await ws.receive_text()
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                await ws.send_text(
                    json.dumps({"type": "error", "message": "Invalid JSON"})
                )
                continue

            msg_type = msg.get("type")
            content = msg.get("content", {})

            handler = HANDLERS.get(msg_type)
            if handler is None:
                await ws.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "message": f"Unknown type: {msg_type}",
                        }
                    )
                )
                continue

            await handler(ws, content)

    except WebSocketDisconnect:
        print("[server_pi] WebSocketDisconnect (client closed)")
        robot.power_off()
        stop_event.set()
    except Exception as e: 
        print(f"[server_pi] Exception in message_receiver: {e}")
        robot.power_off()
        stop_event.set()



@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    stop_event = asyncio.Event()

    receiver_task = asyncio.create_task(message_receiver(ws, stop_event))
    sender_task = asyncio.create_task(video_sender(ws, stop_event))

    done, pending = await asyncio.wait(
        {receiver_task, sender_task},
        return_when=asyncio.FIRST_COMPLETED,
    )

    stop_event.set()

    for task in pending:
        task.cancel()
    await asyncio.gather(*pending, return_exceptions=True)

    
    try:
        await ws.close()
    except Exception:  
        pass


if __name__ == "__main__":
    uvicorn.run(app, host="10.42.0.1", port=8080)
