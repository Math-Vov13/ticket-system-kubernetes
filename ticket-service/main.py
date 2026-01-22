from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import psycopg2
import redis
import json
from datetime import datetime
import os

app = FastAPI()


class TicketCreate(BaseModel):
    title: str
    description: str
    user_id: int


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class Ticket(BaseModel):
    id: int
    title: str
    description: str
    status: str
    user_id: int
    created_at: str


def init_db():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'open',
        user_id INTEGER,
        created_at TEXT
    )""")
    conn.commit()
    conn.close()


def get_db():
    if os.getenv("TEST") == "true":
        import sqlite3

        return sqlite3.connect(":memory:")
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def get_redis():
    return redis.Redis(host="redis", port=6379, decode_responses=True)


init_db()


@app.post("/tickets", response_model=Ticket)
async def create_ticket(ticket: TicketCreate):
    conn = get_db()
    c = conn.cursor()
    created_at = datetime.now().isoformat()
    c.execute(
        "INSERT INTO tickets (title, description, user_id, created_at) VALUES (%s, %s, %s, %s) RETURNING id",
        (ticket.title, ticket.description, ticket.user_id, created_at),
    )
    result = c.fetchone()
    if not result:
        conn.close()
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    ticket_id = result[0]

    conn.commit()
    conn.close()

    # Publish event
    r = get_redis()
    event = {
        "event": "ticket_created",
        "ticket_id": ticket_id,
        "user_id": ticket.user_id,
    }
    r.publish("ticket_events", json.dumps(event))

    return Ticket(
        id=ticket_id,
        title=ticket.title,
        description=ticket.description,
        status="open",
        user_id=ticket.user_id,
        created_at=created_at,
    )


@app.get("/tickets/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: int):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "SELECT id, title, description, status, user_id, created_at FROM tickets WHERE id = %s",
        (ticket_id,),
    )
    row = c.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return Ticket(
        id=row[0],
        title=row[1],
        description=row[2],
        status=row[3],
        user_id=row[4],
        created_at=row[5],
    )


@app.put("/tickets/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: int, ticket_update: TicketUpdate):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "SELECT title, description, status, user_id, created_at FROM tickets WHERE id = %s",
        (ticket_id,),
    )
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Ticket not found")

    title = ticket_update.title if ticket_update.title is not None else row[0]
    description = (
        ticket_update.description if ticket_update.description is not None else row[1]
    )
    status = ticket_update.status if ticket_update.status is not None else row[2]
    user_id = row[3]
    created_at = row[4]

    c.execute(
        "UPDATE tickets SET title = %s, description = %s, status = %s WHERE id = %s",
        (title, description, status, ticket_id),
    )
    conn.commit()
    conn.close()

    # Publish event
    r = get_redis()
    event = {"event": "ticket_updated", "ticket_id": ticket_id}
    r.publish("ticket_events", json.dumps(event))

    return Ticket(
        id=ticket_id,
        title=title,
        description=description,
        status=status,
        user_id=user_id,
        created_at=created_at,
    )


@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "service": "ticket-service",
        "timestamp": datetime.now().isoformat(),
        "checks": {},
    }

    status_code = 200 if health_status["status"] == "healthy" else 503
    return JSONResponse(content=health_status, status_code=status_code)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8082))
    uvicorn.run(app, host="0.0.0.0", port=port)
