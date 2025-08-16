"""
NEAR Intents AI Agent Package

This package provides an AI Agent for executing intents on NEAR Protocol.
It includes functionality for token swaps and other financial operations
using the NEAR Intents system.
"""

# Import only from near_intents.py to avoid circular imports
from .near_intents import (ASSET_MAP, IntentRequest, account,
                           create_account_from_dict, fetch_options,
                           intent_deposit, intent_swap,
                           register_intent_public_key, register_token_storage,
                           select_best_option)

__version__ = "0.1.0"
__author__ = "Jarrod Barnes"

__all__ = [
    "account",
    "create_account_from_dict",
    "register_intent_public_key",
    "intent_deposit",
    "intent_swap",
    "ASSET_MAP",
    "register_token_storage",
    "IntentRequest",
    "fetch_options",
    "select_best_option",
]
