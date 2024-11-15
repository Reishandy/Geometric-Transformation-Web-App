import { calculate3DTransformedCoordinates, generateMeshDataFromPoints, calculateRange, plot3DShape, animate3DTransformation } from "./plotly_helper.js";

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
let transformedPoints = calculate3DTransformedCoordinates(originalPoints, type, getCalculationValues());
let originalMesh = generateMeshDataFromPoints(originalPoints)
let transformedMesh = generateMeshDataFromPoints(transformedPoints)

// Initial plot with initial range
const padding = 1;
const {xRange, yRange, zRange} = calculateRange(originalPoints, [], padding);
plot3DShape(originalMesh, plot_area, 'cyan', false, xRange, yRange, zRange);

// Button event listeners
document.getElementById('plot_button').addEventListener('click', () => {
    // Recalculate transformed points
    originalPoints = getOriginalShapeCoordinates();
    transformedPoints = calculate3DTransformedCoordinates(originalPoints, type, getCalculationValues());
    originalMesh = generateMeshDataFromPoints(originalPoints);
    transformedMesh = generateMeshDataFromPoints(transformedPoints);

    console.log(originalPoints)

    plot3DShape(originalMesh, plot_area, 'cyan', false, xRange, yRange, zRange);
});

document.getElementById('animate_button').addEventListener('click', () => {
    // Recalculate transformed points
    transformedPoints = calculate3DTransformedCoordinates(originalPoints, type, getCalculationValues());
    transformedMesh = generateMeshDataFromPoints(transformedPoints);

    // Get the values for the transformation
    const values = {
        axis: document.querySelector('input[name="rotation-radio"]:checked').id,
        degree: parseFloat(document.getElementById('value_rotation_degree').value)
    }

    animate3DTransformation(originalPoints, originalMesh, transformedPoints, transformedMesh, plot_area, type, values);
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
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_z" type="number" class="input col-span-2" placeholder="z" value="0">
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

function getCalculationValues() {
    return {
        translation: {
            x: parseFloat(document.getElementById('value_translation_x').value),
            y: parseFloat(document.getElementById('value_translation_y').value),
            z: parseFloat(document.getElementById('value_translation_z').value)
        },
        dilatation: {
            k: parseFloat(document.getElementById('value_dilatation_k').value)
        },
        rotation: {
            degree: parseFloat(document.getElementById('value_rotation_degree').value),
            axis: document.querySelector('input[name="rotation-radio"]:checked').id
        },
        reflection: {
            axis: document.querySelector('input[name="reflection-radio"]:checked').id
        }
    };
}