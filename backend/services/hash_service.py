from PIL import Image
import imagehash

def generate_phash(image_path: str) -> str:
    """
    Generates a perceptual hash (pHash) for an image.
    """
    try:
        img = Image.open(image_path)
        hash_val = imagehash.phash(img)
        return str(hash_val)
    except Exception as e:
        raise ValueError(f"Could not generate hash: {e}")
