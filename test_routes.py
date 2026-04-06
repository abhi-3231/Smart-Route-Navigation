import sys
from app import dijkstra, get_path_metrics
from graph_data import graph

nodes = list(graph.keys())
print(f"Total nodes: {len(nodes)}")

errors = []
unreachable = 0

for start in nodes:
    for end in nodes:
        if start == end:
            continue
            
        # Shortest Mode
        s_path, s_cost = dijkstra(start, end, mode="shortest")
        if not s_path:
            unreachable += 1
            errors.append(f"UNREACHABLE: {start} -> {end}")
            continue
            
        s_dist, s_time = get_path_metrics(s_path)
        
        # Fastest Mode
        f_path, f_cost = dijkstra(start, end, mode="fastest")
        f_dist, f_time = get_path_metrics(f_path)
        
        # Validation checks
        
        # 1. Physical distance of "shortest" should be <= physical distance of "fastest"
        if s_dist > f_dist:
            errors.append(f"LOGIC ERROR: Shortest path dist ({s_dist}) > Fastest path dist ({f_dist}) for {start}->{end}")
            
        # 2. Estimated time of "fastest" should be <= estimated time of "shortest"
        if f_time > s_time:
            errors.append(f"LOGIC ERROR: Fastest path time ({f_time}) > Shortest path time ({s_time}) for {start}->{end}")

print(f"Test complete. Checked {len(nodes) * (len(nodes)-1)} routes.")
if unreachable:
    print(f"Found {unreachable} unreachable routes!")
if errors:
    print("ERRORS FOUND:")
    for e in errors[:20]:
        print(e)
    if len(errors) > 20:
        print(f"... and {len(errors)-20} more")
else:
    print("ALL ROUTES VALID AND OPTIMAL! ✅")
