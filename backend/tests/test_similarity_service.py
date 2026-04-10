import pytest
from backend.services.similarity_service import calculate_similarity_score
import imagehash

def test_calculate_similarity_identical():
    """Test identical hashes yield a 1.0 (100%) float score."""
    # Example arbitrary 16-char hex phash
    h1 = "e305e22ecf6b0f0f"
    score = calculate_similarity_score(h1, h1)
    assert score == 1.0

def test_calculate_similarity_minor_difference():
    """Test a small Hamming distance correctly reduces the score according to 100 - (diff * 5)."""
    # e305e22ecf6b0f0f
    # e305e22ecf6b0f0a -> last hex digit f (1111) vs a (1010) = distance 2
    # Logic: 100 - (2 * 5) = 90 -> 0.9
    h1 = "e305e22ecf6b0f0f"
    h2 = "e305e22ecf6b0f0a"
    score = calculate_similarity_score(h1, h2)
    assert score == 0.9

def test_calculate_similarity_major_difference():
    """Test a large Hamming distance hits the floor bound of 0.0."""
    # Two completely inverted hashes will have a distance of 64
    h1 = "0000000000000000"
    h2 = "ffffffffffffffff"
    score = calculate_similarity_score(h1, h2)
    assert score == 0.0

def test_calculate_similarity_invalid_hash():
    """Test malformed hashes return 0.0 instead of crashing."""
    score = calculate_similarity_score("not_a_hash", "still_not_a_hash")
    assert score == 0.0
