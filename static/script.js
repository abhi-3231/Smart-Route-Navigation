/* ─── State ─── */
let canvas = document.getElementById("mapCanvas");
let ctx    = canvas.getContext("2d");

let graph  = {};
let coords = {};
let selected     = [];   // pending click selections (max 1)
let currentPath  = [];
let currentMode  = "shortest";
let lastStart    = null;
let lastEnd      = null;

/* ─── Load graph data ─── */
fetch("/get_graph")
    .then(r => r.json())
    .then(data => {
        graph  = data.graph;
        coords = data.coordinates;
        drawMap();
    });

/* ═══════════════════════════════════════════
   MODE TOGGLE
═══════════════════════════════════════════ */
function setMode(mode) {
    currentMode = mode;

    document.getElementById("shortestBtn").classList.toggle("active", mode === "shortest");
    document.getElementById("fastestBtn").classList.toggle("active", mode === "fastest");

    const desc = {
        shortest: "Finds the path with minimum total distance.",
        fastest:  "Avoids congestion at Cafeteria & Main Gate for a quicker trip."
    };
    document.getElementById("modeDesc").textContent = desc[mode];

    /* Re-route if a path is already displayed */
    if (lastStart && lastEnd) {
        document.getElementById("clickHint").textContent = "Recalculating…";
        fetchPath(lastStart, lastEnd);
    }
}

/* ═══════════════════════════════════════════
   RESET
═══════════════════════════════════════════ */
function resetRoute() {
    selected    = [];
    currentPath = [];
    lastStart   = null;
    lastEnd     = null;

    document.getElementById("startName").textContent  = "Not selected";
    document.getElementById("startName").className    = "node-name unselected";
    document.getElementById("endName").textContent    = "Not selected";
    document.getElementById("endName").className      = "node-name unselected";
    document.getElementById("clickHint").textContent  = "Click any node to set your start point";
    document.getElementById("resultCard").classList.add("hidden");
    document.getElementById("directionsCard").classList.add("hidden");
    document.getElementById("directionsList").innerHTML = "";

    drawMap();
}

/* ═══════════════════════════════════════════
   DRAW MAP
═══════════════════════════════════════════ */
function drawMap(path = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pathSet = new Set(path);

    /* ── Edges ── */
    for (let node in graph) {
        if (!coords[node]) continue;
        const [x1, y1] = coords[node];

        for (let nb in graph[node]) {
            if (!coords[nb]) continue;
            const [x2, y2] = coords[nb];

            const idxN  = path.indexOf(node);
            const idxNb = path.indexOf(nb);
            const onPath = idxN !== -1 && idxNb !== -1 && Math.abs(idxN - idxNb) === 1;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);

            if (onPath) {
                ctx.strokeStyle = "rgba(244,63,94,0.85)";
                ctx.lineWidth   = 3.5;
                ctx.shadowBlur  = 8;
                ctx.shadowColor = "rgba(244,63,94,0.5)";
            } else {
                ctx.strokeStyle = "rgba(51,65,85,0.6)";
                ctx.lineWidth   = 1;
                ctx.shadowBlur  = 0;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    /* ── Nodes ── */
    for (let node in coords) {
        const [x, y] = coords[node];
        const isSelected = selected.includes(node);
        const isOnPath   = pathSet.has(node) && path.length > 0;
        const isStart    = path.length > 0 && node === path[0];
        const isEnd      = path.length > 0 && node === path[path.length - 1];

        /* Base zone colors */
        let fill   = "#0f172a";
        let stroke = "#334155";

        if (node.includes("Hostel") || node === "Mess") {
            fill = "#431407"; stroke = "#f59e0b";
        } else if (node.includes("Lab") || node.includes("Block") ||
                   node.includes("Center") || node.includes("Hub") || node === "IT Block") {
            fill = "#0c4a6e"; stroke = "#06b6d4";
        } else if (node.includes("Field") || node.includes("Ground") ||
                   node.includes("Sports") || node === "Gym") {
            fill = "#052e16"; stroke = "#22c55e";
        }

        /* Overrides */
        if (isOnPath)   { fill = "#4c0519"; stroke = "#f43f5e"; }
        if (isSelected) { fill = "#431407"; stroke = "#fbbf24"; }
        if (isStart)    { fill = "#0c1f4a"; stroke = "#3b82f6"; }
        if (isEnd)      { fill = "#4c0519"; stroke = "#f43f5e"; }

        /* Glow halo */
        let glowColor = null;
        if (isSelected) glowColor = "rgba(251,191,36,0.55)";
        if (isOnPath)   glowColor = "rgba(244,63,94,0.4)";
        if (isStart)    glowColor = "rgba(59,130,246,0.7)";
        if (isEnd)      glowColor = "rgba(244,63,94,0.7)";

        if (glowColor) {
            ctx.save();
            ctx.shadowBlur  = 16;
            ctx.shadowColor = glowColor;
            ctx.beginPath();
            ctx.arc(x, y, 13, 0, Math.PI * 2);
            ctx.fillStyle = glowColor;
            ctx.fill();
            ctx.restore();
        }

        /* Circle */
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fillStyle   = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth   = 2;
        ctx.stroke();

        /* Label */
        ctx.fillStyle   = (isSelected || isOnPath) ? "#ffffff" : "#f8fafc";
        ctx.font        = `${isSelected || isOnPath ? "700 " : "600 "}12px Inter, sans-serif`;
        ctx.textAlign   = "center";
        
        ctx.lineWidth   = 3.5;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
        ctx.strokeText(node, x, y - 16);
        ctx.fillText(node, x, y - 16);
    }
}

/* ═══════════════════════════════════════════
   CLICK DETECTION
═══════════════════════════════════════════ */
canvas.addEventListener("click", function (e) {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;

    for (let node in coords) {
        const [nx, ny] = coords[node];
        if (Math.hypot(nx - cx, ny - cy) < 15) {
            handleNodeClick(node);
            break;
        }
    }
});

function handleNodeClick(node) {
    if (selected.length === 0) {
        /* If a previous route is shown, clear it first */
        if (currentPath.length > 0) {
            currentPath = [];
            document.getElementById("resultCard").classList.add("hidden");
            document.getElementById("directionsCard").classList.add("hidden");
            document.getElementById("endName").textContent = "Not selected";
            document.getElementById("endName").className  = "node-name unselected";
        }
        selected.push(node);
        lastStart = node;
        document.getElementById("startName").textContent = node;
        document.getElementById("startName").className  = "node-name";
        document.getElementById("clickHint").textContent = "Now click your destination node";
        drawMap();

    } else if (selected.length === 1) {
        if (node === selected[0]) return; /* same node — ignore */

        lastEnd = node;
        document.getElementById("endName").textContent = node;
        document.getElementById("endName").className  = "node-name";
        document.getElementById("clickHint").textContent = "Calculating route…";
        fetchPath(selected[0], node);
        selected = [];
    }
}

/* ═══════════════════════════════════════════
   FETCH PATH
═══════════════════════════════════════════ */
function fetchPath(source, destination) {
    fetch("/find_path", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, destination, mode: currentMode })
    })
    .then(r => r.json())
    .then(data => {
        if (!data.path || data.path.length === 0) {
            document.getElementById("clickHint").textContent = "⚠ No path found between these nodes!";
            return;
        }

        currentPath = data.path;

        /* Update hint */
        const modeTag = currentMode === "fastest" ? "⚡ Fastest" : "📏 Shortest";
        document.getElementById("clickHint").textContent =
            `${modeTag} route found — ${data.path.length} stops`;

        /* Result card */
        document.getElementById("statDistance").textContent = data.distance ?? "∞";
        document.getElementById("statSteps").textContent   = data.steps;
        document.getElementById("statTime").textContent    = data.estimated_time + " min";
        document.getElementById("resultCard").classList.remove("hidden");

        /* Directions */
        renderDirections(data.path);
        document.getElementById("directionsCard").classList.remove("hidden");

        /* Animate */
        animatePath(currentPath);
    })
    .catch(() => {
        document.getElementById("clickHint").textContent = "⚠ Network error. Please try again.";
    });
}

