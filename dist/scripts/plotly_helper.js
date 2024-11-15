/*
    ========================
    === PLOTLY FUNCTIONS ===
    ========================
 */

export function calculateRange(originalPoints, transformedPoints = [], padding) {
    const xValues = originalPoints.map(point => point.x).concat(transformedPoints.map(point => point.x));
    const yValues = originalPoints.map(point => point.y).concat(transformedPoints.map(point => point.y));
    const zValues = originalPoints[0].z !== undefined ? originalPoints.map(point => point.z).concat(transformedPoints.map(point => point.z)) : [];

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xMargin = (xMax - xMin) * padding;
    const yMargin = (yMax - yMin) * padding;

    const range = {
        xRange: [xMin - xMargin, xMax + xMargin],
        yRange: [yMin - yMargin, yMax + yMargin]
    };

    if (zValues.length > 0) {
        const zMin = Math.min(...zValues);
        const zMax = Math.max(...zValues);
        const zMargin = (zMax - zMin) * padding;
        range.zRange = [zMin - zMargin, zMax + zMargin];
    }

    return range;
}

/*
    ========================
    ===== 2D FUNCTIONS =====
    ========================
 */

export function calculate2DTransformedCoordinates(points, type, values) {
    let k;

    switch (type) {
        case 'translasi':
            return points.map(point => ({
                x: point.x + values.translation.x,
                y: point.y + values.translation.y
            }));
        case 'dilatasi':
            k = values.dilatation.k;
            return points.map(point => ({
                x: point.x * k,
                y: point.y * k
            }));
        case 'rotasi':
            const degree = values.rotation.degree;
            const radian = degree * (Math.PI / 180);
            return points.map(point => ({
                x: point.x * Math.cos(radian) - point.y * Math.sin(radian),
                y: point.x * Math.sin(radian) + point.y * Math.cos(radian)
            }));
        case 'refleksi':
            const axis = values.reflection.axis;
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
                        k = values.reflection.k;
                        return {x: point.x, y: 2 * k - point.y};
                    case 'line-x-k':
                        k = values.reflection.k;
                        return {x: 2 * k - point.x, y: point.y};
                }
            });
    }
}

export function plot2DShape(points, plotArea, color = 'blue', addToPlot, xRange, yRange, autoDtick) {
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
            range: xRange,
            dtick: autoDtick ? undefined : 1
        },
        yaxis: {
            range: yRange,
            dtick: autoDtick ? undefined : 1,
            scaleanchor: 'x'
        }
    };

    if (addToPlot) {
        Plotly.addTraces(plotArea, trace);
    } else {
        Plotly.newPlot(plotArea, [trace], layout, {responsive: true});
    }
}

