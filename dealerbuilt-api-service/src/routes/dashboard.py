"""
Dashboard API Routes

This module provides REST API endpoints for the DealerBuilt dashboard,
serving data from the DealerBuilt SOAP API integration.
"""

from flask import Blueprint, jsonify, request
from datetime import datetime
import logging
from src.services.dealerbuilt_api import get_api_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create blueprint
dashboard_bp = Blueprint('dashboard', __name__)

# Get API service instance
api_service = get_api_service('development')

@dashboard_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'DealerBuilt Dashboard API'
    })

@dashboard_bp.route('/test-connection', methods=['GET'])
def test_connection():
    """Test DMS API connection"""
    try:
        result = api_service.test_connection()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Connection test failed: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/executive/summary', methods=['GET'])
def get_executive_summary():
    """Get executive dashboard summary data"""
    try:
        data = api_service.get_executive_summary()
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get executive summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/service/summary', methods=['GET'])
def get_service_summary():
    """Get service operations summary data"""
    try:
        data = api_service.get_service_summary()
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get service summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/sales/summary', methods=['GET'])
def get_sales_summary():
    """Get sales operations summary data"""
    try:
        data = api_service.get_sales_summary()
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get sales summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/parts/summary', methods=['GET'])
def get_parts_summary():
    """Get parts management summary data"""
    try:
        data = api_service.get_parts_summary()
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get parts summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/customers', methods=['GET'])
def get_customers():
    """Get customer list"""
    try:
        limit = request.args.get('limit', 100, type=int)
        data = api_service.get_customers(limit)
        return jsonify({
            'status': 'success',
            'data': data,
            'count': len(data),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get customers: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/inventory', methods=['GET'])
def get_inventory():
    """Get vehicle inventory"""
    try:
        data = api_service.get_inventory()
        return jsonify({
            'status': 'success',
            'data': data,
            'count': len(data),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get inventory: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """Clear API cache"""
    try:
        result = api_service.clear_cache()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Real-time data endpoints
@dashboard_bp.route('/realtime/alerts', methods=['GET'])
def get_realtime_alerts():
    """Get real-time alerts and notifications"""
    try:
        # Mock real-time alerts
        alerts = [
            {
                'id': 'alert_001',
                'type': 'warning',
                'title': 'Service Capacity Alert',
                'message': 'Service capacity at 95% for next week',
                'priority': 'high',
                'timestamp': datetime.now().isoformat(),
                'department': 'service'
            },
            {
                'id': 'alert_002',
                'type': 'success',
                'title': 'Sales Target Achieved',
                'message': 'Q1 sales target achieved - 102% of goal',
                'priority': 'medium',
                'timestamp': datetime.now().isoformat(),
                'department': 'sales'
            },
            {
                'id': 'alert_003',
                'type': 'error',
                'title': 'Low Parts Inventory',
                'message': 'Oil filters running low - 5 units remaining',
                'priority': 'high',
                'timestamp': datetime.now().isoformat(),
                'department': 'parts'
            },
            {
                'id': 'alert_004',
                'type': 'info',
                'title': 'Customer Satisfaction Update',
                'message': 'Customer satisfaction improved by 4% this month',
                'priority': 'low',
                'timestamp': datetime.now().isoformat(),
                'department': 'service'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'data': alerts,
            'count': len(alerts),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get alerts: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@dashboard_bp.route('/realtime/kpis', methods=['GET'])
def get_realtime_kpis():
    """Get real-time KPI updates"""
    try:
        department = request.args.get('department', 'all')
        
        kpis = {
            'executive': {
                'revenue': {'current': 2847500, 'change': 7.3, 'target_progress': 95},
                'units': {'current': 156, 'change': 9.9, 'target_progress': 87},
                'gross_profit': {'current': 487200, 'change': 9.3, 'target_progress': 94},
                'csi': {'current': 4.7, 'change': 4.4, 'target_progress': 98}
            },
            'service': {
                'active_ros': {'current': 47, 'change': 12.0},
                'appointments': {'current': 23, 'pending': 8},
                'cycle_time': {'current': 2.4, 'change': -6.3},
                'technicians': {'active': 12, 'total': 14}
            },
            'sales': {
                'active_deals': {'current': 23, 'change': 15.0},
                'monthly_sales': {'current': 156, 'change': 9.9},
                'conversion_rate': {'current': 0.23, 'change': 2.2},
                'pipeline_value': {'current': 2400000, 'change': 8.5}
            },
            'parts': {
                'inventory_value': {'current': 1250000, 'change': -2.1},
                'low_stock_items': {'current': 23, 'change': 15.0},
                'monthly_revenue': {'current': 312800, 'change': 5.7},
                'turnover_rate': {'current': 6.2, 'change': 3.2}
            }
        }
        
        if department != 'all' and department in kpis:
            data = {department: kpis[department]}
        else:
            data = kpis
        
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get KPIs: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Analytics endpoints
@dashboard_bp.route('/analytics/trends', methods=['GET'])
def get_analytics_trends():
    """Get analytics trend data"""
    try:
        metric = request.args.get('metric', 'revenue')
        period = request.args.get('period', '30d')
        
        # Mock trend data
        trends = {
            'revenue': {
                'daily': [85000, 92000, 88000, 95000, 91000, 87000, 93000],
                'weekly': [580000, 620000, 595000, 640000],
                'monthly': [2200000, 2350000, 2654000, 2847500]
            },
            'units': {
                'daily': [4, 5, 3, 6, 4, 3, 5],
                'weekly': [28, 32, 29, 35],
                'monthly': [120, 128, 142, 156]
            },
            'service_efficiency': {
                'daily': [88, 92, 85, 94, 89, 87, 91],
                'weekly': [89, 91, 88, 92],
                'monthly': [85, 88, 92, 89]
            }
        }
        
        data = trends.get(metric, trends['revenue'])
        
        return jsonify({
            'status': 'success',
            'data': {
                'metric': metric,
                'period': period,
                'values': data.get(period.replace('d', 'daily').replace('w', 'weekly').replace('m', 'monthly'), data['daily'])
            },
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to get trends: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# Error handlers
@dashboard_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@dashboard_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

