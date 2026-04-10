import os
import pytest
from PIL import Image
from backend.services.hash_service import generate_phash

def test_generate_phash_success(tmp_path):
    """Test generating a phash from a valid image."""
    # Create a dummy image
    image_file = tmp_path / "test_image.jpg"
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save(str(image_file))
    
    # Generate phash
    hash_str = generate_phash(str(image_file))
    
    # A phash for a solid color block will be deterministic
    assert hash_str is not None
    assert isinstance(hash_str, str)
    assert len(hash_str) == 16 # phash is typically a 64-bit hash -> 16 hex chars

def test_generate_phash_invalid_path():
    """Test generating an error when image does not exist."""
    with pytest.raises(ValueError, match="Could not generate hash"):
        generate_phash("non_existent_image_xyz123.jpg")

def test_generate_phash_invalid_file(tmp_path):
    """Test generating an error when file is not an image."""
    text_file = tmp_path / "test.txt"
    text_file.write_text("This is not an image")
    
    with pytest.raises(ValueError, match="Could not generate hash"):
        generate_phash(str(text_file))
