/*
    ========================
    == EXERCISE FUNCTIONS ==
    ========================
 */

export function generatePoints() {
    // Randomly choose the number of vertices (3 to 6 for valid shapes)
    const numVertices = Math.floor(Math.random() * 4) + 3;

    // Generate points for a valid 2d shape
    const points = [];
    const radius = Math.random() * 3 + 2; // Random radius between 2 and 5
    const angleStep = (2 * Math.PI) / numVertices;

    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        points.push({ x, y });
    }

    // Randomly position the shape within the canvas (-10 to 10 range)
    const offsetX = Math.floor(Math.random() * 21) - 10;
    const offsetY = Math.floor(Math.random() * 21) - 10;

    // Apply the offset to all points
    const shiftedPoints = points.map(point => ({
        x: point.x + offsetX,
        y: point.y + offsetY,
    }));

    // Add the first point to the end of the array to close the shape
    shiftedPoints.push(shiftedPoints[0]);

    return shiftedPoints;
}


export function selectRandomTransformation() {
    const transformations = ['translasi', 'dilatasi', 'rotasi', 'refleksi'];
    const randomIndex = Math.floor(Math.random() * transformations.length);

    switch (randomIndex) {
        case 0:
            return {
                type: 'translasi',
                values: {
                    translation: {
                        x: Math.floor(Math.random() * 21) - 10,
                        y: Math.floor(Math.random() * 21) - 10
                    }
                }
            };
        case 1:
            return {
                type: 'dilatasi',
                values: {
                    dilatation: {
                        // between 2 and 5
                        k: Math.floor(Math.random() * 4) + 2
                    }
                }
            };
        case 2:
            return {
                type: 'rotasi',
                values: {
                    rotation: {
                        degree: Math.floor(Math.random() * 361)
                    }
                }
            };
        case 3:
            return {
                type: 'refleksi',
                values: {
                    reflection: {
                        axis: selectReflectionType(),
                        k: Math.floor(Math.random() * 21) - 10
                    }
                }
            };
    }
}

function selectReflectionType() {
    const reflectionTypes = ['origin', 'x-axis', 'y-axis', 'line-y-x', 'line-y-neg-x', 'line-y-k', 'line-x-k'];
    const randomIndex = Math.floor(Math.random() * reflectionTypes.length);
    return reflectionTypes[randomIndex];
}