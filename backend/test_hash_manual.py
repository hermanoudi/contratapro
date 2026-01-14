from app.auth_utils import get_password_hash
import sys

try:
    # Test short password
    pwd = "securepassword123"
    print(f"Testing short password: {pwd}")
    hash1 = get_password_hash(pwd)
    print(f"Short password hash: {hash1}")

    # Test long password (truncated logic simulation)
    long_pwd = "a" * 100
    print(f"Testing long password raw: {long_pwd}")
    truncated = long_pwd.encode('utf-8')[:72].decode('utf-8', 'ignore')
    print(f"Truncated: {truncated}")
    hash2 = get_password_hash(truncated)
    print(f"Long password hash: {hash2}")

    print("SUCCESS")
except Exception as e:
    print(f"FAILURE: {e}")
    sys.exit(1)
