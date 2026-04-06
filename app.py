from flask import Flask, render_template, request, jsonify
from graph_data import graph, coordinates
import heapq

app = Flask(__name__)

def dijkstra(start, end):
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
            heapq.heappush(queue, (cost + weight, neighbor, path))

    return [], float('inf')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/get_graph')
def get_graph():
    return jsonify({
        "graph": graph,
        "coordinates": coordinates
    })


@app.route('/find_path', methods=['POST'])
def find_path():
    data = request.json
    source = data['source']
    destination = data['destination']

    path, distance = dijkstra(source, destination)

    return jsonify({
        "path": path,
        "distance": distance
    })


if __name__ == '__main__':
    app.run(debug=True)