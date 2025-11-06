# Quantum-Resistant Key Generation
# Uses CRYSTALS-Dilithium (NIST PQC standard)

from pqcrypto.sign.dilithium5 import generate_keypair, sign, verify
import json

def generate_quantum_keypair():
    """Generate CRYSTALS-Dilithium5 keypair"""
    public_key, secret_key = generate_keypair()
    
    return {
        'public_key': public_key.hex(),
        'secret_key': secret_key.hex()
    }

def sign_message(message, secret_key_hex):
    """Sign message with quantum-resistant signature"""
    secret_key = bytes.fromhex(secret_key_hex)
    signature = sign(secret_key, message.encode())
    return signature.hex()

def verify_signature(message, signature_hex, public_key_hex):
    """Verify quantum-resistant signature"""
    signature = bytes.fromhex(signature_hex)
    public_key = bytes.fromhex(public_key_hex)
    
    try:
        original = verify(public_key, signature)
        return original.decode() == message
    except:
        return False

# Generate keys for Faith Chain
if __name__ == "__main__":
    print("Generating quantum-resistant keypair...")
    keys = generate_quantum_keypair()
    
    with open('quantum_keys.json', 'w') as f:
        json.dump(keys, f, indent=2)
    
    print("✓ Quantum keys generated: quantum_keys.json")
    print(f"✓ Public key length: {len(keys['public_key'])} chars")
    print(f"✓ Algorithm: CRYSTALS-Dilithium5 (NIST PQC)")
