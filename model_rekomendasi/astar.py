# -*- coding: utf-8 -*-

import json
import heapq
import math
import sys

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

if __name__ == '__main__':
    try:
        # Change: Read input data from command-line arguments
        input_data = json.loads(sys.argv[1])

        if isinstance(input_data, dict) and 'user_lat' in input_data and 'user_long' in input_data and 'data' in input_data:
            user_lat = input_data['user_lat']
            user_long = input_data['user_long']
            data = input_data['data']

            nodes = [Node(node_data['name'], node_data['latitude'], node_data['longitude']) for node_data in data]
            
            graph = {node.name: [] for node in nodes}
            for node in nodes:
                for other_node in nodes:
                    if node != other_node:
                        graph[node.name].append(other_node)
                
            user_node = Node('User_Location', user_lat, user_long)
            graph[user_node.name] = [node for node in nodes if node != user_node]

            nearest_markets = heapq.nsmallest(
                5, nodes, key=lambda node: haversine(float(user_lat), float(user_long), float(node.latitude), float(node.longitude))
            )

            for i, nearest_market in enumerate(nearest_markets):
                result_path = a_star(graph, user_node, nearest_market)
                print(json.dumps({
                    "goal": nearest_market.name,
                    "dist_km": haversine(user_lat, user_long, nearest_market.latitude, nearest_market.longitude)
                }))
        else:
            print(json.dumps({'error': 'Invalid input format. Expected a list of three arguments.'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))

