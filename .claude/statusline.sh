#!/bin/bash
# Agentic Flow Intelligence Status Line
# Shows real-time learning metrics from SONA + HNSW + ReasoningBank

INTEL_FILE=".agentic-flow/intelligence.json"
INTEL_DB=".agentic-flow/intelligence.db"

# Default values
PATTERNS=0
ROUTES=0
SUCCESS_RATE=0
TRAJECTORIES=0
MEMORIES=0
MODE="off"

# Get current git branch
GIT_BRANCH=""
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
fi

# Check environment
if [ "$AGENTIC_FLOW_INTELLIGENCE" = "true" ]; then
  MODE="on"
fi

if [ -f "$INTEL_FILE" ]; then
  # Pattern count
  PATTERNS=$(jq -r '.patterns | length // 0' "$INTEL_FILE" 2>/dev/null || echo "0")

  # Routing metrics
  ROUTES=$(jq -r '.metrics.totalRoutes // 0' "$INTEL_FILE" 2>/dev/null || echo "0")
  SUCCESSFUL=$(jq -r '.metrics.successfulRoutes // 0' "$INTEL_FILE" 2>/dev/null || echo "0")

  # Calculate success rate (bash arithmetic)
  if [ "$ROUTES" -gt 0 ] 2>/dev/null; then
    SUCCESS_RATE=$(( (SUCCESSFUL * 100) / ROUTES ))
  fi

  # Active trajectories (RL learning)
  TRAJECTORIES=$(jq -r '[.trajectories // {} | to_entries[] | select(.value.status == "active")] | length' "$INTEL_FILE" 2>/dev/null || echo "0")

  # Memory count
  MEMORIES=$(jq -r '.memories | length // 0' "$INTEL_FILE" 2>/dev/null || echo "0")
fi

# Check for SQLite backend (HNSW-indexed)
DB_STATUS=""
if [ -f "$INTEL_DB" ]; then
  DB_SIZE=$(du -h "$INTEL_DB" 2>/dev/null | cut -f1 || echo "0")
  DB_STATUS=" | 🗄️ $DB_SIZE"
fi

# Build branch display
BRANCH_DISPLAY=""
if [ -n "$GIT_BRANCH" ]; then
  BRANCH_DISPLAY=" ⎇ ${GIT_BRANCH}"
fi

# Get learning rate from environment
LEARNING_RATE="${AGENTIC_FLOW_LEARNING_RATE:-0.1}"
MEMORY_BACKEND="${AGENTIC_FLOW_MEMORY_BACKEND:-agentdb}"

# Get total trajectories count
TOTAL_TRAJECTORIES=0
if [ -f "$INTEL_FILE" ]; then
  TOTAL_TRAJECTORIES=$(jq -r '.trajectories | length // 0' "$INTEL_FILE" 2>/dev/null || echo "0")
fi

# Build multi-line status
OUTPUT=""

# Line 1: Model + RuVector + Branch
OUTPUT="Opus 4.5 in RuVector"
if [ -n "$GIT_BRANCH" ]; then
  OUTPUT="${OUTPUT} ⎇ ${GIT_BRANCH}"
fi

# Line 2: Intelligence metrics
if [ "$MODE" = "on" ]; then
  if [ "$ROUTES" -gt 0 ]; then
    OUTPUT="${OUTPUT}\n⚡ SONA ${SUCCESS_RATE}% ~0.05ms | 🎯 ${ROUTES} routes | 🧠 ${PATTERNS} patterns"
  else
    OUTPUT="${OUTPUT}\n⚡ SONA ready ~0.05ms | 🧠 ${PATTERNS} patterns | 💾 ${MEMORIES} memories"
  fi

  # Line 3: Architecture info
  OUTPUT="${OUTPUT}\n🔀 MoE 4 experts | 🔍 HNSW 150x | 📈 LR ${LEARNING_RATE}"

  # Line 4: Backend & trajectories
  BACKEND_LINE=""
  if [ -f "$INTEL_DB" ]; then
    DB_SIZE=$(du -h "$INTEL_DB" 2>/dev/null | cut -f1 || echo "0")
    BACKEND_LINE="🗄️ ${MEMORY_BACKEND} ${DB_SIZE}"
  else
    BACKEND_LINE="🗄️ ${MEMORY_BACKEND}"
  fi
  if [ "$TOTAL_TRAJECTORIES" -gt 0 ]; then
    BACKEND_LINE="${BACKEND_LINE} | 🔄 ${TOTAL_TRAJECTORIES} trajectories"
    if [ "$TRAJECTORIES" -gt 0 ]; then
      BACKEND_LINE="${BACKEND_LINE} (${TRAJECTORIES} active)"
    fi
  fi
  OUTPUT="${OUTPUT}\n${BACKEND_LINE}"
else
  OUTPUT="${OUTPUT}\n🧠 Intelligence (inactive)"
fi

# Print with newlines interpreted
printf "%b\n" "$OUTPUT"
