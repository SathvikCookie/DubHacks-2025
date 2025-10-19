from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

lights_bp = Blueprint('lights', __name__)

GOVEE_API_URL = 'https://openapi.api.govee.com/router/api/v1/device/control'
GOVEE_API_KEY = os.getenv('VITE_GOVEE_API_KEY', '')
GOVEE_DEVICE_ID = os.getenv('VITE_GOVEE_DEVICE_ID', '')
GOVEE_DEVICE_SKU = os.getenv('VITE_GOVEE_DEVICE_SKU', '')

@lights_bp.route('/set-color', methods=['POST'])
def set_color():
    """
    Proxy endpoint for Govee light control
    Avoids CORS issues by making request from backend
    """
    if not all([GOVEE_API_KEY, GOVEE_DEVICE_ID, GOVEE_DEVICE_SKU]):
        return jsonify({
            'error': 'Govee not configured',
            'message': 'Set GOVEE_API_KEY, GOVEE_DEVICE_ID, and GOVEE_DEVICE_SKU in backend/.env'
        }), 503
    
    try:
        data = request.json
        emotion = data.get('emotion', 'neutral')
        color_value = data.get('colorValue')
        request_id = data.get('requestId', f'story-{emotion}')
        
        print(f"💡 Light API: Setting color for emotion '{emotion}' (value: {color_value})")
        
        # Set color
        color_response = requests.post(
            GOVEE_API_URL,
            headers={
                'Govee-API-Key': GOVEE_API_KEY,
                'Content-Type': 'application/json'
            },
            json={
                'requestId': request_id,
                'payload': {
                    'sku': GOVEE_DEVICE_SKU,
                    'device': GOVEE_DEVICE_ID,
                    'capability': {
                        'type': 'devices.capabilities.color_setting',
                        'instance': 'colorRgb',
                        'value': color_value
                    }
                }
            },
            timeout=5
        )
        
        color_result = color_response.json()
        print(f"   ✓ Color set: {color_result}")
        
        # Set brightness
        brightness_response = requests.post(
            GOVEE_API_URL,
            headers={
                'Govee-API-Key': GOVEE_API_KEY,
                'Content-Type': 'application/json'
            },
            json={
                'requestId': f'{request_id}-brightness',
                'payload': {
                    'sku': GOVEE_DEVICE_SKU,
                    'device': GOVEE_DEVICE_ID,
                    'capability': {
                        'type': 'devices.capabilities.range',
                        'instance': 'brightness',
                        'value': 100
                    }
                }
            },
            timeout=5
        )
        
        brightness_result = brightness_response.json()
        print(f"   ✓ Brightness set: {brightness_result}")
        
        return jsonify({
            'success': True,
            'color': color_result,
            'brightness': brightness_result
        })
        
    except requests.exceptions.RequestException as e:
        print(f"   ✗ Govee API error: {e}")
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return jsonify({'error': str(e)}), 500

@lights_bp.route('/health', methods=['GET'])
def health():
    """Check if Govee lights are configured"""
    configured = all([GOVEE_API_KEY, GOVEE_DEVICE_ID, GOVEE_DEVICE_SKU])
    return jsonify({
        'configured': configured,
        'apiKey': 'Set' if GOVEE_API_KEY else 'Missing',
        'deviceId': 'Set' if GOVEE_DEVICE_ID else 'Missing',
        'deviceSku': 'Set' if GOVEE_DEVICE_SKU else 'Missing'
    })

