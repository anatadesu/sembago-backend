import json
import heapq
import math
from fastapi import FastAPI, HTTPException

app = FastAPI()

class Node:
    def __init__(self, name, latitude, longitude):
        self.name = name
        self.latitude = latitude
        self.longitude = longitude
        self.g_score = float('inf')
        self.h_score = float('inf')
        self.f_score = float('inf')
        self.came_from = None

    def __lt__(self, other):
        return self.f_score < other.f_score

def haversine(lat1, lon1, lat2, lon2):
    # Konversi derajat ke radian
    lat1 = math.radians(lat1)
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    # Perbedaan latitude dan longitude
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    # Menggunakan rumus Haversine
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    radius = 6371  # Radius bumi dalam kilometer
    distance = radius * c

    return distance

def a_star(graph, start, goal):
    open_set = []
    heapq.heappush(open_set, start)
    start.g_score = 0
    start.h_score = haversine(start.latitude, start.longitude, goal.latitude, goal.longitude)
    start.f_score = start.h_score

    while open_set:
        current = heapq.heappop(open_set)

        if current == goal:
            path = []
            while current:
                path.insert(0, current.name)
                current = current.came_from
            return path

        for neighbor in graph[current.name]:
            tentative_g_score = current.g_score + haversine(current.latitude, current.longitude, neighbor.latitude, neighbor.longitude)

            if tentative_g_score < neighbor.g_score:
                neighbor.came_from = current
                neighbor.g_score = tentative_g_score
                neighbor.h_score = haversine(neighbor.latitude, neighbor.longitude, goal.latitude, goal.longitude)
                neighbor.f_score = neighbor.g_score + neighbor.h_score

                if neighbor not in open_set:
                    heapq.heappush(open_set, neighbor)

    return None

@app.post('/')
async def find_nearest_markets(input_data: dict):
    try:
        if isinstance(input_data, dict) and len(input_data) == 3:
            user_lat = input_data['user_lat']
            user_long = input_data['user_long']
            datas = input_data['data']

            nodes = [Node(data['name'], data['latitude'], data['longitude']) for data in datas]

            graph = {node.name: [] for node in nodes}
            for node in nodes:
                for other_node in nodes:
                    if node != other_node:
                        graph[node.name].append(other_node)

            nearest_markets = heapq.nsmallest(5, nodes, key=lambda node: haversine(user_lat, user_long, node.latitude, node.longitude))

            user_node = Node('User_Location', user_lat, user_long)
            nodes.append(user_node)
            graph['User_Location'] = nodes

            for i, nearest_market in enumerate(nearest_markets):
                result_path = a_star(graph, user_node, nearest_market)

                if result_path:
                    return {
                        "goal_node": nearest_market.name,
                        "distance_km": haversine(user_lat, user_long, nearest_market.latitude, nearest_market.longitude)
                    }
                else:
                    raise HTTPException(status_code=500, detail=f'Top {i + 1} Nearest Minimarket: No valid path found.')
        else:
            raise HTTPException(status_code=400, detail='Invalid input format. Expected a dictionary with three keys: user_lat, user_long, and data.')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
