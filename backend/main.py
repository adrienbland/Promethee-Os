import asyncio
import json
import os
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

load_dotenv(dotenv_path="../.env")

app = FastAPI(title="Jarvis Agentic OS", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.agent_task = None
        self.agent = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_json(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

async def process_prompt(prompt: str, websocket: WebSocket, project: str = "Tous les projets (Homelab)", model: str = "gemini-3.7-flash"):
    
    workspace_path = f"/home/snow/homelab/homelab/{project}" if project and project != "Tous les projets (Homelab)" else "/home/snow/homelab/homelab"
    
    config = LocalAgentConfig(
        system_instructions=f"Tu es Prométhée, l'Agentic OS de mon homelab. Tu as accès à mes fichiers de développement. Ton répertoire de travail actuel est {workspace_path}. Tu peux les modifier. Garde tes réponses concises et efficaces.",
        model=model,
        capabilities=CapabilitiesConfig()
    )
    
    try:
        async with Agent(config) as agent:
            await manager.send_json({"type": "status", "data": "Prométhée réfléchit..."}, websocket)
            
            response = await agent.chat(prompt)
            
            async def stream_thoughts():
                async for call in response.tool_calls:
                    await manager.send_json({"type": "status", "data": f"Exécution en cours : {call.name} ..."}, websocket)
            asyncio.create_task(stream_thoughts())

            full_reply = ""
            async for token in response:
                full_reply += token
                await manager.send_json({"type": "stream", "data": token}, websocket)
            
            await manager.send_json({"type": "final", "data": full_reply}, websocket)
            
    except Exception as e:
        await manager.send_json({"type": "error", "data": str(e)}, websocket)


import docker

try:
    docker_client = docker.from_env()
except Exception as e:
    docker_client = None
    print(f"Docker client not initialized: {e}")

async def broadcast_docker_stats():
    while True:
        try:
            if docker_client and manager.active_connections:
                containers = docker_client.containers.list(all=True)
                running = sum(1 for c in containers if c.status == 'running')
                stopped = len(containers) - running
                
                import concurrent.futures
                import concurrent.futures

                def get_c_stats(c):
                    if c.status != 'running': return "0 MB"
                    try:
                        st = c.stats(stream=False)
                        usage = st.get('memory_stats', {}).get('usage', 0)
                        return f"{usage / (1024*1024):.1f} MB"
                    except:
                        return "N/A"
                
                loop = asyncio.get_event_loop()
                with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
                    tasks = [loop.run_in_executor(pool, get_c_stats, c) for c in containers]
                    mem_usages = await asyncio.gather(*tasks)

                container_list = []
                for c, mem in zip(containers, mem_usages):
                    mem_val = 0.0
                    if mem != "N/A" and " MB" in mem:
                        try:
                            mem_val = float(mem.replace(" MB", ""))
                        except:
                            pass
                    container_list.append({"name": c.name, "status": c.status, "mem": mem, "_sort_val": mem_val})
                
                container_list.sort(key=lambda x: x["_sort_val"], reverse=True)
                
                for c in container_list:
                    del c["_sort_val"]
                
                stats_payload = {
                    "type": "server_stats",
                    "data": {
                        "containers_running": running,
                        "containers_stopped": stopped,
                        "total_containers": len(containers),
                        "containers_list": container_list
                    }
                }
                await manager.broadcast(stats_payload)
        except Exception as e:
            print(f"Error fetching docker stats: {e}")
            
        await asyncio.sleep(10) # Broadcast every 10 seconds

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(broadcast_docker_stats())

@app.get("/")
def read_root():
    return {"status": "online", "message": "Prométhée Backend is running with Antigravity SDK."}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            if payload.get("type") == "prompt":
                project = payload.get("project", "Tous les projets (Homelab)")
                model = payload.get("model", "gemini-3.7-flash")
                asyncio.create_task(process_prompt(payload.get("data"), websocket, project, model))
            else:
                await manager.send_json({"type": "ping", "data": "pong"}, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
