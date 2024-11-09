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

// Plot and animation event listeners
// Variables
const plot_area = document.getElementById('plot_area');
let originalPoints = getOriginalShapeCoordinates();
let transformedPoints = calculateTransformedCoordinates(originalPoints, type);
let originalMesh = generateMeshDataFromPoints(originalPoints)
let transformedMesh = generateMeshDataFromPoints(transformedPoints)

// Initial plot with initial range
const padding = 1;
const {xRange, yRange, zRange} = calculateRange(originalPoints, [], padding);
plotShape(originalMesh, plot_area, 'blue', false, xRange, yRange, zRange);

// Button event listeners
document.getElementById('plot_button').addEventListener('click', () => {
    // Recalculate transformed points
    originalPoints = getOriginalShapeCoordinates();
    transformedPoints = calculateTransformedCoordinates(originalPoints, type);
    originalMesh = generateMeshDataFromPoints(originalPoints)
    transformedMesh = generateMeshDataFromPoints(transformedPoints)

    plotShape(originalMesh, plot_area, 'blue', false, xRange, yRange, zRange);
});

document.getElementById('animate_button').addEventListener('click', () => {
    animateTransformation(originalPoints,originalMesh, transformedPoints, transformedMesh, plot_area);
});

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

// PLOTLY functions
function getOriginalShapeCoordinates() {
    const points = [];
    for (let i = 0; i < pointCount; i++) {
        const x = parseFloat(document.getElementById(`point_${String.fromCharCode(97 + i)}_x`).value);
        const y = parseFloat(document.getElementById(`point_${String.fromCharCode(97 + i)}_y`).value);
        const z = parseFloat(document.getElementById(`point_${String.fromCharCode(97 + i)}_z`).value);
        points.push({x, y, z});
    }

    // Add the first point to the end of the array to close the shape
    points.push(points[0]);

    return points;
}

function calculateTransformedCoordinates(points, type) {
    let k;

    // TODO: Fix rotasi and refleksi
    switch (type) {
        case 'translasi':
            return points.map(point => ({
                x: point.x + parseFloat(document.getElementById('value_translation_x').value),
                y: point.y + parseFloat(document.getElementById('value_translation_y').value),
                z: point.z + parseFloat(document.getElementById('value_translation_z').value)
            }));
        case 'dilatasi':
            k = parseFloat(document.getElementById('value_dilatation_k').value);
            return points.map(point => ({
                x: point.x * k,
                y: point.y * k,
                z: point.z * k
            }));
        case 'rotasi':
            const degree = parseFloat(document.getElementById('value_rotation_degree').value);
            const radian = degree * (Math.PI / 180);
            const axis = document.querySelector('input[name="rotation-radio"]:checked').id;
            return points.map(point => {
                switch (axis) {
                    case 'radio_x_axis':
                        return {
                            x: point.x,
                            y: point.y * Math.cos(radian) - point.z * Math.sin(radian),
                            z: point.y * Math.sin(radian) + point.z * Math.cos(radian)
                        };
                    case 'radio_y_axis':
                        return {
                            x: point.x * Math.cos(radian) + point.z * Math.sin(radian),
                            y: point.y,
                            z: -point.x * Math.sin(radian) + point.z * Math.cos(radian)
                        };
                    case 'radio_z_axis':
                        return {
                            x: point.x * Math.cos(radian) - point.y * Math.sin(radian),
                            y: point.x * Math.sin(radian) + point.y * Math.cos(radian),
                            z: point.z
                        };
                }
            });
        case 'refleksi':
            const reflectionAxis = document.querySelector('input[name="reflection-radio"]:checked').id;
            return points.map(point => {
                switch (reflectionAxis) {
                    case 'radio_xy_plane':
                        return {x: point.x, y: point.y, z: -point.z};
                    case 'radio_yz_plane':
                        return {x: -point.x, y: point.y, z: point.z};
                    case 'radio_zx_plane':
                        return {x: point.x, y: -point.y, z: point.z};
                }
            });
    }
}

function generateMeshDataFromPoints(points) {
    // Separate x, y, z coordinates
    const x = points.map(p => p.x);
    const y = points.map(p => p.y);
    const z = points.map(p => p.z);

    // Simple edge/face generation: Convex hull calculation (this is basic and not robust for all shapes)
    // Here, we assume a set of basic edges based on convex hull assumption
    // Alternatively, you could use a 3D convex hull library like Quickhull for better results
    let faces = [];

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            for (let k = j + 1; k < points.length; k++) {
                faces.push([i, j, k]);
            }
        }
    }

    // Flatten the edges into i, j, k arrays for Plotly
    const i = faces.map(f => f[0]);
    const j = faces.map(f => f[1]);
    const k = faces.map(f => f[2]);

    return {
        x: x,
        y: y,
        z: z,
        i: i,
        j: j,
        k: k
    };
}

