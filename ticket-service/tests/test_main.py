import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["TEST"] = "true"

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_ticket():
    response = client.post(
        "/tickets",
        json={"title": "Test Ticket", "description": "Test Description", "user_id": 1},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Ticket"
    assert data["description"] == "Test Description"
    assert data["status"] == "open"
    assert data["user_id"] == 1


def test_get_ticket():
    # First create a ticket
    create_response = client.post(
        "/tickets",
        json={"title": "Test Ticket", "description": "Test Description", "user_id": 1},
    )
    ticket_id = create_response.json()["id"]

    response = client.get(f"/tickets/{ticket_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == ticket_id
    assert data["title"] == "Test Ticket"


def test_update_ticket():
    # Create
    create_response = client.post(
        "/tickets",
        json={"title": "Test Ticket", "description": "Test Description", "user_id": 1},
    )
    ticket_id = create_response.json()["id"]

    # Update
    update_response = client.put(
        f"/tickets/{ticket_id}", json={"title": "Updated Title"}
    )
    assert update_response.status_code == 200
    data = update_response.json()
    assert data["title"] == "Updated Title"
    assert data["description"] == "Test Description"


def test_get_nonexistent_ticket():
    response = client.get("/tickets/999")
    assert response.status_code == 404
