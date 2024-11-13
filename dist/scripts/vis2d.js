import { calculateRange, plot2DShape, animate2DTransformation, calculate2DTransformedCoordinates } from "./helper.js";

const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

// Buttons event listeners
document.querySelectorAll('.back_button').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = `material.html?type=${type}`;
    });
});

// Points add and remove functionality
let pointCount = 3;  // Initial points count (for the letter)

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
let transformedPoints = calculate2DTransformedCoordinates(originalPoints, type, getCalculationValues());

// Initial plot with initial range
const padding = 1;
const { xRange, yRange } = calculateRange(originalPoints, [], padding);
plot2DShape(originalPoints, plot_area, 'blue', false, xRange, yRange);

// Button event listeners
document.getElementById('plot_button').addEventListener('click', () => {
    // Recalculate transformed points
    originalPoints = getOriginalShapeCoordinates();
    transformedPoints = calculate2DTransformedCoordinates(originalPoints, type, getCalculationValues());

    plot2DShape(originalPoints, plot_area, 'blue', false, xRange, yRange);
});

document.getElementById('animate_button').addEventListener('click', () => {
    // Recalculate transformed points
    transformedPoints = calculate2DTransformedCoordinates(originalPoints, type, getCalculationValues());

    // Get the values for the transformation
    const values = {
        axis: document.querySelector('input[name="axis-radio"]:checked').value,
        k: parseFloat(document.getElementById('value_reflection_k').value),
        degree: parseFloat(document.getElementById('value_rotation_degree').value)
    }

    animate2DTransformation(originalPoints, transformedPoints, plot_area, type, values);
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
    pointDiv.className = 'grid grid-cols-5 gap-4 w-full items-center';

    pointDiv.innerHTML = `
        <h1 class="text-xl font-body font-bold text-violet-600 drop-shadow-lg col-span-1 text-center">${String.fromCharCode(65 + pointCount - 1)}</h1>
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_x" type="number" class="input col-span-2" placeholder="x" value="0">
        <input id="point_${String.fromCharCode(97 + pointCount - 1)}_y" type="number" class="input col-span-2" placeholder="y" value="0">
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
        points.push({x, y});
    }

    // Add the first point to the end of the array to close the shape
    points.push(points[0]);

    return points;
}

function getCalculationValues() {
    return {
        translation: {
            x: parseFloat(document.getElementById('value_translation_x').value),
            y: parseFloat(document.getElementById('value_translation_y').value)
        },
        dilatation: {
            k: parseFloat(document.getElementById('value_dilatation_k').value)
        },
        rotation: {
            degree: parseFloat(document.getElementById('value_rotation_degree').value)
        },
        reflection: {
            axis: document.querySelector('input[name="axis-radio"]:checked').value,
            k: parseFloat(document.getElementById('value_reflection_k').value)
        }
    }
}