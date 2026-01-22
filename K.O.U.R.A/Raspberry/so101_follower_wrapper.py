from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional

from lerobot.robots.so101_follower import (
    SO101Follower,
    SO101FollowerConfig,
)


@dataclass
class SO101FollowerSettings:
    port: str = "/dev/ttyACM0"
    robot_id: str = "so101_follower_pi"
    use_degrees: bool = True
    calibrate_on_connect: bool = False


class SO101FollowerWrapper:
    def __init__(self, settings: SO101FollowerSettings):
        self._settings = settings
        self._robot: Optional[SO101Follower] = None

    @property
    def is_connected(self) -> bool:
        return self._robot is not None and self._robot.is_connected

    def connect(self) -> None:
        if self.is_connected:
            return

        cfg = SO101FollowerConfig(
            port=self._settings.port,
            id=self._settings.robot_id,
            use_degrees=self._settings.use_degrees,
            cameras={},
        )
        robot = SO101Follower(cfg)
        robot.connect(calibrate=self._settings.calibrate_on_connect)
        self._robot = robot

    def disconnect(self) -> None:
        if self._robot is not None and self._robot.is_connected:
            self._robot.disconnect()

    def send_joint_action(self, joints: Dict[str, float]) -> Dict[str, float]:
        if not self.is_connected:
            self.connect()

        assert self._robot is not None
  
        return self._robot.send_action(joints)
