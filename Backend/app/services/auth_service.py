import hashlib
import secrets
import hmac

ROUNDS = 200_000

def hash_secret(secret: str) -> str:
    """
    Cryptographically hashes a password or answer using PBKDF2-HMAC-SHA256 with 200,000 rounds.
    Generates a unique 16-byte random salt per item.
    Result format: pbkdf2_sha256$<rounds>$<salt_hex>$<hash_hex>
    """
    if not secret:
        raise ValueError("Secret cannot be empty")
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        secret.encode('utf-8'),
        salt.encode('utf-8'),
        ROUNDS
    )
    return f"pbkdf2_sha256${ROUNDS}${salt}${key.hex()}"

def verify_secret(secret: str, stored_hash: str) -> bool:
    """
    Verifies a plaintext secret against a stored PBKDF2-HMAC-SHA256 hash
    using constant-time comparison to prevent timing attacks.
    """
    if not secret or not stored_hash:
        return False
    try:
        parts = stored_hash.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            return False
        rounds = int(parts[1])
        salt = parts[2]
        expected_key = parts[3]

        computed = hashlib.pbkdf2_hmac(
            'sha256',
            secret.encode('utf-8'),
            salt.encode('utf-8'),
            rounds
        )
        return hmac.compare_digest(computed.hex(), expected_key)
    except Exception:
        return False

def normalize_security_answer(answer: str) -> str:
    """
    Normalizes security answer by trimming leading and trailing whitespace.
    Strictly preserves case-sensitivity (e.g. 'Batman' != 'batman').
    """
    return answer.strip()

