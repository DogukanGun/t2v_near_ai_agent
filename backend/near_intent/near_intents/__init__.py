"""
NEAR Intents AI Agent Package

This package provides an AI Agent for executing intents on NEAR Protocol.
It includes functionality for token swaps and other financial operations
using the NEAR Intents system.
"""

from .ai_agent import AIAgent
from .near_intents import (
    account,
    register_intent_public_key,
    intent_deposit,
    intent_swap,
    ASSET_MAP,
    register_token_storage,
    IntentRequest,
    fetch_options,
    select_best_option,
)

__version__ = "0.1.0"
__author__ = "Jarrod Barnes"

__all__ = [
    "AIAgent",
    "account",
    "register_intent_public_key",
    "intent_deposit",
    "intent_swap",
    "ASSET_MAP",
    "register_token_storage",
    "IntentRequest",
    "fetch_options",
    "select_best_option",
] 