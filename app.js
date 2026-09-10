let questions = [];
let currentQuestion = null;

// Load questions from questions.json
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        startExam();
    })
    .catch(error => {
        console.error("Error loading questions:", error);
    });


// Start the exam
function startExam() {

    // Select a random question
    const randomIndex = Math.floor(Math.random() * questions.length);

    currentQuestion = questions[randomIndex];

    displayQuestion(currentQuestion);
}


// Display the question
function displayQuestion(question) {

    document.getElementById("topic").textContent =
        "Topic: " + question.topic;

    document.getElementById("subtopic").textContent =
        "Sub-topic: " + question.subtopic;

    document.getElementById("question").textContent =
        question.question;


    // Display image if one exists
    const imageContainer =
        document.getElementById("question-image-container");

    imageContainer.innerHTML = "";

    if (question.image) {

        const image = document.createElement("img");

        image.src = question.image;
        image.className = "question-image";

        imageContainer.appendChild(image);
    }


    // Create answer buttons
    const answersContainer =
        document.getElementById("answers");

    answersContainer.innerHTML = "";

    for (const letter in question.answers) {

        const label = document.createElement("label");

        label.className = "answer";

        label.innerHTML = `
            <input type="radio" name="answer" value="${letter}">
            <span><strong>${letter}</strong> - ${question.answers[letter]}</span>
        `;

        answersContainer.appendChild(label);
    }


    // Clear previous result
    document.getElementById("result").textContent = "";
}


// Submit answer
document.getElementById("submit-button").addEventListener("click", function () {

    const selectedAnswer =
        document.querySelector('input[name="answer"]:checked');

    const result =
        document.getElementById("result");


    if (!selectedAnswer) {

        result.textContent = "Por favor selecione uma resposta.";
        result.className = "warning";

        return;
    }


    if (selectedAnswer.value === currentQuestion.correct_answer) {

        result.textContent = "Correto!";
        result.className = "correct";

    } else {

        result.textContent =
            "Incorreto. A resposta correta é " +
            currentQuestion.correct_answer + ".";

        result.className = "incorrect";
    }

});
