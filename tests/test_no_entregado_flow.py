"""
Test suite for 'No entregado' functionality in Uruguay Shipping Management System
Tests the complete flow: Create envío → Assign to courier → Mark No Entregado with photo/comment → Verify data persistence
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
API_URL = f"{BASE_URL}/api"

# Test credentials
ADMIN_CREDENTIALS = {"username": "admin", "password": "admin123"}
REPARTIDOR_CREDENTIALS = {"username": "repartidor1", "password": "rep123"}


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed")


@pytest.fixture(scope="module")
def repartidor_token():
    """Get repartidor authentication token - create user if doesn't exist"""
    # First try to login
    response = requests.post(f"{API_URL}/auth/login", json=REPARTIDOR_CREDENTIALS)
    if response.status_code == 200:
        return response.json().get("access_token")
    
    # If login fails, create the repartidor user with admin
    admin_response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
    if admin_response.status_code != 200:
        pytest.skip("Cannot create repartidor - admin auth failed")
    
    admin_token = admin_response.json().get("access_token")
    create_response = requests.post(
        f"{API_URL}/users",
        json={
            "username": "repartidor1",
            "password": "rep123",
            "nombre": "Repartidor Test",
            "rol": "repartidor"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    
    if create_response.status_code in [200, 201]:
        # Now login with the new user
        login_response = requests.post(f"{API_URL}/auth/login", json=REPARTIDOR_CREDENTIALS)
        if login_response.status_code == 200:
            return login_response.json().get("access_token")
    
    pytest.skip("Repartidor authentication/creation failed")


@pytest.fixture
def admin_client(admin_token):
    """Session with admin auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    })
    return session


@pytest.fixture
def repartidor_client(repartidor_token):
    """Session with repartidor auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {repartidor_token}"
    })
    return session


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_admin_login(self):
        """Test admin can login successfully"""
        response = requests.post(f"{API_URL}/auth/login", json=ADMIN_CREDENTIALS)
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["rol"] == "admin"
        print("✓ Admin login successful")
    
    def test_invalid_login(self):
        """Test invalid credentials return 401"""
        response = requests.post(f"{API_URL}/auth/login", json={
            "username": "invalid",
            "password": "invalid"
        })
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")


class TestNoEntregadoFlow:
    """Test the complete 'No entregado' flow with comment and image"""
    
    def test_create_envio_for_no_entregado_test(self, admin_client):
        """Step 1: Create a new envío for testing"""
        envio_data = {
            "ticket": "TEST-NOENT-001",
            "calle": "Av. 18 de Julio",
            "numero": "1234",
            "apto": "101",
            "esquina": "Ejido",
            "motivo": "Entrega",
            "departamento": "Montevideo",
            "comentarios": "Test envío para No Entregado",
            "telefono": "099123456",
            "contacto": "Juan Test"
        }
        
        response = admin_client.post(f"{API_URL}/envios", json=envio_data)
        assert response.status_code == 200, f"Failed to create envío: {response.text}"
        
        data = response.json()
        assert data["ticket"] == "TEST-NOENT-001"
        assert data["estado"] == "Ingresada"
        assert "id" in data
        
        # Store envio_id for subsequent tests
        pytest.envio_id = data["id"]
        print(f"✓ Created envío with ID: {data['id']}")
        return data["id"]
    
    def test_assign_to_courier(self, repartidor_client):
        """Step 2: Assign envío to courier"""
        envio_id = getattr(pytest, 'envio_id', None)
        if not envio_id:
            pytest.skip("No envio_id from previous test")
        
        response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={"nuevo_estado": "Asignado a courier"}
        )
        assert response.status_code == 200, f"Failed to assign to courier: {response.text}"
        
        data = response.json()
        assert data["estado"] == "Asignado a courier"
        print("✓ Envío assigned to courier")
    
    def test_mark_no_entregado_with_comment_and_image(self, repartidor_client):
        """Step 3: Mark as 'No entregado' with comment and image"""
        envio_id = getattr(pytest, 'envio_id', None)
        if not envio_id:
            pytest.skip("No envio_id from previous test")
        
        # Create a small test image (1x1 red pixel PNG)
        test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        
        response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={
                "nuevo_estado": "No entregado",
                "comentario": "No había nadie en el domicilio. Se intentó contactar sin éxito.",
                "imagen_url": test_image_base64
            }
        )
        assert response.status_code == 200, f"Failed to mark as No entregado: {response.text}"
        
        data = response.json()
        assert data["estado"] == "No entregado"
        print("✓ Envío marked as 'No entregado' with comment and image")
    
    def test_verify_no_entregado_data_persisted(self, admin_client):
        """Step 4: Verify the comment and image are saved in historial_estados"""
        envio_id = getattr(pytest, 'envio_id', None)
        if not envio_id:
            pytest.skip("No envio_id from previous test")
        
        response = admin_client.get(f"{API_URL}/envios/{envio_id}")
        assert response.status_code == 200, f"Failed to get envío: {response.text}"
        
        data = response.json()
        assert data["estado"] == "No entregado"
        
        # Find the "No entregado" entry in historial_estados
        historial = data.get("historial_estados", [])
        no_entregado_entry = None
        for entry in historial:
            if entry.get("estado") == "No entregado":
                no_entregado_entry = entry
                break
        
        assert no_entregado_entry is not None, "No 'No entregado' entry found in historial_estados"
        assert no_entregado_entry.get("comentario") == "No había nadie en el domicilio. Se intentó contactar sin éxito.", \
            f"Comment not saved correctly. Got: {no_entregado_entry.get('comentario')}"
        assert no_entregado_entry.get("imagen_url") is not None, "Image URL not saved"
        assert no_entregado_entry.get("usuario_nombre") is not None, "Usuario nombre not saved"
        
        print(f"✓ No entregado data verified:")
        print(f"  - Comentario: {no_entregado_entry.get('comentario')}")
        print(f"  - Imagen URL present: {bool(no_entregado_entry.get('imagen_url'))}")
        print(f"  - Reportado por: {no_entregado_entry.get('usuario_nombre')}")
    
    def test_can_retry_delivery_after_no_entregado(self, repartidor_client):
        """Step 5: Verify can reassign to courier after 'No entregado'"""
        envio_id = getattr(pytest, 'envio_id', None)
        if not envio_id:
            pytest.skip("No envio_id from previous test")
        
        response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={"nuevo_estado": "Asignado a courier"}
        )
        assert response.status_code == 200, f"Failed to reassign to courier: {response.text}"
        
        data = response.json()
        assert data["estado"] == "Asignado a courier"
        print("✓ Envío can be reassigned after 'No entregado'")
    
    def test_cleanup_test_envio(self, admin_client):
        """Cleanup: Delete test envío"""
        envio_id = getattr(pytest, 'envio_id', None)
        if envio_id:
            response = admin_client.delete(f"{API_URL}/envios/{envio_id}")
            assert response.status_code == 200, f"Failed to delete test envío: {response.text}"
            print("✓ Test envío cleaned up")


