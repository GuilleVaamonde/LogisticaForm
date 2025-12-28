import requests
import sys
import json
from datetime import datetime

class EnviosAPITester:
    def __init__(self, base_url="https://cliente-form.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.token = None
        self.current_user = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, check_response=None, auth_required=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Add authorization header if token is available and auth is required
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and check_response:
                try:
                    response_data = response.json()
                    check_result = check_response(response_data)
                    if not check_result:
                        success = False
                        details += " - Response validation failed"
                except Exception as e:
                    success = False
                    details += f" - Response check error: {str(e)}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f" - Error: {error_data}"
                except:
                    details += f" - Response: {response.text[:200]}"

            self.log_test(name, success, details)
            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200,
            check_response=lambda r: "message" in r,
            auth_required=False
        )

    def test_departamentos(self):
        """Test departamentos endpoint"""
        def check_departamentos(response):
            if "departamentos" not in response:
                return False
            deps = response["departamentos"]
            # Should have 19 Uruguay departments
            expected_deps = [
                "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno",
                "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo",
                "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto",
                "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
            ]
            return len(deps) == 19 and all(dep in deps for dep in expected_deps)
        
        return self.run_test(
            "Get Departamentos (19 Uruguay departments)",
            "GET",
            "departamentos",
            200,
            check_response=check_departamentos,
            auth_required=False
        )

    def test_motivos(self):
        """Test motivos endpoint"""
        def check_motivos(response):
            if "motivos" not in response:
                return False
            motivos = response["motivos"]
            expected_motivos = ["Entrega", "Retiro y Entrega", "Retiro"]
            return len(motivos) == 3 and all(motivo in motivos for motivo in expected_motivos)
        
        return self.run_test(
            "Get Motivos (3 shipping options)",
            "GET",
            "motivos",
            200,
            check_response=check_motivos,
            auth_required=False
        )

    def test_login(self, username="admin", password="admin123"):
        """Test login with admin credentials"""
        login_data = {
            "username": username,
            "password": password
        }
        
        def check_login_response(response):
            if "access_token" not in response or "user" not in response:
                return False
            self.token = response["access_token"]
            self.current_user = response["user"]
            return True
        
        success, response = self.run_test(
            f"Login with {username}/{password}",
            "POST",
            "auth/login",
            200,
            data=login_data,
            check_response=check_login_response,
            auth_required=False
        )
        
        return success, response

    def test_get_me(self):
        """Test getting current user info"""
        def check_me_response(response):
            print(f"Current user: {response}")  # Debug info
            return "username" in response and "rol" in response
        
        return self.run_test(
            "Get Current User Info",
            "GET",
            "auth/me",
            200,
            check_response=check_me_response
        )

    def test_create_user(self):
        """Test creating a new user (admin only)"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "username": f"test_user_{timestamp}",
            "password": "test123",
            "nombre": f"Test User {timestamp}",
            "rol": "repartidor"
        }
        
        def check_user_response(response):
            required_fields = ["id", "username", "nombre", "rol", "activo", "created_at"]
            return all(field in response for field in required_fields)
        
        success, response = self.run_test(
            "Create New User (repartidor)",
            "POST",
            "users",
            200,
            data=user_data,
            check_response=check_user_response
        )
        
        if success:
            self.test_user_id = response.get("id")
            return True, response
        return False, {}

    def test_get_users(self):
        """Test getting users list (admin only)"""
        def check_users_list(response):
            return isinstance(response, list) and len(response) > 0
        
        return self.run_test(
            "Get Users List",
            "GET",
            "users",
            200,
            check_response=check_users_list
        )

    def test_create_envio(self):
        """Test creating a new envio"""
        test_data = {
            "ticket": f"TEST-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "calle": "18 de Julio",
            "numero": "1234",
            "apto": "Apto 5",
            "esquina": "Ejido",
            "motivo": "Entrega",
            "departamento": "Montevideo",
            "comentarios": "Test envio from automated testing",
            "telefono": "099123456",
            "contacto": "Juan Pérez"
        }
        
        def check_envio_response(response):
            required_fields = ["id", "ticket", "calle", "numero", "departamento", "motivo", "telefono", "contacto", "fecha_carga", "estado", "historial_estados"]
            return all(field in response for field in required_fields) and response["estado"] == "Ingresada"
        
        success, response = self.run_test(
            "Create Envio (should start with 'Ingresada' state)",
            "POST",
            "envios",
            200,
            data=test_data,
            check_response=check_envio_response
        )
        
        if success:
            self.test_envio_id = response.get("id")
            self.test_ticket = response.get("ticket")
            return True, response
        return False, {}

    def test_change_estado_to_asignado(self, envio_id):
        """Test changing estado from Ingresada to Asignado a courier"""
        if not envio_id:
            self.log_test("Change Estado to Asignado", False, "No envio ID available")
            return False
        
        estado_data = {
            "nuevo_estado": "Asignado a courier"
        }
        
        def check_estado_response(response):
            return response.get("estado") == "Asignado a courier"
        
        return self.run_test(
            "Change Estado: Ingresada → Asignado a courier",
            "PATCH",
            f"envios/{envio_id}/estado",
            200,
            data=estado_data,
            check_response=check_estado_response
        )

    def test_change_estado_to_entregado(self, envio_id):
        """Test changing estado from Asignado a courier to Entregado"""
        if not envio_id:
            self.log_test("Change Estado to Entregado", False, "No envio ID available")
            return False
        
        estado_data = {
            "nuevo_estado": "Entregado",
            "receptor_nombre": "María González",
            "receptor_cedula": "1.234.567-8"
        }
        
        def check_estado_response(response):
            return response.get("estado") == "Entregado"
        
        return self.run_test(
            "Change Estado: Asignado a courier → Entregado (with receptor info)",
            "PATCH",
            f"envios/{envio_id}/estado",
            200,
            data=estado_data,
            check_response=check_estado_response
        )

    def test_invalid_estado_transition(self, envio_id):
        """Test invalid state transition (should fail)"""
        if not envio_id:
            self.log_test("Invalid Estado Transition", False, "No envio ID available")
            return False
        
        # Try to go from Entregado back to Ingresada (should fail)
        estado_data = {
            "nuevo_estado": "Ingresada"
        }
        
        return self.run_test(
            "Invalid Estado Transition (should fail)",
            "PATCH",
            f"envios/{envio_id}/estado",
            400,  # Should return 400 for invalid transition
            data=estado_data
        )

    def test_get_message_logs(self):
        """Test getting WhatsApp message logs (admin only)"""
        def check_messages_response(response):
            return isinstance(response, list)
        
        return self.run_test(
            "Get WhatsApp Message Logs",
            "GET",
            "messages?limit=10",
            200,
            check_response=check_messages_response
        )

    def test_get_envios(self):
        """Test getting envios list"""
        def check_envios_list(response):
            return isinstance(response, list)
        
        return self.run_test(
            "Get Envios List",
            "GET",
            "envios?limit=10",
            200,
            check_response=check_envios_list
        )

    def test_get_envios_count(self):
        """Test getting envios count"""
        def check_count_response(response):
            return "count" in response and isinstance(response["count"], int)
        
        return self.run_test(
            "Get Envios Count",
            "GET",
            "envios/count",
            200,
            check_response=check_count_response
        )

    def test_get_single_envio(self, envio_id):
        """Test getting a single envio"""
        if not envio_id:
            self.log_test("Get Single Envio", False, "No envio ID available")
            return False
        
        def check_single_envio(response):
            return "id" in response and response["id"] == envio_id
        
        return self.run_test(
            "Get Single Envio",
            "GET",
            f"envios/{envio_id}",
            200,
            check_response=check_single_envio
        )

    def test_export_single_excel(self, envio_id):
        """Test exporting single envio to Excel"""
        if not envio_id:
            self.log_test("Export Single Excel", False, "No envio ID available")
            return False
        
        url = f"{self.api_url}/envios/{envio_id}/excel"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            response = requests.get(url, headers=headers, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                content_type = response.headers.get('content-type', '')
                if 'spreadsheet' in content_type or 'excel' in content_type:
                    details += " - Excel file received"
                else:
                    success = False
                    details += f" - Wrong content type: {content_type}"
            else:
                try:
                    error_data = response.json()
                    details += f" - Error: {error_data}"
                except:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test("Export Single Excel", success, details)
            return success
        except Exception as e:
            self.log_test("Export Single Excel", False, f"Exception: {str(e)}")
            return False

    def test_export_all_excel(self):
        """Test exporting all envios to Excel"""
        url = f"{self.api_url}/envios/export/excel"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
            
        try:
            response = requests.get(url, headers=headers, timeout=15)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                content_type = response.headers.get('content-type', '')
                if 'spreadsheet' in content_type or 'excel' in content_type:
                    details += " - Excel file received"
                else:
                    success = False
                    details += f" - Wrong content type: {content_type}"
            elif response.status_code == 404:
                # This might be expected if no envios exist
                details += " - No envios to export (expected if database is empty)"
                success = True  # Consider this a pass for empty database
            else:
                try:
                    error_data = response.json()
                    details += f" - Error: {error_data}"
                except:
                    details += f" - Response: {response.text[:200]}"
            
            self.log_test("Export All Excel", success, details)
            return success
        except Exception as e:
            self.log_test("Export All Excel", False, f"Exception: {str(e)}")
            return False

    def test_delete_envio(self, envio_id):
        """Test deleting an envio"""
        if not envio_id:
            self.log_test("Delete Envio", False, "No envio ID available")
            return False
        
        return self.run_test(
            "Delete Envio",
            "DELETE",
            f"envios/{envio_id}",
            200,
            check_response=lambda r: "message" in r
        )

    def test_validation_errors(self):
        """Test validation for required fields"""
        invalid_data = {
            "ticket": "",  # Empty required field
            "calle": "",   # Empty required field
            "numero": "",  # Empty required field
            "motivo": "InvalidMotivo",  # Invalid motivo
            "departamento": "InvalidDepartment",  # Invalid department
            "telefono": "",  # Empty required field
            "contacto": ""   # Empty required field
        }
        
        return self.run_test(
            "Validation Errors (should fail)",
            "POST",
            "envios",
            422,  # Validation error
            data=invalid_data
        )

def main():
    print("🚀 Starting Uruguay Shipping System API Tests")
    print("=" * 60)
    
    tester = EnviosAPITester()
    
    # Test basic endpoints (no auth required)
    tester.test_root_endpoint()
    tester.test_departamentos()
    tester.test_motivos()
    
    # Test authentication
    login_success, login_data = tester.test_login()
    if not login_success:
        print("❌ Login failed - cannot continue with authenticated tests")
        return 1
    
    # Test user management (admin only)
    tester.test_get_me()
    user_success, user_data = tester.test_create_user()
    tester.test_get_users()
    
    # Test envio CRUD operations
    envio_success, envio_data = tester.test_create_envio()
    envio_id = envio_data.get("id") if envio_success else None
    
    tester.test_get_envios()
    tester.test_get_envios_count()
    tester.test_get_single_envio(envio_id)
    
    # Test state transitions (core functionality)
    if envio_id:
        # Test valid transitions
        tester.test_change_estado_to_asignado(envio_id)
        tester.test_change_estado_to_entregado(envio_id)
        
        # Test invalid transition
        tester.test_invalid_estado_transition(envio_id)
    
    # Test WhatsApp message logs
    tester.test_get_message_logs()
    
    # Test Excel exports
    tester.test_export_single_excel(envio_id)
    tester.test_export_all_excel()
    
    # Test validation
    tester.test_validation_errors()
    
    # Clean up - delete test user and envio
    if hasattr(tester, 'test_user_id'):
        tester.run_test(
            "Delete Test User",
            "DELETE",
            f"users/{tester.test_user_id}",
            200
        )
    
    if envio_id:
        tester.test_delete_envio(envio_id)
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 Test Summary: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed!")
        failed_tests = [r for r in tester.test_results if not r["success"]]
        print("\nFailed tests:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())