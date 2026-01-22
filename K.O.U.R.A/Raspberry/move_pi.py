from gpiozero import Motor, DigitalOutputDevice, Servo

# --- Pins ---
# Left side (OUT1 / OUT2 + ENA)
LEFT_IN1 = 17   # left motor: forward
LEFT_IN2 = 18   # left motor: backward
LEFT_EN  = 22   # ENA 

# Right side (OUT3 / OUT4 + ENB)
RIGHT_IN3 = 23  # right motor: forward
RIGHT_IN4 = 24  # right motor: backward
RIGHT_EN  = 25  # ENB 

# --- Speed ---
BASE_SPEED = 0.9 
TURN_FACTOR = 0.3

# Tavaratila 
TRUNK_SERVO_PIN = 12

def _clamp(value: float, min_v: float, max_v: float) -> float:
    return max(min_v, min(max_v, value))

# L298N in use 
class RobotController:

    def __init__(self):
        self.left_motor = Motor(forward=LEFT_IN1, backward=LEFT_IN2, pwm=True)
        self.right_motor = Motor(forward=RIGHT_IN3, backward=RIGHT_IN4, pwm=True)
        self.left_enable = DigitalOutputDevice(LEFT_EN, initial_value=False)
        self.right_enable = DigitalOutputDevice(RIGHT_EN, initial_value=False)
        self.trunk_servo = Servo(
            TRUNK_SERVO_PIN,
            min_pulse_width=0.0009,
            max_pulse_width=0.0021,
            frame_width=0.02,
        )
        self.enabled = False


    def power_on(self):
        self.enabled = True
        self.left_enable.on()
        self.right_enable.on()


    def power_off(self):
        self.enabled = False
        self._apply_speed(0.0, 0.0)
        self.left_enable.off()
        self.right_enable.off()
        self.trunk_servo.value = None


    def set_trunk(self, direction: float): #servo, trunk
        if not self.enabled:
            self.trunk_servo.value = None
            return
        try:
            direction = float(direction)
        except (TypeError, ValueError):
            direction = 0.0
        direction = _clamp(direction, -1.0, 1.0)
        if abs(direction) < 0.05:
            self.trunk_servo.value = None
        else:
            speed = 0.3 if direction > 0 else -0.3
            self.trunk_servo.value = speed


    def _apply_speed(self, speed_left: float, speed_right: float):
        """
        Apply speed to both sides.

        speed [-1, 1]:
          > 0  -> forward
          < 0  -> backward
          = 0  -> stop
        """

        # Left side
        if speed_left > 0:
            self.left_motor.forward(speed_left)
        elif speed_left < 0:
            self.left_motor.backward(-speed_left)
        else:
            self.left_motor.stop()

        # Right side
        if speed_right > 0:
            self.right_motor.forward(speed_right)
        elif speed_right < 0:
            self.right_motor.backward(-speed_right)
        else:
            self.right_motor.stop()


    def set_direction(self, linear: float, angular: float):
        """
        Set robot motion based on linear / angular direction.
        linear  [-1, 0, 1]  backward / stop / forward
        angular [-1, 0, 1]  left / straight / right

        Examples:
          [ 1,  0]  -> straight forward
          [ 1,  1]  -> forward + slight right
          [ 1, -1]  -> forward + slight left
          [-1,  0]  -> straight backward
          [ 0,  1]  -> turn in place to the right
        """
        if not self.enabled:
            # not moving when power is off
            self._apply_speed(0.0, 0.0)
            return

        
        linear = _clamp(float(linear), -1.0, 1.0)
        angular = _clamp(float(angular), -1.0, 1.0)

        left_speed = 0.0
        right_speed = 0.0

        if linear != 0.0:
            direction = 1.0 if linear > 0 else -1.0
            left_speed = BASE_SPEED * direction
            right_speed = BASE_SPEED * direction


            if angular < -0.1:
                # turn left 
                left_speed *= TURN_FACTOR
            elif angular > 0.1:
                # turn right
                right_speed *= TURN_FACTOR

        else:
            # No linear motion
            if angular < -0.1:
                # rotate left, in place
                left_speed = -BASE_SPEED
                right_speed = BASE_SPEED
            elif angular > 0.1:
                # rotate right, in place
                left_speed = BASE_SPEED
                right_speed = -BASE_SPEED
            else:
                # full stop
                left_speed = 0.0
                right_speed = 0.0

        self._apply_speed(left_speed, right_speed)

    def stop(self): # set both motor speeds to zero
        self._apply_speed(0.0, 0.0)
        self.trunk_servo.value = None