function calculateRange(originalPoints, transformedPoints = [], padding) {
    const xValues = originalPoints.map(point => point.x).concat(transformedPoints.map(point => point.x));
    const yValues = originalPoints.map(point => point.y).concat(transformedPoints.map(point => point.y));
    const zValues = originalPoints.map(point => point.z).concat(transformedPoints.map(point => point.z));

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    const zMin = Math.min(...zValues);
    const zMax = Math.max(...zValues);

    const xMargin = (xMax - xMin) * padding;
    const yMargin = (yMax - yMin) * padding;
    const zMargin = (zMax - zMin) * padding;

    return {
        xRange: [xMin - xMargin, xMax + xMargin],
        yRange: [yMin - yMargin, yMax + yMargin],
        zRange: [zMin - zMargin, zMax + zMargin]
    };
}

function plotShape(meshData, plotArea, color = 'blue', addToPlot = false, xRange = null, yRange = null, zRange = null) {
    const trace = {
        type: 'mesh3d',
        x: meshData['x'],
        y: meshData['y'],
        z: meshData['z'],
        i: meshData['i'],
        j: meshData['j'],
        k: meshData['k'],
        opacity: 1,
        color: color,
        flatshading: true
    };

    // Axis line with color
    const xAxisTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [xRange[0], xRange[1]],
        y: [0, 0],
        z: [0, 0],
        line: {
            color: 'red',
            width: 5
        },
        name: 'Sumbu X',
    };

    const yAxisTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [0, 0],
        y: [yRange[0], yRange[1]],
        z: [0, 0],
        line: {
            color: 'green',
            width: 5
        },
        name: 'Sumbu Y'
    };

    const zAxisTrace = {
        type: 'scatter3d',
        mode: 'lines',
        x: [0, 0],
        y: [0, 0],
        z: [zRange[0], zRange[1]],
        line: {
            color: 'blue',
            width: 5
        },
        name: 'Sumbu Z'
    };

    const labels = meshData['x'].slice(0, -1).map((_, i) => String.fromCharCode(65 + i)); // Generate labels A, B, C...

    // TODO: decide if to keep
    // Determine the highest and lowest points
    const maxZ = Math.max(...meshData['z']);
    const minZ = Math.min(...meshData['z']);

    const textPositions = meshData['z'].map(z => {
        if (z === maxZ) return 'top center';
        if (z === minZ) return 'bottom center';
        return 'middle center';
    });

    const labelTrace = {
        type: 'scatter3d',
        mode: 'markers+text',
        x: meshData['x'],
        y: meshData['y'],
        z: meshData['z'],
        text: labels,
        textposition: textPositions,
        marker: {
            size: 5,
            color: 'black'
        },
        showlegend: false
    };


    const layout = {
        margin: {t: 0, l: 30, r: 30, b: 30},
        scene: {
            xaxis: {dtick: 1, range: xRange},
            yaxis: {dtick: 1, range: yRange},
            zaxis: {dtick: 1, range: zRange}
        },
        legend: {
            x: 0.1,
            y: 0.9,
            traceorder: 'normal',
            font: {
                family: 'sans-serif',
                size: 12,
                color: '#000'
            },
            bgcolor: 'lightgray',
            bordercolor: 'black',
            borderwidth: 2
        }
    };

    if (addToPlot) {
        const data = [trace, labelTrace];
        Plotly.addTraces(plotArea, data);
    } else {
        const data = [trace, xAxisTrace, yAxisTrace, zAxisTrace, labelTrace];
        Plotly.newPlot(plotArea, data, layout, {responsive: true});
    }
}

function animateTransformation(originalPoints, originalMesh, transformedPoints, transformedMesh, plotArea) {
    // Calculate range with padding, so the shape is not on the edge of the plot
    const padding = 1;
    const { xRange, yRange , zRange} = calculateRange(originalPoints, transformedPoints, padding);

    // TODO: Fix this, it's not animating at all

    plotShape(originalMesh, plotArea, 'blue', false, xRange, yRange, zRange); // Re-plot the entire thing cause plotly is annoying
    plotShape(originalMesh, plotArea, 'blue', true, xRange, yRange, zRange); // To keep the original shape while animating

    const frames = [
        {
            data: [{
                type: 'mesh3d',
                x: originalMesh.x,
                y: originalMesh.y,
                z: originalMesh.z,
                i: originalMesh.i,
                j: originalMesh.j,
                k: originalMesh.k,
                opacity: 1,
                color: 'red',
                flatshading: true
            }]
        },
        {
            data: [{
                type: 'mesh3d',
                x: transformedMesh.x,
                y: transformedMesh.y,
                z: transformedMesh.z,
                i: transformedMesh.i,
                j: transformedMesh.j,
                k: transformedMesh.k,
                opacity: 1,
                color: 'red',
                flatshading: true
            }]
        }
    ];

    Plotly.animate(plotArea, frames, {
        transition: { duration: 500 },
        frame: { duration: 500, redraw: true }
    }).then(() => {
        // After animation, add the transformed shape in red
        plotShape(transformedMesh, plotArea, 'red', true, xRange, yRange, zRange);
    });
}