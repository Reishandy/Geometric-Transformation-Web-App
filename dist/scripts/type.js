import {generatePoints, selectRandomTransformation} from "./exercise_helper.js";
import {animate2DTransformation, calculate2DTransformedCoordinates} from "./plotly_helper.js";

// Variables
const plot_area = document.getElementById('plot_area');
let exerciseCount = 10;
let exercises = [];
let currentExerciseIndex = 0;
let CurrentCorrectAnswer;
let results = [];

// Plot variables
let originalPoint, transformedPoints, type, values;

// Button event listeners
document.getElementById('start_button').addEventListener('click', () => {
    document.getElementById('start_screen').classList.add('hidden');
    document.getElementById('exercise_screen').classList.remove('hidden');

    exerciseCount = document.getElementById('exercise_count_input').value;
    document.getElementById('exercise_count').innerText = `${currentExerciseIndex + 1} / ${exerciseCount}`;

    // Generate exercises
    for (let i = 0; i < exerciseCount; i++) {
        const points = generatePoints();
        const transformation = selectRandomTransformation();
        exercises.push({points, transformation});
    }
    displayExercise(currentExerciseIndex);
});

document.getElementById('replay_button').addEventListener('click', () => {
    animate2DTransformation(originalPoint, transformedPoints, plot_area, type, values, true);
});

document.getElementById('translation_answer_button').addEventListener('click', () => {
    const answer = 'translasi' === CurrentCorrectAnswer ? 'Benar' : 'Salah';
    const number = currentExerciseIndex + 1;

    results.push({
        number,
        answer: 'translasi',
        correct: CurrentCorrectAnswer,
        result: answer
    });

    updateExerciseCount();
    displayExercise(currentExerciseIndex);
});

document.getElementById('dilatation_answer_button').addEventListener('click', () => {
    const answer = 'dilatasi' === CurrentCorrectAnswer ? 'Benar' : 'Salah';
    const number = currentExerciseIndex + 1;

    results.push({
        number,
        answer: 'dilatasi',
        correct: CurrentCorrectAnswer,
        result: answer
    });

    updateExerciseCount();
    displayExercise(currentExerciseIndex);
});

document.getElementById('rotation_answer_button').addEventListener('click', () => {
    const answer = 'rotasi' === CurrentCorrectAnswer ? 'Benar' : 'Salah';
    const number = currentExerciseIndex + 1;

    results.push({
        number,
        answer: 'rotasi',
        correct: CurrentCorrectAnswer,
        result: answer
    });

    updateExerciseCount();
    displayExercise(currentExerciseIndex);
});

document.getElementById('reflection_answer_button').addEventListener('click', () => {
    const answer = 'refleksi' === CurrentCorrectAnswer ? 'Benar' : 'Salah';
    const number = currentExerciseIndex + 1;

    results.push({
        number,
        answer: 'refleksi',
        correct: CurrentCorrectAnswer,
        result: answer
    });

    updateExerciseCount();
    displayExercise(currentExerciseIndex);
});

/*
    ========================
    ====== FUNCTIONS =======
    ========================
 */

// Helper functions
function displayExercise(index) {
    // Redirection to the results page if all exercises are done
    if (index === exerciseCount - 1) {
        // TODO: Redirect to the results page

        console.log(results);
        // localStorage.setItem('results', JSON.stringify(results));
        // window.location.href = 'results.html';
    }

    // Get the original points and transformation values
    originalPoint = exercises[index].points;
    type = exercises[index].transformation.type;
    values = exercises[index].transformation.values;
    transformedPoints = calculate2DTransformedCoordinates(originalPoint, type, values);

    animate2DTransformation(originalPoint, transformedPoints, plot_area, type, values, true);

    // Update the correct answer
    CurrentCorrectAnswer = type;
}

function updateExerciseCount() {
    currentExerciseIndex += 1;
    document.getElementById('exercise_count').innerText = `${currentExerciseIndex + 1} / ${exerciseCount}`;
}