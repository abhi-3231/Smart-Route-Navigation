
let canvas = document.getElementById("mapCanvas");
let ctx = canvas.getContext("2d");

let graph = {};
let coords = {};
let selected = [];
let currentPath = [];

// Load graph
fetch("/get_graph")
.then(res => res.json())
.then(data => {
    graph = data.graph;
    coords = data.coordinates;
    drawMap();
});

// Draw full map
function drawMap(path = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🔹 Draw edges
    for (let node in graph) {
        let x1 = coords[node][0];
        let y1 = coords[node][1];

        for (let neighbor in graph[node]) {
            let x2 = coords[neighbor][0];
            let y2 = coords[neighbor][1];

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // 🔴 Draw path
    for (let i = 0; i < path.length - 1; i++) {
        let x1 = coords[path[i]][0];
        let y1 = coords[path[i]][1];
        let x2 = coords[path[i + 1]][0];
        let y2 = coords[path[i + 1]][1];

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // 🔵 Draw nodes with zones
    for (let node in coords) {
        let x = coords[node][0];
        let y = coords[node][1];

        let color = "white";

        // Zone coloring
        if (node.includes("Hostel") || node === "Mess") color = "orange";
        else if (node.includes("Lab") || node.includes("Block") || node.includes("Center")) color = "cyan";
        else if (node.includes("Field") || node.includes("Ground") || node.includes("Sports") || node === "Gym") color = "lime";

        // Selected highlight
        if (selected.includes(node)) color = "yellow";

        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Label
        ctx.fillStyle = "white";
        ctx.font = "10px Arial";
        ctx.fillText(node, x - 25, y - 15);
    }
}

// 🖱️ Click detection
canvas.addEventListener("click", function(e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    for (let node in coords) {
        let nx = coords[node][0];
        let ny = coords[node][1];

        if (Math.hypot(nx - x, ny - y) < 15) {
            selected.push(node);

            if (selected.length === 2) {
                getPath(selected[0], selected[1]);
                selected = [];
            }

            drawMap();
            break;
        }
    }
});

// 🚀 Fetch shortest path
function getPath(source, destination) {
    fetch("/find_path", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({source, destination})
    })
    .then(res => res.json())
    .then(data => {
        console.log("Path:", data);

        currentPath = data.path;

        animatePath(currentPath);

        document.getElementById("info").innerHTML =
            `<p>🚀 Path: ${currentPath.join(" → ")} | Distance: ${data.distance}</p>`;
    });
}

// 🔥 Smooth animation (UPGRADED)
function animatePath(path) {
    let i = 0;

    function step() {
        drawMap(path.slice(0, i + 1));

        // Moving dot animation (interpolated)
        if (i < path.length - 1) {
            let [x1, y1] = coords[path[i]];
            let [x2, y2] = coords[path[i + 1]];

            let progress = 0;

            function moveDot() {
                drawMap(path.slice(0, i + 1));

                let x = x1 + (x2 - x1) * progress;
                let y = y1 + (y2 - y1) * progress;

                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = "lime";
                ctx.fill();

                progress += 0.05;

                if (progress <= 1) {
                    requestAnimationFrame(moveDot);
                } else {
                    i++;
                    setTimeout(step, 100);
                }
            }

            moveDot();
        }
    }

    step();
}