/* ═══════════════════════════════════════════
   RENDER DIRECTIONS
═══════════════════════════════════════════ */
function renderDirections(path) {
    const list = document.getElementById("directionsList");
    list.innerHTML = "";

    path.forEach((node, i) => {
        const el = document.createElement("div");
        el.className = "direction-step";
        el.id = `step-${i}`;

        let badge, text;

        if (i === 0) {
            badge = "▶";
            text  = `<strong>Start</strong> at ${node}`;
        } else if (i === path.length - 1) {
            badge = "★";
            text  = `Arrive at <strong>${node}</strong>`;
        } else {
            badge = i;
            text  = `Continue to <strong>${node}</strong>`;
        }

        el.innerHTML = `
            <div class="step-badge">${badge}</div>
            <div class="step-text">${text}</div>
        `;
        list.appendChild(el);
    });
}

/* ─── Highlight active direction step ─── */
function highlightStep(i) {
    document.querySelectorAll(".direction-step").forEach((el, idx) => {
        el.classList.toggle("active", idx === i);
    });
    const active = document.getElementById(`step-${i}`);
    if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ═══════════════════════════════════════════
   ANIMATE PATH
═══════════════════════════════════════════ */
function animatePath(path) {
    let i = 0;

    function step() {
        drawMap(path.slice(0, i + 2));
        highlightStep(i);

        if (i < path.length - 1) {
            const [x1, y1] = coords[path[i]];
            const [x2, y2] = coords[path[i + 1]];
            let progress = 0;

            function moveDot() {
                drawMap(path.slice(0, i + 2));
                highlightStep(i);

                const x = x1 + (x2 - x1) * progress;
                const y = y1 + (y2 - y1) * progress;

                /* Glowing moving dot */
                ctx.save();
                ctx.shadowBlur  = 18;
                ctx.shadowColor = "rgba(6,182,212,0.9)";
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = "#06b6d4";
                ctx.fill();
                ctx.restore();

                progress += 0.045;

                if (progress <= 1) {
                    requestAnimationFrame(moveDot);
                } else {
                    i++;
                    if (i < path.length - 1) {
                        setTimeout(step, 60);
                    } else {
                        /* Final state */
                        drawMap(path);
                        highlightStep(path.length - 1);
                        document.getElementById("clickHint").textContent =
                            "Route complete ✓ — Click any node to plan another";
                    }
                }
            }

            moveDot();
        }
    }

    step();
}