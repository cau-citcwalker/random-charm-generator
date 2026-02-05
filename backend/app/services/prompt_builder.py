import json
import random
import copy
import logging
from pathlib import Path
from app.models.schemas import GenerateRequest

logger = logging.getLogger(__name__)

BASE_ELEMENTS = {
    "crystal": "crystalline translucent keyring charm, gemstone, faceted, refractive light",
    "wood": "wooden carved keyring charm, natural grain texture, rustic handcrafted",
    "metal": "polished metal keyring charm, chrome finish, reflective surface",
    "plush": "soft plush keyring charm, fabric texture, cute stuffed toy style",
    "glass": "blown glass keyring charm, delicate, iridescent, lampwork bead style",
    "clay": "polymer clay keyring charm, handmade, smooth matte finish",
    "resin": "epoxy resin keyring charm, clear with embedded elements, glossy dome",
    "enchanted": "magical glowing keyring charm, ethereal, floating particles, fantasy artifact",
}

POTIONS = {
    "potion_a": "sparkling, starry, cosmic dust",
    "potion_b": "dark elegant, noir, mysterious shadows",
    "potion_c": "natural, botanical, leaf and vine motifs",
    "potion_d": "aquatic, water droplets, sea glass",
    "potion_e": "fiery, warm gradient, ember glow",
    "potion_f": "icy, snowflake patterns, frozen, winter",
    "potion_g": "golden warm, amber, honeycomb texture",
    "potion_h": "pastel, dreamy, soft focus, cotton candy",
}

SHAPES = {
    "circle": "circular round shape",
    "star": "five-pointed star shape",
    "heart": "heart shape",
    "hexagon": "hexagonal geometric shape",
    "cloud": "soft cloud shape, puffy edges",
    "diamond": "diamond rhombus shape, angular",
}

PATTERNS = {
    "swirl": "swirling spiral pattern",
    "dots": "polka dot pattern, scattered circles",
    "stripes": "striped pattern, parallel lines",
    "floral": "floral pattern, small flowers and petals",
    "geometric": "geometric pattern, triangles and squares",
    "plain": "smooth solid surface, no pattern",
}

COLORS = {
    "ocean_blue": "ocean blue colored",
    "sunset_pink": "sunset pink and coral colored",
    "forest_green": "deep forest green colored",
    "royal_purple": "rich royal purple colored",
    "golden": "golden yellow colored",
    "midnight": "dark midnight blue and black colored",
    "rose": "soft rose pink colored",
    "mint": "fresh mint green colored",
}

WORKFLOW_PATH = Path(__file__).parent.parent / "workflows" / "keyring_base.json"


def build_prompt(choices: GenerateRequest) -> tuple[str, str]:
    base = BASE_ELEMENTS.get(choices.base_element, "keyring charm")
    potion_effects = ", ".join(
        POTIONS[p] for p in choices.potions if p in POTIONS
    )
    shape = SHAPES.get(choices.shape, "round shape")
    pattern = PATTERNS.get(choices.pattern, "smooth surface")
    color = COLORS.get(choices.color, "colorful")

    parts = [
        "3D Render Style, 3DRenderAF",
        "3d rendered keyring product with metal ring and clasp",
        f"{color} {shape} charm", base, pattern,
    ]
    if potion_effects:
        parts.append(potion_effects)
    parts.append(
        "high quality, detailed, studio lighting, white background, "
        "professional product photography, centered composition, single keyring object"
    )
    positive = ", ".join(parts)

    negative = (
        "blurry, low quality, deformed, ugly, text, watermark, "
        "multiple objects, human, hands, fingers, noisy, "
        "oversaturated, underexposed, 2d, flat, drawing"
    )

    return positive, negative


def build_workflow(choices: GenerateRequest) -> dict:
    positive, negative = build_prompt(choices)

    workflow_loaded = False
    if WORKFLOW_PATH.exists():
        with open(WORKFLOW_PATH) as f:
            workflow = json.load(f)
        if workflow:  # guard against empty {}
            workflow = copy.deepcopy(workflow)
            # Inject prompts into workflow nodes
            for node_id, node in workflow.items():
                if node.get("class_type") == "CLIPTextEncode":
                    title = node.get("_meta", {}).get("title", "").lower()
                    if "positive" in title:
                        node["inputs"]["text"] = positive
                    elif "negative" in title:
                        node["inputs"]["text"] = negative
            # Set random seed
            for node_id, node in workflow.items():
                if node.get("class_type") == "KSampler":
                    node["inputs"]["seed"] = random.randint(0, 2**32 - 1)
            workflow_loaded = True
            logger.info("Workflow loaded from %s", WORKFLOW_PATH)

    if not workflow_loaded:
        # Fallback: create a basic workflow programmatically
        seed = random.randint(0, 2**32 - 1)
        workflow = {
            "4": {
                "class_type": "CheckpointLoaderSimple",
                "inputs": {
                    "ckpt_name": "freedomRedmond_v1.safetensors"
                },
            },
            "10": {
                "class_type": "LoraLoader",
                "inputs": {
                    "lora_name": "3DRedmond21V-3DRenderStyle-3DRenderAF.safetensors",
                    "strength_model": 0.8,
                    "strength_clip": 0.8,
                    "model": ["4", 0],
                    "clip": ["4", 1],
                },
            },
            "6": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": positive,
                    "clip": ["10", 1],
                },
                "_meta": {"title": "CLIP Text Encode (Positive)"},
            },
            "7": {
                "class_type": "CLIPTextEncode",
                "inputs": {
                    "text": negative,
                    "clip": ["10", 1],
                },
                "_meta": {"title": "CLIP Text Encode (Negative)"},
            },
            "5": {
                "class_type": "EmptyLatentImage",
                "inputs": {
                    "width": 768,
                    "height": 768,
                    "batch_size": 1,
                },
            },
            "3": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": seed,
                    "steps": 25,
                    "cfg": 7.0,
                    "sampler_name": "euler_ancestral",
                    "scheduler": "normal",
                    "denoise": 1.0,
                    "model": ["10", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0],
                },
            },
            "8": {
                "class_type": "VAEDecode",
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2],
                },
            },
            "9": {
                "class_type": "SaveImage",
                "inputs": {
                    "filename_prefix": "keyring",
                    "images": ["8", 0],
                },
            },
        }

    return workflow
