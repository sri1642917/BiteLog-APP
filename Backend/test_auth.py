import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.models.user import User

client = TestClient(app)

def test_auth_workflow():
    print("Testing 100% Offline Encrypted Authentication & Password Recovery...")

    # Clean existing test user if present
    db = SessionLocal()
    db.query(User).filter(User.username == "test_harsha").delete()
    db.commit()
    db.close()

    # 1. Register User
    reg_payload = {
        "full_name": "Sri Harsha",
        "username": "test_harsha",
        "password": "SecretPassword123!",
        "security_question": "What is your favorite hero?",
        "security_answer": "Batman"
    }
    res = client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201, f"Register failed: {res.text}"
    reg_data = res.json()
    assert reg_data["user"]["full_name"] == "Sri Harsha"
    assert reg_data["user"]["username"] == "test_harsha"
    print("✓ Registration successful!")

    # 2. Database Cryptographic Encryption Verification
    db = SessionLocal()
    user = db.query(User).filter(User.username == "test_harsha").first()
    assert user is not None
    print(f"  DB Stored Password Hash: {user.password_hash[:30]}...")
    print(f"  DB Stored Security Answer Hash: {user.security_answer_hash[:30]}...")

    # Strict check: Plaintext MUST NOT appear anywhere in the database record!
    assert "SecretPassword123!" not in user.password_hash
    assert "Batman" not in user.security_answer_hash
    assert "batman" not in user.security_answer_hash
    assert user.password_hash.startswith("pbkdf2_sha256$200000$")
    assert user.security_answer_hash.startswith("pbkdf2_sha256$200000$")
    db.close()
    print("✓ Cryptographic check passed: Passwords & security answers are fully encrypted (PBKDF2-HMAC-SHA256) in DB!")

    # 3. Duplicate Registration Prevention
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    print("✓ Duplicate username prevention verified!")

    # 4. Sign In Verification
    # Bad password
    bad_login = client.post("/api/auth/login", json={"username": "test_harsha", "password": "WrongPassword"})
    assert bad_login.status_code == 401
    print("✓ Bad password correctly rejected!")

    # Correct password
    good_login = client.post("/api/auth/login", json={"username": "test_harsha", "password": "SecretPassword123!"})
    assert good_login.status_code == 200
    login_data = good_login.json()
    assert login_data["user"]["username"] == "test_harsha"
    assert "token" in login_data
    print("✓ Sign in with correct password successful!")

    # 5. Security Question Retrieval
    sq_res = client.post("/api/auth/security-question", json={"username": "test_harsha"})
    assert sq_res.status_code == 200
    assert sq_res.json()["security_question"] == "What is your favorite hero?"
    print("✓ Security question retrieval verified!")

    # 6. Password Reset with Security Answer
    # Wrong answer
    wrong_reset = client.post("/api/auth/reset-password", json={
        "username": "test_harsha",
        "security_answer": "Superman",
        "new_password": "NewSecretPassword456!"
    })
    assert wrong_reset.status_code == 400
    print("✓ Incorrect security answer correctly rejected!")

    # Correct answer (case-insensitive tolerance: 'batman')
    good_reset = client.post("/api/auth/reset-password", json={
        "username": "test_harsha",
        "security_answer": "batman",
        "new_password": "NewSecretPassword456!"
    })
    assert good_reset.status_code == 200
    print("✓ Password reset with valid security answer successful!")

    # 7. Sign in with Old Password (Must Fail)
    old_login = client.post("/api/auth/login", json={"username": "test_harsha", "password": "SecretPassword123!"})
    assert old_login.status_code == 401
    print("✓ Old password successfully invalidated!")

    # 8. Sign in with New Password (Must Succeed)
    new_login = client.post("/api/auth/login", json={"username": "test_harsha", "password": "NewSecretPassword456!"})
    assert new_login.status_code == 200
    print("✓ Sign in with new reset password successful!")

    # Cleanup test user
    db = SessionLocal()
    db.query(User).filter(User.username == "test_harsha").delete()
    db.commit()
    db.close()
    print("\nALL AUTHENTICATION & ENCRYPTION TESTS PASSED 100%!")

if __name__ == "__main__":
    test_auth_workflow()

