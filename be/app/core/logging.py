# Author:             Patrik Kišeda ( xkised00 )
# File:                   logging.py
# Functionality :   logging configuration

import logging
import sys


def setup_logging() -> None:
	# configures application logging
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s %(levelname)s %(name)s %(message)s",
		stream=sys.stdout,
	)
