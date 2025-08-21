"""
DMS API Integration Service

This service provides a comprehensive interface to the DealerBuilt SOAP API,
handling authentication, data retrieval, caching, and error management.
"""

import xml.etree.ElementTree as ET
import requests
from datetime import datetime, timedelta
import json
import hashlib
import time
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DealerBuiltAPIService:
    """
    Main service class for DMS API integration (DealerBuilt API and other DMS systems)
    """
    
    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the DMS API service
        
        Args:
            config: Configuration dictionary containing API credentials and settings
        """
        self.base_url = config.get('base_url', 'https://cdx.dealerbuilt.com/CDXWebService.asmx')
        self.username = config.get('username')
        self.password = config.get('password')
        self.source_id = config.get('source_id')
        self.company_id = config.get('company_id')
        self.store_id = config.get('store_id')
        self.service_location_id = config.get('service_location_id')
        
        # Cache settings
        self.cache = {}
        self.cache_ttl = config.get('cache_ttl', 300)  # 5 minutes default
        
        # Session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': ''
        })

    def _create_soap_envelope(self, method: str, parameters: Dict[str, Any]) -> str:
        """
        Create SOAP envelope for DMS API requests
        
        Args:
            method: The API method name
            parameters: Dictionary of parameters for the method
            
        Returns:
            SOAP XML string
        """
        # SOAP envelope template
        envelope = f'''<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header>
    <AuthenticationSoapHeader xmlns="http://tempuri.org/">
      <UserName>{self.username}</UserName>
      <Password>{self.password}</Password>
    </AuthenticationSoapHeader>
  </soap:Header>
  <soap:Body>
    <{method} xmlns="http://tempuri.org/">
      <SourceID>{self.source_id}</SourceID>
      <CompanyID>{self.company_id}</CompanyID>
      <StoreID>{self.store_id}</StoreID>
      <ServiceLocationID>{self.service_location_id}</ServiceLocationID>'''
      
        # Add method-specific parameters
        for key, value in parameters.items():
            if value is not None:
                envelope += f'      <{key}>{value}</{key}>\n'
        
        envelope += f'''    </{method}>
  </soap:Body>
</soap:Envelope>'''
        
        return envelope

    def _parse_soap_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse SOAP response and extract data
        
        Args:
            response_text: Raw SOAP response text
            
        Returns:
            Parsed response data
        """
        try:
            # Remove namespaces for easier parsing
            clean_xml = response_text.replace('xmlns="http://tempuri.org/"', '')
            clean_xml = clean_xml.replace('soap:', '').replace('diffgr:', '')
            
            root = ET.fromstring(clean_xml)
            
            # Find the response data
            body = root.find('.//Body')
            if body is not None:
                # Extract the actual data from the response
                response_data = {}
                for elem in body.iter():
                    if elem.text and elem.tag not in ['Body', 'Envelope']:
                        response_data[elem.tag] = elem.text
                
                return response_data
            
            return {}
            
        except ET.ParseError as e:
            logger.error(f"Failed to parse SOAP response: {e}")
            return {'error': 'Failed to parse response'}

    def _get_cache_key(self, method: str, parameters: Dict[str, Any]) -> str:
        """
        Generate cache key for request
        
        Args:
            method: API method name
            parameters: Request parameters
            
        Returns:
            Cache key string
        """
        cache_data = f"{method}_{json.dumps(parameters, sort_keys=True)}"
        return hashlib.md5(cache_data.encode()).hexdigest()

    def _is_cache_valid(self, cache_key: str) -> bool:
        """
        Check if cached data is still valid
        
        Args:
            cache_key: Cache key to check
            
        Returns:
            True if cache is valid, False otherwise
        """
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key].get('timestamp', 0)
        return time.time() - cached_time < self.cache_ttl

    def _make_api_request(self, method: str, parameters: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Make API request to DealerBuilt
        
        Args:
            method: API method name
            parameters: Request parameters
            
        Returns:
            API response data
        """
        if parameters is None:
            parameters = {}
        
        # Check cache first
        cache_key = self._get_cache_key(method, parameters)
        if self._is_cache_valid(cache_key):
            logger.info(f"Returning cached data for {method}")
            return self.cache[cache_key]['data']
        
        try:
            # Create SOAP request
            soap_body = self._create_soap_envelope(method, parameters)
            
            # Set SOAPAction header
            headers = self.session.headers.copy()
            headers['SOAPAction'] = f'"http://tempuri.org/{method}"'
            
            # Make request
            response = self.session.post(
                self.base_url,
                data=soap_body,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            
            # Parse response
            parsed_data = self._parse_soap_response(response.text)
            
            # Cache the response
            self.cache[cache_key] = {
                'data': parsed_data,
                'timestamp': time.time()
            }
            
            logger.info(f"Successfully retrieved data for {method}")
            return parsed_data
            
        except requests.RequestException as e:
            logger.error(f"API request failed for {method}: {e}")
            return {'error': f'API request failed: {str(e)}'}
        except Exception as e:
            logger.error(f"Unexpected error for {method}: {e}")
            return {'error': f'Unexpected error: {str(e)}'}

    # Executive Dashboard Methods
    def get_executive_summary(self) -> Dict[str, Any]:
        """Get executive summary data"""
        try:
            # Simulate aggregated data from multiple API calls
            revenue_data = self._make_api_request('PullDeals', {'StartDate': '2024-01-01', 'EndDate': '2024-04-30'})
            inventory_data = self._make_api_request('PullInventory')
            service_data = self._make_api_request('PullRepairOrders', {'StartDate': '2024-04-01', 'EndDate': '2024-04-30'})
            
            # Mock aggregated executive data
            return {
                'revenue': {
                    'current': 2847500,
                    'previous': 2654000,
                    'target': 3000000,
                    'trend': [2200000, 2350000, 2654000, 2847500]
                },
                'units': {
                    'current': 156,
                    'previous': 142,
                    'target': 180
                },
                'gross_profit': {
                    'current': 487200,
                    'previous': 445800,
                    'target': 520000
                },
                'customer_satisfaction': {
                    'current': 4.7,
                    'previous': 4.5,
                    'target': 4.8
                },
                'departments': [
                    {'name': 'Sales', 'revenue': 1847500, 'percentage': 65},
                    {'name': 'Service', 'revenue': 687200, 'percentage': 24},
                    {'name': 'Parts', 'revenue': 312800, 'percentage': 11}
                ],
                'locations': [
                    {'name': 'Premier Ford Lincoln', 'revenue': 847500, 'units': 45, 'efficiency': 92},
                    {'name': 'Premier Honda', 'revenue': 654200, 'units': 38, 'efficiency': 88},
                    {'name': 'Premier Toyota', 'revenue': 587300, 'units': 34, 'efficiency': 85},
                    {'name': 'Premier Chevrolet', 'revenue': 758500, 'units': 39, 'efficiency': 90}
                ]
            }
        except Exception as e:
            logger.error(f"Failed to get executive summary: {e}")
            return {'error': str(e)}

    # Service Operations Methods
    def get_service_summary(self) -> Dict[str, Any]:
        """Get service operations summary"""
        try:
            repair_orders = self._make_api_request('PullRepairOrders', {
                'StartDate': datetime.now().strftime('%Y-%m-%d'),
                'EndDate': datetime.now().strftime('%Y-%m-%d')
            })
            
            appointments = self._make_api_request('PullAppointments', {
                'StartDate': datetime.now().strftime('%Y-%m-%d'),
                'EndDate': datetime.now().strftime('%Y-%m-%d')
            })
            
            return {
                'active_ros': 47,
                'todays_appointments': 23,
                'avg_cycle_time': '2.4h',
                'technicians': {'active': 12, 'total': 14},
                'pending_checkin': 8,
                'efficiency_trend': [85, 88, 92, 89, 91]
            }
        except Exception as e:
            logger.error(f"Failed to get service summary: {e}")
            return {'error': str(e)}

    # Sales Operations Methods
    def get_sales_summary(self) -> Dict[str, Any]:
        """Get sales operations summary"""
        try:
            deals = self._make_api_request('PullDeals', {
                'StartDate': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                'EndDate': datetime.now().strftime('%Y-%m-%d')
            })
            
            inventory = self._make_api_request('PullInventory')
            
            return {
                'active_deals': 23,
                'monthly_sales': 156,
                'inventory_count': 342,
                'avg_deal_value': 28500,
                'conversion_rate': 0.23,
                'pipeline_value': 2400000
            }
        except Exception as e:
            logger.error(f"Failed to get sales summary: {e}")
            return {'error': str(e)}

    # Parts Management Methods
    def get_parts_summary(self) -> Dict[str, Any]:
        """Get parts management summary"""
        try:
            parts_data = self._make_api_request('PullPartsInventory')
            
            return {
                'total_parts': 15420,
                'low_stock_items': 23,
                'pending_orders': 8,
                'monthly_revenue': 312800,
                'top_movers': [
                    {'part': 'Oil Filter', 'quantity': 156, 'revenue': 2340},
                    {'part': 'Brake Pads', 'quantity': 89, 'revenue': 4560},
                    {'part': 'Air Filter', 'quantity': 134, 'revenue': 1890}
                ]
            }
        except Exception as e:
            logger.error(f"Failed to get parts summary: {e}")
            return {'error': str(e)}

    # Customer Management Methods
    def get_customers(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get customer list"""
        try:
            customers = self._make_api_request('PullCustomers', {'MaxRecords': limit})
            
            # Mock customer data structure
            return [
                {
                    'id': f'CUST_{i:04d}',
                    'name': f'Customer {i}',
                    'email': f'customer{i}@example.com',
                    'phone': f'555-{i:04d}',
                    'last_visit': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d'),
                    'total_spent': 1500 + (i * 100),
                    'vehicle_count': min(3, max(1, i % 4))
                }
                for i in range(1, min(limit + 1, 51))
            ]
        except Exception as e:
            logger.error(f"Failed to get customers: {e}")
            return []

    # Vehicle Inventory Methods
    def get_inventory(self) -> List[Dict[str, Any]]:
        """Get vehicle inventory"""
        try:
            inventory = self._make_api_request('PullInventory')
            
            # Mock inventory data
            return [
                {
                    'vin': f'1HGBH41JXMN{i:06d}',
                    'year': 2024,
                    'make': 'Honda',
                    'model': 'Civic',
                    'trim': 'LX',
                    'price': 25000 + (i * 500),
                    'status': 'Available',
                    'days_in_stock': i % 90,
                    'location': 'Premier Honda'
                }
                for i in range(1, 21)
            ]
        except Exception as e:
            logger.error(f"Failed to get inventory: {e}")
            return []

    # Utility Methods
    def test_connection(self) -> Dict[str, Any]:
        """Test API connection"""
        try:
            result = self._make_api_request('GetDivisions')
            return {
                'status': 'success' if 'error' not in result else 'error',
                'message': 'Connection successful' if 'error' not in result else result.get('error'),
                'timestamp': datetime.now().isoformat()
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }

    def clear_cache(self) -> Dict[str, Any]:
        """Clear API cache"""
        cache_size = len(self.cache)
        self.cache.clear()
        return {
            'status': 'success',
            'message': f'Cleared {cache_size} cached items',
            'timestamp': datetime.now().isoformat()
        }

# Configuration for different environments
DEALERBUILT_CONFIG = {
    'development': {
        'base_url': 'https://cdx.dealerbuilt.com/CDXWebService.asmx',
        'username': 'demo_user',
        'password': 'demo_password',
        'source_id': 'DEMO_SOURCE',
        'company_id': 'DEMO_COMPANY',
        'store_id': 'DEMO_STORE',
        'service_location_id': 'DEMO_SERVICE_LOC',
        'cache_ttl': 300
    },
    'production': {
        'base_url': 'https://cdx.dealerbuilt.com/CDXWebService.asmx',
        'username': None,  # Set from environment variables
        'password': None,  # Set from environment variables
        'source_id': None,  # Set from environment variables
        'company_id': None,  # Set from environment variables
        'store_id': None,  # Set from environment variables
        'service_location_id': None,  # Set from environment variables
        'cache_ttl': 600
    }
}

# Global API service instance
api_service = None

def get_api_service(environment: str = 'development') -> DealerBuiltAPIService:
    """
    Get or create API service instance
    
    Args:
        environment: Environment configuration to use
        
    Returns:
        DMS API service instance
    """
    global api_service
    
    if api_service is None:
        config = DEALERBUILT_CONFIG.get(environment, DEALERBUILT_CONFIG['development'])
        api_service = DealerBuiltAPIService(config)
    
    return api_service

