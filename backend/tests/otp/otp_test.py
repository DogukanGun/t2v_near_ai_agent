import time
from unittest import TestCase

from utils.environment_manager import EnvironmentManager
from utils.security.otp import generate_otp, verify_otp


class OTPTest(TestCase):

    def test_otp_should_verified_in_interval(self):
        env_manager = EnvironmentManager()
        otp = generate_otp(env_manager)
        assert verify_otp(otp, env_manager)

    def test_otp_should_not_verified_out_interval(self):
        interval = 10
        env_manager = EnvironmentManager()
        otp = generate_otp(env_manager, interval=interval)
        time.sleep(interval * 2)
        assert not verify_otp(otp, env_manager)
