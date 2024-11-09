const urlParams = new URLSearchParams(window.location.search);
const type = urlParams.get('type');

// Buttons event listeners
document.querySelectorAll('.back_button').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = `material.html?type=${type}`;
    });
});

// Points add and remove functionality
let pointCount = 3; // Initial points count (to prevent removing all points)

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

// Initial plot with initial range
const padding = 1;
const { xRange, yRange } = calculateRange(originalPoints, [], padding);
plotShape(originalPoints, plot_area, 'blue', false, xRange, yRange);

document.getElementById('plot_button').addEventListener('click', () => {
    // Recalculate transformed points
    originalPoints = getOriginalShapeCoordinates();
    transformedPoints = calculateTransformedCoordinates(originalPoints, type);
    
    plotShape(originalPoints, plot_area, 'blue', false, xRange, yRange);
});

document.getElementById('animate_button').addEventListener('click', () => {
    // Recalculate transformed points
    originalPoints = getOriginalShapeCoordinates();
    transformedPoints = calculateTransformedCoordinates(originalPoints, type);
    
    animateTransformation(originalPoints, transformedPoints, plot_area);
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

// PLOTLY functions
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

function calculateRange(originalPoints, transformedPoints = [], padding) {
    const xValues = originalPoints.map(point => point.x).concat(transformedPoints.map(point => point.x));
    const yValues = originalPoints.map(point => point.y).concat(transformedPoints.map(point => point.y));

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xMargin = (xMax - xMin) * padding;
    const yMargin = (yMax - yMin) * padding;

    return {
        xRange: [xMin - xMargin, xMax + xMargin],
        yRange: [yMin - yMargin, yMax + yMargin]
    };
}

function plotShape(points, plotArea, color = 'blue', addToPlot = false, xRange = null, yRange = null) {
    const xValues = points.map(point => point.x);
    const yValues = points.map(point => point.y);
    const labels = points.slice(0, -1).map((_, i) => String.fromCharCode(65 + i)); // Generate labels A, B, C...

    const trace = {
        x: xValues,
        y: yValues,
        mode: 'markers+lines+text', // Enable text labels
        type: 'scatter',
        line: { color: color },
        text: labels,
        textposition: 'top left', // Position labels above points
        showlegend: false
    };

    const layout = {
        margin: {t: 0, l: 30, r: 30, b: 30},
        dragmode: 'pan',
        xaxis: {
            dtick: 1,
            range: xRange
        },
        yaxis: {
            dtick: 1,
            scaleanchor: 'x',
            range: yRange
        }
    };

    if (addToPlot) {
        Plotly.addTraces(plotArea, trace);
    } else {
        Plotly.newPlot(plotArea, [trace], layout, {responsive: true});
    }
}

function plotLine(plotArea, xValues, yValues, color = 'green') {
    const extend = 1.5; // Extend the line to the edge of the plot
    xValues = [xValues[0] - (xValues[1] - xValues[0]) * extend, xValues[1] + (xValues[1] - xValues[0]) * extend];
    yValues = [yValues[0] - (yValues[1] - yValues[0]) * extend, yValues[1] + (yValues[1] - yValues[0]) * extend];

    const trace = {
        x: xValues,
        y: yValues,
        mode: 'lines',
        type: 'scatter',
        line: { color: color },
        showlegend: false
    };

    Plotly.addTraces(plotArea, trace);
}

function animateTransformation(originalPoints, transformedPoints, plotArea) {
    // Calculate range with padding, so the shape is not on the edge of the plot
    const padding = 0.5;
    const { xRange, yRange } = calculateRange(originalPoints, transformedPoints, padding);

    plotShape(originalPoints, plotArea, 'blue', false, xRange, yRange); // Re-plot the entire thing cause plotly is annoying
    plotShape(originalPoints, plotArea, 'blue', true); // To keep the original shape while animating

    // Plot the required line for reflection transformations
    // This is not properly implemented, but it works for the current use case
    if (type === 'refleksi') {
        const axis = document.querySelector('input[name="axis-radio"]:checked').value;
        switch (axis) {
            case 'line-y-x':
                plotLine(plotArea, xRange, xRange); // y = x
                break;
            case 'line-y-neg-x':
                plotLine(plotArea, xRange, xRange.map(x => -x)); // y = -x
                break;
            case 'line-y-k':
                const kY = parseFloat(document.getElementById('value_reflection_k').value);
                plotLine(plotArea, xRange, Array(xRange.length).fill(kY)); // y = k
                break;
            case 'line-x-k':
                const kX = parseFloat(document.getElementById('value_reflection_k').value);
                plotLine(plotArea, Array(yRange.length).fill(kX), yRange); // x = k
                break;
        }
    }

    const frames = [
        {
            data: [{
                x: originalPoints.map(point => point.x),
                y: originalPoints.map(point => point.y),
                line: { color: 'red' } // Set animation color to red
            }]
        },
        {
            data: [{
                x: transformedPoints.map(point => point.x),
                y: transformedPoints.map(point => point.y),
                line: { color: 'red' } // Keep color consistent during animation
            }]
        }
    ];

    Plotly.animate(plotArea, frames, {
        transition: { duration: 500 },
        frame: { duration: 500, redraw: true }
    }).then(() => {
        // After animation, add the transformed shape in red
        plotShape(transformedPoints, plotArea, 'red', true);
    });
}

function calculateTransformedCoordinates(points, type) {
    let k;

    switch (type) {
        case 'translasi':
            return points.map(point => ({
                x: point.x + parseFloat(document.getElementById('value_translation_x').value),
                y: point.y + parseFloat(document.getElementById('value_translation_y').value)
            }));
        case 'dilatasi':
            k = parseFloat(document.getElementById('value_dilatation_k').value);
            return points.map(point => ({
                x: point.x * k,
                y: point.y * k
            }));
        case 'rotasi':
            const degree = parseFloat(document.getElementById('value_rotation_degree').value);
            const radian = degree * (Math.PI / 180);
            return points.map(point => ({
                x: point.x * Math.cos(radian) - point.y * Math.sin(radian),
                y: point.x * Math.sin(radian) + point.y * Math.cos(radian)
            }));
        case 'refleksi':
            const axis = document.querySelector('input[name="axis-radio"]:checked').value;
            return points.map(point => {
                switch (axis) {
                    case 'origin':
                        return {x: -point.x, y: -point.y};
                    case 'x-axis':
                        return {x: point.x, y: -point.y};
                    case 'y-axis':
                        return {x: -point.x, y: point.y};
                    case 'line-y-x':
                        return {x: point.y, y: point.x};
                    case 'line-y-neg-x':
                        return {x: -point.y, y: -point.x};
                    case 'line-y-k':
                        k = parseFloat(document.getElementById('value_reflection_k').value);
                        return {x: point.x, y: 2 * k - point.y};
                    case 'line-x-k':
                        k = parseFloat(document.getElementById('value_reflection_k').value);
                        return {x: 2 * k - point.x, y: point.y};
                }
            });
    }
}