class TestNoEntregadoWithoutImage:
    """Test 'No entregado' flow without image (only comment)"""
    
    def test_no_entregado_comment_only(self, admin_client, repartidor_client):
        """Test marking as 'No entregado' with only a comment (no image)"""
        # Create envío
        envio_data = {
            "ticket": "TEST-NOENT-002",
            "calle": "Bulevar Artigas",
            "numero": "567",
            "motivo": "Entrega",
            "departamento": "Canelones",
            "telefono": "099654321",
            "contacto": "Maria Test"
        }
        
        create_response = admin_client.post(f"{API_URL}/envios", json=envio_data)
        assert create_response.status_code == 200
        envio_id = create_response.json()["id"]
        
        # Assign to courier
        assign_response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={"nuevo_estado": "Asignado a courier"}
        )
        assert assign_response.status_code == 200
        
        # Mark as No entregado with only comment
        no_entregado_response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={
                "nuevo_estado": "No entregado",
                "comentario": "Dirección incorrecta"
            }
        )
        assert no_entregado_response.status_code == 200
        
        # Verify
        get_response = admin_client.get(f"{API_URL}/envios/{envio_id}")
        data = get_response.json()
        
        historial = data.get("historial_estados", [])
        no_entregado_entry = next((h for h in historial if h.get("estado") == "No entregado"), None)
        
        assert no_entregado_entry is not None
        assert no_entregado_entry.get("comentario") == "Dirección incorrecta"
        assert no_entregado_entry.get("imagen_url") is None  # No image
        
        # Cleanup
        admin_client.delete(f"{API_URL}/envios/{envio_id}")
        print("✓ No entregado with comment only works correctly")


class TestStateTransitions:
    """Test valid and invalid state transitions"""
    
    def test_invalid_transition_ingresada_to_no_entregado(self, admin_client, repartidor_client):
        """Cannot go directly from 'Ingresada' to 'No entregado'"""
        # Create envío
        envio_data = {
            "ticket": "TEST-TRANS-001",
            "calle": "Test Street",
            "numero": "123",
            "motivo": "Entrega",
            "departamento": "Montevideo",
            "telefono": "099111222",
            "contacto": "Test Contact"
        }
        
        create_response = admin_client.post(f"{API_URL}/envios", json=envio_data)
        assert create_response.status_code == 200
        envio_id = create_response.json()["id"]
        
        # Try to mark as No entregado directly (should fail)
        invalid_response = repartidor_client.patch(
            f"{API_URL}/envios/{envio_id}/estado",
            json={"nuevo_estado": "No entregado"}
        )
        assert invalid_response.status_code == 400, "Should not allow direct transition to No entregado"
        
        # Cleanup
        admin_client.delete(f"{API_URL}/envios/{envio_id}")
        print("✓ Invalid state transition correctly rejected")


class TestImageUpload:
    """Test image upload endpoint"""
    
    def test_upload_image_endpoint(self, admin_client):
        """Test the image upload endpoint"""
        # Create envío first
        envio_data = {
            "ticket": "TEST-IMG-001",
            "calle": "Image Test Street",
            "numero": "999",
            "motivo": "Entrega",
            "departamento": "Montevideo",
            "telefono": "099999999",
            "contacto": "Image Test"
        }
        
        create_response = admin_client.post(f"{API_URL}/envios", json=envio_data)
        assert create_response.status_code == 200
        envio_id = create_response.json()["id"]
        
        # Create a small test image file
        import io
        # 1x1 red pixel PNG
        png_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==")
        
        files = {"file": ("test.png", io.BytesIO(png_data), "image/png")}
        
        # Remove Content-Type header for multipart upload
        headers = {"Authorization": admin_client.headers["Authorization"]}
        
        upload_response = requests.post(
            f"{API_URL}/envios/{envio_id}/upload-image",
            files=files,
            headers=headers
        )
        assert upload_response.status_code == 200, f"Image upload failed: {upload_response.text}"
        
        data = upload_response.json()
        assert "imagen_url" in data
        assert data["imagen_url"].startswith("data:image/")
        
        # Cleanup
        admin_client.delete(f"{API_URL}/envios/{envio_id}")
        print("✓ Image upload endpoint works correctly")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
