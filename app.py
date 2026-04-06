from flask import Flask, render_template, request, jsonify
from graph_data import graph, coordinates
import heapq

app = Flask(__name__)

# Congestion penalties applied ONLY in "fastest" mode
CONGESTION_WEIGHTS = {
    "Cafeteria": 5,
    "Main Gate": 3,
}

def dijkstra(start, end, mode="shortest"):
    queue = [(0, start, [])]
    visited = set()

    while queue:
        cost, node, path = heapq.heappop(queue)
        if node in visited:
            continue
        visited.add(node)
        path = path + [node]

        if node == end:
            return path, cost

        for neighbor, weight in graph[node].items():
            extra = CONGESTION_WEIGHTS.get(neighbor, 0) if mode == "fastest" else 0
            heapq.heappush(queue, (cost + weight + extra, neighbor, path))

    return [], float('inf')


def get_path_metrics(path):
    distance = 0
    time = 0
    if not path:
        return 0, 0
    
    for i in range(len(path) - 1):
        u = path[i]
        v = path[i+1]
        w = graph[u][v]
        distance += w
        
        # Calculate time: base weight + congestion delay to reach node v
        extra = CONGESTION_WEIGHTS.get(v, 0)
        time += w + extra
        
    return distance, time

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/get_graph')
def get_graph():
    return jsonify({"graph": graph, "coordinates": coordinates})


@app.route('/find_path', methods=['POST'])
def find_path():
    data = request.json
    source = data.get('source')
    destination = data.get('destination')
    mode = data.get('mode', 'shortest')

    if not source or not destination:
        return jsonify({"error": "Source and destination required"}), 400

    path, cost = dijkstra(source, destination, mode)
    
    true_distance, estimated_time = get_path_metrics(path)
    steps = len(path) - 1 if path else 0

    return jsonify({
        "path": path,
        "distance": true_distance if path else None,
        "steps": steps,
        "estimated_time": estimated_time if path else 0,
        "mode": mode
    })


if __name__ == '__main__':
    app.run(debug=True)