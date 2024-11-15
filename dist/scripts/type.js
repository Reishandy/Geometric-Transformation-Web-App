import {generatePoints, selectRandomTransformation} from "./exercise_helper.js";
import {animate2DTransformation, calculate2DTransformedCoordinates} from "./plotly_helper.js";

// Back button event listener
document.querySelectorAll('.back_button').forEach(button => {
    button.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

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
    // Check if the exercise is done
    checkDone();

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

function checkDone() {
    // Redirection to the results page if all exercises are done
    if (currentExerciseIndex == exerciseCount) { // Needs to be == instead of === because of the type difference
        // Save the results to the local storage
        localStorage.setItem('results', JSON.stringify(results));

        // Clear the variables
        currentExerciseIndex = 0;
        exercises = [];
        results = [];

        // Redirect to the results page, without history
        window.location.replace('result.html');
    }
}