export function animate2DTransformation(originalPoints, transformedPoints, plotArea, type, values, autoDtick = false) {
    // Calculate range with padding, so the shape is not on the edge of the plot
    const padding = 0.5;
    const { xRange, yRange } = calculateRange(originalPoints, transformedPoints, padding);

    plot2DShape(originalPoints, plotArea, 'blue', false, xRange, yRange, autoDtick); // Re-plot the entire thing cause plotly is annoying
    plot2DShape(originalPoints, plotArea, 'blue', true, null, null, autoDtick); // To keep the original shape while animating

    // Plot the required line for reflection transformations
    // This is not properly implemented, but it works for the current use case
    if (type === 'refleksi') {
        const axis = values.reflection.axis;
        switch (axis) {
            case 'line-y-x':
                plotLine(plotArea, xRange, xRange); // y = x
                break;
            case 'line-y-neg-x':
                plotLine(plotArea, xRange, xRange.map(x => -x)); // y = -x
                break;
            case 'line-y-k':
                const kY = values.reflection.k;
                plotLine(plotArea, xRange, Array(xRange.length).fill(kY)); // y = k
                break;
            case 'line-x-k':
                const kX = values.reflection.k;
                plotLine(plotArea, Array(yRange.length).fill(kX), yRange); // x = k
                break;
        }
    }

    // Frame generation for animation
    let frames = [];
    let duration = 0;

    if (type === 'rotasi') {
        const numFrames = 60; // Number of frames for smooth animation
        duration = 30;

        const degree = values.rotation.degree;
        const radian = degree * (Math.PI / 180);

        for (let i = 0; i <= numFrames; i++) {
            const intermediateRadian = (radian / numFrames) * i;
            const intermediatePoints = originalPoints.map(point => ({
                x: point.x * Math.cos(intermediateRadian) - point.y * Math.sin(intermediateRadian),
                y: point.x * Math.sin(intermediateRadian) + point.y * Math.cos(intermediateRadian)
            }));

            frames.push({
                data: [{
                    x: intermediatePoints.map(point => point.x),
                    y: intermediatePoints.map(point => point.y),
                    line: { color: 'red' }
                }]
            });
        }
    } else {
        duration = 500;
        frames = [
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
    }

    Plotly.animate(plotArea, frames, {
        transition: { duration: duration },
        frame: { duration: duration, redraw: true }
    }).then(() => {
        // After animation, add the transformed shape in red
        plot2DShape(transformedPoints, plotArea, 'red', true, null, null, autoDtick);
    });
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

/*
    ========================
    ===== 3D FUNCTIONS =====
    ========================
 */

export function calculate3DTransformedCoordinates(points, type, values) {
    let k;

    switch (type) {
        case 'translasi':
            return points.map(point => ({
                x: point.x + values.translation.x,
                y: point.y + values.translation.y,
                z: point.z + values.translation.z
            }));
        case 'dilatasi':
            k = values.dilatation.k;
            return points.map(point => ({
                x: point.x * k,
                y: point.y * k,
                z: point.z * k
            }));
        case 'rotasi':
            const degree = values.rotation.degree;
            const radian = degree * (Math.PI / 180);
            const axis = values.rotation.axis;
            return points.map(point => {
                const cosTheta = Math.cos(radian);
                const sinTheta = Math.sin(radian);
                switch (axis) {
                    case 'radio_x_axis':
                        return {
                            x: point.x,
                            y: point.y * cosTheta - point.z * sinTheta,
                            z: point.y * sinTheta + point.z * cosTheta
                        };
                    case 'radio_y_axis':
                        return {
                            x: point.x * cosTheta + point.z * sinTheta,
                            y: point.y,
                            z: -point.x * sinTheta + point.z * cosTheta
                        };
                    case 'radio_z_axis':
                        return {
                            x: point.x * cosTheta - point.y * sinTheta,
                            y: point.x * sinTheta + point.y * cosTheta,
                            z: point.z
                        };
                }
            });
        case 'refleksi':
            const reflectionAxis = values.reflection.axis;
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

export function generateMeshDataFromPoints(points) {
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

export function plot3DShape(meshData, plotArea, color = 'cyan', addToPlot = false, xRange = null, yRange = null, zRange = null) {
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
            color: 'blue',
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
            color: 'green',
            width: 5
        },
        name: 'Sumbu Z'
    };

    const labels = meshData['x'].slice(0, -1).map((_, i) => String.fromCharCode(65 + i)); // Generate labels A, B, C...

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
            size: 1,
            color: 'black'
        },
        showlegend: false
    };


    const layout = {
        margin: {t: 0, l: 30, r: 30, b: 30},
        scene: {
            xaxis: {dtick: 1, range: xRange, scaleanchor: 'x', scaleratio: 1},
            yaxis: {dtick: 1, range: yRange, scaleanchor: 'x', scaleratio: 1},
            zaxis: {dtick: 1, range: zRange, scaleanchor: 'x', scaleratio: 1},
            camera: {eye:{x: 0, y: -1.5, z: 1}}
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

export function animate3DTransformation(originalPoints, originalMesh, transformedPoints, transformedMesh, plotArea, type, values) {
    // Calculate range with padding, so the shape is not on the edge of the plot
    const padding = 1;
    const {xRange, yRange, zRange} = calculateRange(originalPoints, transformedPoints, padding);

    plot3DShape(originalMesh, plotArea, 'cyan', false, xRange, yRange, zRange); // Re-plot the entire thing cause plotly is annoying
    plot3DShape(originalMesh, plotArea, 'cyan', true, xRange, yRange, zRange); // To keep the original shape while animating

    // Define the number of frames for smooth animation
    const numFrames = 60;
    const frames = [];

    if (type === 'rotasi') {
        const degree = values.degree;
        const radian = degree * (Math.PI / 180);
        const axis = values.axis;

        for (let i = 0; i <= numFrames; i++) {
            const t = i / numFrames;
            const intermediateRadian = radian * t;
            const cosTheta = Math.cos(intermediateRadian);
            const sinTheta = Math.sin(intermediateRadian);

            const interpolatedPoints = originalPoints.map(point => {
                switch (axis) {
                    case 'radio_x_axis':
                        return {
                            x: point.x,
                            y: point.y * cosTheta - point.z * sinTheta,
                            z: point.y * sinTheta + point.z * cosTheta
                        };
                    case 'radio_y_axis':
                        return {
                            x: point.x * cosTheta + point.z * sinTheta,
                            y: point.y,
                            z: -point.x * sinTheta + point.z * cosTheta
                        };
                    case 'radio_z_axis':
                        return {
                            x: point.x * cosTheta - point.y * sinTheta,
                            y: point.x * sinTheta + point.y * cosTheta,
                            z: point.z
                        };
                }
            });

            const interpolatedMesh = generateMeshDataFromPoints(interpolatedPoints);

            frames.push({
                data: [{
                    type: 'mesh3d',
                    x: interpolatedMesh.x,
                    y: interpolatedMesh.y,
                    z: interpolatedMesh.z,
                    i: originalMesh.i,
                    j: originalMesh.j,
                    k: originalMesh.k,
                    opacity: 1,
                    color: 'orange',
                    flatshading: true
                }]
            });
        }
    } else {
        for (let i = 0; i <= numFrames; i++) {
            const t = i / numFrames;

            const interpolatedX = originalMesh.x.map((x, idx) => x + t * (transformedMesh.x[idx] - x));
            const interpolatedY = originalMesh.y.map((y, idx) => y + t * (transformedMesh.y[idx] - y));
            const interpolatedZ = originalMesh.z.map((z, idx) => z + t * (transformedMesh.z[idx] - z));


            frames.push({
                data: [{
                    type: 'mesh3d',
                    x: interpolatedX,
                    y: interpolatedY,
                    z: interpolatedZ,
                    i: originalMesh.i,
                    j: originalMesh.j,
                    k: originalMesh.k,
                    opacity: 1,
                    color: 'orange',
                    flatshading: true
                }]
            });
        }
    }

    Plotly.animate(plotArea, frames, {
        transition: {duration: 50},
        frame: {duration: 50, redraw: true}
    }).then(() => {
        // After animation completes, plot the final transformed shape in red
        plot3DShape(transformedMesh, plotArea, 'orange', true, xRange, yRange, zRange);
    });
}