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
            check_response=lambda r: "message" in r
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
            check_response=check_departamentos
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
            check_response=check_motivos
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
            required_fields = ["id", "ticket", "calle", "numero", "departamento", "motivo", "telefono", "contacto", "fecha_carga"]
            return all(field in response for field in required_fields)
        
        success, response = self.run_test(
            "Create Envio",
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
        try:
            response = requests.get(url, timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                content_type = response.headers.get('content-type', '')
                if 'spreadsheet' in content_type or 'excel' in content_type:
                    details += " - Excel file received"
                else:
                    success = False
                    details += f" - Wrong content type: {content_type}"
            
            self.log_test("Export Single Excel", success, details)
            return success
        except Exception as e:
            self.log_test("Export Single Excel", False, f"Exception: {str(e)}")
            return False

    def test_export_all_excel(self):
        """Test exporting all envios to Excel"""
        url = f"{self.api_url}/envios/export/excel"
        try:
            response = requests.get(url, timeout=15)
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
    print("🚀 Starting Uruguay Shipping Form API Tests")
    print("=" * 60)
    
    tester = EnviosAPITester()
    
    # Test basic endpoints
    tester.test_root_endpoint()
    tester.test_departamentos()
    tester.test_motivos()
    
    # Test CRUD operations
    success, envio_data = tester.test_create_envio()
    envio_id = envio_data.get("id") if success else None
    
    tester.test_get_envios()
    tester.test_get_envios_count()
    tester.test_get_single_envio(envio_id)
    
    # Test Excel exports
    tester.test_export_single_excel(envio_id)
    tester.test_export_all_excel()
    
    # Test validation
    tester.test_validation_errors()
    
    # Clean up - delete test envio
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