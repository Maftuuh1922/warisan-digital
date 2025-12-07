"""
Simple test client for Batik Classifier API
"""

import requests
import sys

# API URL
API_URL = "http://localhost:5000"

def test_predict(image_path):
    """Test prediction endpoint"""
    print(f"\n🔍 Testing prediction for: {image_path}")
    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(f"{API_URL}/predict", files=files)
    
    if response.status_code == 200:
        result = response.json()
        if result['success']:
            print(f"✅ Prediction: {result['prediction']}")
            print(f"✅ Confidence: {result['percentage']}")
            print("\n📊 Top 5 Predictions:")
            for i, pred in enumerate(result['top_5_predictions'], 1):
                print(f"   {i}. {pred['class']}: {pred['percentage']}")
        else:
            print(f"❌ Error: {result.get('error')}")
    else:
        print(f"❌ Request failed: {response.status_code}")

def test_info():
    """Test info endpoint"""
    print("\n📊 Getting model info...")
    response = requests.get(f"{API_URL}/info")
    
    if response.status_code == 200:
        result = response.json()
        info = result['model_info']
        print(f"✅ Model Type: {info['model_type']}")
        print(f"✅ Accuracy: {info['accuracy']}")
        print(f"✅ Classes: {info['n_classes']}")
        print(f"✅ Training Data: {info['total_training_data']}")
        print(f"✅ Trained Date: {info['trained_date']}")
    else:
        print(f"❌ Request failed: {response.status_code}")

def test_classes():
    """Test classes endpoint"""
    print("\n📋 Getting all classes...")
    response = requests.get(f"{API_URL}/classes")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Total Classes: {result['total']}")
        print(f"✅ Classes: {', '.join(result['classes'][:5])}... (showing first 5)")
    else:
        print(f"❌ Request failed: {response.status_code}")

if __name__ == "__main__":
    print("="*70)
    print("🧪 BATIK CLASSIFIER API TEST")
    print("="*70)
    
    # Test health
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            print("✅ API is running!")
        else:
            print("❌ API is not responding")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        print("💡 Make sure the API server is running (python app.py)")
        sys.exit(1)
    
    # Test endpoints
    test_info()
    test_classes()
    
    # Test prediction (provide image path as argument)
    if len(sys.argv) > 1:
        test_predict(sys.argv[1])
    else:
        print("\n💡 To test prediction, run:")
        print("   python test_api.py path/to/batik/image.jpg")
    
    print("\n" + "="*70)
    print("✅ Testing complete!")
    print("="*70)
