"""
Cohere API Configuration
Handles API key management and model selection for Cohere native tool calling.
"""

import os
from typing import Literal

# Cohere API Configuration
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError(
        "COHERE_API_KEY environment variable is required. "
        "Get your API key from https://dashboard.cohere.com"
    )

# Cohere Model Selection
# Options:
# - "command-r": 35B params, 128K context, $0.15/$0.60 per 1M tokens, faster, lower cost
# - "command-r-plus": 104B params, 128K context, $3.00/$15.00 per 1M tokens, higher quality
COHERE_MODEL: Literal["command-r", "command-r-plus"] = os.getenv(
    "COHERE_MODEL", "command-r"
)

# Validate model selection
if COHERE_MODEL not in ["command-r", "command-r-plus"]:
    raise ValueError(
        f"Invalid COHERE_MODEL: {COHERE_MODEL}. "
        "Must be 'command-r' or 'command-r-plus'"
    )

# Cohere API Base URL
COHERE_API_BASE_URL = "https://api.cohere.com"

# Context window limits
MAX_CONTEXT_MESSAGES = 50  # Load last 50 messages from conversation history
MAX_CONTEXT_TOKENS = 100_000  # Safety buffer for 128K token limit

# Agent behavior configuration
MAX_AGENT_TURNS = 5  # Maximum number of agent reasoning turns per request
STREAM_ENABLED = True  # Enable SSE streaming for real-time token responses

# Retry configuration for Cohere API failures
MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4]  # Exponential backoff delays in seconds

print(f"[Config] Cohere API configured with model: {COHERE_MODEL}")
print(f"[Config] Max context messages: {MAX_CONTEXT_MESSAGES}")
print(f"[Config] Streaming enabled: {STREAM_ENABLED}")
