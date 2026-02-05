#!/bin/bash
set -e

MODEL_DIR="/app/ComfyUI/models/checkpoints"
LORA_DIR="/app/ComfyUI/models/loras"

# Create directories
mkdir -p "$MODEL_DIR"
mkdir -p "$LORA_DIR"

# Check FreedomRedmond checkpoint (SD 2.1 fine-tune, must be pre-downloaded)
CHECKPOINT_FILE="$MODEL_DIR/freedomRedmond_v1.safetensors"
if [ ! -f "$CHECKPOINT_FILE" ]; then
    echo "=========================================="
    echo "WARNING: FreedomRedmond checkpoint not found!"
    echo ""
    echo "Please download manually and place at:"
    echo "  comfyui/models/checkpoints/freedomRedmond_v1.safetensors"
    echo "=========================================="
fi

# Note: 3DRedmond LoRA must be downloaded manually from CivitAI
# Place it at: models/loras/3DRedmond21V-3DRenderStyle-3DRenderAF.safetensors
# Download from: https://civitai.com/models/210387
LORA_FILE="$LORA_DIR/3DRedmond21V-3DRenderStyle-3DRenderAF.safetensors"
if [ ! -f "$LORA_FILE" ]; then
    echo "=========================================="
    echo "WARNING: 3DRedmond LoRA not found!"
    echo "Please download it manually from:"
    echo "  https://civitai.com/models/210387"
    echo "And place it at:"
    echo "  $LORA_FILE"
    echo "=========================================="
fi

echo "Starting ComfyUI..."
python3 main.py $CLI_ARGS
