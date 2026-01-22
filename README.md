# K.O.U.R.A.
K.O.U.R.A. - Kinetically Operated Unmanned Robotic Assistant

K.O.U.R.A. is a Wi-Fi teleoperated mobile robot built on Raspberry Pi 5, featuring a live camera feed and a LeRobot SO-101 leader–follower manipulator. The current prototype is optimized for collecting cans/bottles (pick -> store -> dump).

Demo (YouTube): https://youtube.com/shorts/VRBAXeBX33M

<img width="964" height="1280" alt="image-2025-12-8_20-22-22" src="https://github.com/user-attachments/assets/2a7b5962-941b-4b5a-9e80-7628d1490aa1" />


## What it does
- Drive a 4-wheel skid-steer base (WASD control in browser)
- Stream camera video to the web UI
- Teleoperate a SO-101 follower arm on the robot using a SO-101 leader arm on the operator laptop
- Dump the cargo bay with a servo-driven mechanism


## How it works
Network
- Raspberry Pi boots and creates its own Wi-Fi access point.
- On boot it auto-starts:
  - a WebSocket server (server_pi.py) 
  - drive control (move_pi.py)
  - SO-101 follower wrapper (so101_follower_wrapper.py)
  - camera pipeline services (systemd)
- Operator connects a laptop to the robot Wi-Fi and opens the web controller.

Control flows
- Web UI → WebSocket → Pi → L298N → DC motors
- Leader arm (laptop) → leader_bridge.py → WebSocket → Pi → follower arm servos
- Pi camera → streaming pipeline → Web UI


## Hardware
<img width="1800" height="1271" alt="image-2025-12-8_22-37-37" src="https://github.com/user-attachments/assets/00809a11-468d-49c6-96fa-e6dc02619692" />
<img width="1662" height="1024" alt="image-2025-12-10_20-55-10" src="https://github.com/user-attachments/assets/382b7d36-a389-4750-bcf0-4ce43fb6e1f7" />

- Compute: Raspberry Pi 5
- Vision: Raspberry Pi Camera 3
- Drive: 4× DC gear motors + L298N
- Manipulation: LeRobot SO-101 (Leader + Follower, 6-DoF with servomotors)
- Mechanics: laser-cut 3 mm acrylic chassis + 3D-printed brackets; dumpable cargo bay (180° servo + string)
- Power: separate batteries for Pi / arm / motors


## Software 
<img width="714" height="611" alt="image-2025-12-10_10-21-20" src="https://github.com/user-attachments/assets/e8412b09-3cbb-4076-a441-27efa0d8dd37" />

 Robot side (Raspberry Pi):
 - Python + systemd services (Wi-Fi AP, WebSocket server, drive, follower control, camera pipeline)

Operator side:
- Leader bridge: Python (leader_bridge.py) using the LeRobot stack
- Web app: React + WebSocket (browser teleop UI)

