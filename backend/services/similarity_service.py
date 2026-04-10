import imagehash

def calculate_similarity_score(hash1_str: str, hash2_str: str) -> float:
    """
    Calculates similarity between two image hashes.
    Similarity logic: 100 - (hash_diff * 5)
    Returns value between 0.0 and 1.0
    """
    try:
        h1 = imagehash.hex_to_hash(hash1_str)
        h2 = imagehash.hex_to_hash(hash2_str)
        diff = h1 - h2
        # Max difference for a 64-bit hash (like phash creates by default) is 64
        # 100 - (diff * 5) logic from user
        similarity = 100.0 - (diff * 5.0)
        similarity = max(0.0, similarity)
        return similarity / 100.0
    except Exception as e:
        return 0.0
