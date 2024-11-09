const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

// Buttons event listeners
document.querySelectorAll('.back_button').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = `material.html?type=${type}`;
    });
});

// Points add and remove functionality
let pointCount = 8; // Initial points count (for the letter)

document.getElementById('point_add_btn').addEventListener('click', addPoint);
document.getElementById('point_remove_btn').addEventListener('click', removePoint);

// Transformation div hidden functionality
const transformationDivs = {
    'translasi': 'wrapper_translation',
    'dilatasi': 'wrapper_dilatation',
    'rotasi': 'wrapper_rotation',
    'refleksi': 'wrapper_reflection'
};

if (transformationDivs[type]) {
    document.getElementById(transformationDivs[type]).classList.remove('hidden');
}




/*
    ========================
    ====== FUNCTIONS =======
    ========================
 */

// Helper functions
function addPoint() {
    pointCount++;
    const pointDiv = document.createElement('div');
    pointDiv.id = `point_${String.fromCharCode(97 + pointCount - 1)}`;
    pointDiv.className = 'grid grid-cols-7 gap-4 w-full items-center';

    pointDiv.innerHTML = `
        <h1 class="text-xl font-body font-bold text-violet-600 drop-shadow-lg col-span-1 text-center">${String.fromCharCode(65 + pointCount - 1)}</h1>
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_x" type="number" class="input col-span-2" placeholder="x" value="0">
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_y" type="number" class="input col-span-2" placeholder="y" value="0">
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_y" type="number" class="input col-span-2" placeholder="z" value="0">
    `;

    const buttonsDiv = document.querySelector('.grid.grid-cols-2.gap-4.items-center');
    buttonsDiv.parentNode.insertBefore(pointDiv, buttonsDiv);
}

function removePoint() {
    if (pointCount > 1) {
        const pointDiv = document.getElementById(`point_${String.fromCharCode(97 + pointCount - 1)}`);
        pointDiv.parentNode.removeChild(pointDiv);
        pointCount--;
    }
}



















function generateMeshDataFromPoints(points) {
    // Separate x, y, z coordinates
    const x = points.map(p => p[0]);
    const y = points.map(p => p[1]);
    const z = points.map(p => p[2]);

    // Simple edge/face generation: Convex hull calculation (this is basic and not robust for all shapes)
    // Here, we assume a set of basic edges based on convex hull assumption
    // Alternatively, you could use a 3D convex hull library like Quickhull for better results
    let edges = [];
    let faces = [];

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            for (let k = j + 1; k < points.length; k++) {
                edges.push([i, j, k]);
                faces.push([i, j, k]);
            }
        }
    }

    // Flatten the edges into i, j, k arrays for Plotly
    const i = faces.map(f => f[0]);
    const j = faces.map(f => f[1]);
    const k = faces.map(f => f[2]);

    return {
        type: 'mesh3d',
        x: x,
        y: y,
        z: z,
        i: i,
        j: j,
        k: k,
        opacity: 1,
        color: 'cyan',
        flatshading: true
    };
}

// Example user input points (feel free to adjust or extend)
const userPoints = [
    [1, 1, 1],
    [-1, -1, 1],
    [-1, 1, -1],
    [1, -1, -1]
];

// Generate mesh data and plot
const meshData = generateMeshDataFromPoints(userPoints);
Plotly.newPlot('plot_area', [meshData], {});
