"""Test Gemini import"""

print("Testing Gemini import options...\n")

# Try different import methods
import_methods = [
    ("from google import genai", lambda: __import__('google.genai', fromlist=['genai'])),
    ("import google.generativeai", lambda: __import__('google.generativeai')),
    ("from google.generativeai import GenerativeModel", lambda: __import__('google.generativeai', fromlist=['GenerativeModel'])),
]

for method_name, import_func in import_methods:
    try:
        import_func()
        print(f"✓ {method_name}")
    except ImportError as e:
        print(f"✗ {method_name}")
        print(f"  Error: {e}")
    except Exception as e:
        print(f"? {method_name}")
        print(f"  Error: {e}")

print("\nInstalled Google packages:")
import subprocess
result = subprocess.run(['pip', 'list'], capture_output=True, text=True)
for line in result.stdout.split('\n'):
    if 'google' in line.lower() or 'genai' in line.lower() or 'generative' in line.lower():
        print(f"  {line}")

