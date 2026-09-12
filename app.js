// Question banks are organised by topic/subtopic.
// Add another entry here when you create a new question-bank folder.

const QUESTION_BANKS = [
  {
    topic: "RIEAM",
    subtopic: "Abalroamentos",
    path: "questions/RIEAM/Abalroamentos/questions.json"
  },
  {
    topic: "RIEAM",
    subtopic: "Luzes",
    path: "questions/RIEAM/Luzes/questions.json"
  }
];

let questions = [];
let examQuestions = [];
let currentQuestion = null;
let currentQuestionIndex = 0;
let score = 0;


async function loadQuestions() {
  try {
    const loadedBanks = await Promise.all(
      QUESTION_BANKS.map(async (bank) => {
        const response = await fetch(bank.path);

        if (!response.ok) {
          throw new Error(`Could not load ${bank.path}`);
        }

        const bankQuestions = await response.json();

        return bankQuestions.map(question => ({
          ...question,
          topic: bank.topic,
          subtopic: bank.subtopic,
          bankPath: bank.path
        }));
      })
    );

    questions = loadedBanks.flat();

    if (questions.length === 0) {
      throw new Error("No questions were found.");
    }

    startExam();
    
  } catch (error) {
    console.error(error);
    document.getElementById("question").textContent =
      "Could not load the questions.";
  }
}


function startExam() {
  const abalroamentos = questions
    .filter(q => q.subtopic === "Abalroamentos")
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const luzes = questions
    .filter(q => q.subtopic === "Luzes")
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  examQuestions = [...abalroamentos, ...luzes];

  // Shuffle the 5 questions so they aren't always
  // 3 Abalroamentos followed by 2 Luzes.
  examQuestions.sort(() => Math.random() - 0.5);

  currentQuestionIndex = 0;
  score = 0;

  showQuestion();
}

function retakeExam() {
  startExam();
}

function showQuestion() {
  currentQuestion = examQuestions[currentQuestionIndex];

  document.getElementById("topic").textContent =
    currentQuestion.topic;

  document.getElementById("subtopic").textContent =
    currentQuestion.subtopic;

  document.getElementById("question-number").textContent =
    `Q${currentQuestionIndex + 1}`;

  document.getElementById("question").textContent =
    currentQuestion.question;

  renderImage();
  renderAnswers();

  document.getElementById("result").textContent = "";
}


function renderImage() {
  const container = document.getElementById("image-container");
  container.innerHTML = "";

  if (!currentQuestion.image) {
    return;
  }

  const image = document.createElement("img");

  // image is relative to the question-bank JSON file.
  const bankFolder = currentQuestion.bankPath.substring(
    0,
    currentQuestion.bankPath.lastIndexOf("/")
  );

  image.src = `${bankFolder}/${currentQuestion.image}`;
  image.alt = `Diagram for question ${currentQuestion.id}`;

  image.onerror = () => {
    container.innerHTML =
      "<p>Image not found. Check the image filename and images folder.</p>";
  };

  container.appendChild(image);
}


function renderAnswers() {
  const container = document.getElementById("answers-container");
  container.innerHTML = "";

  if (currentQuestion.type === "multiple_choice") {

    Object.entries(currentQuestion.answers).forEach(([letter, text]) => {
      const label = document.createElement("label");
      label.className = "answer-option";

      label.innerHTML = `
        <input type="radio" name="answer" value="${letter}">
        <strong>${letter})</strong> ${text}
      `;

      container.appendChild(label);
    });

  } else if (currentQuestion.type === "written") {

    const textarea = document.createElement("textarea");
    textarea.id = "written-answer";
    textarea.placeholder = "Write your answer here...";
    container.appendChild(textarea);

    const revealButton = document.createElement("button");
    revealButton.id = "reveal-button";
    revealButton.textContent = "Reveal answer";
    revealButton.type = "button";

    revealButton.addEventListener("click", revealAnswer);

    container.appendChild(revealButton);
  }
}

function revealAnswer() {
  if (!currentQuestion) return;

  const userAnswer =
    document.getElementById("written-answer").value.trim();

  if (!userAnswer) {
    document.getElementById("result").textContent =
      "Please write your answer first.";
    return;
  }

  const container = document.getElementById("answers-container");

  // Show the model answer
  const modelAnswer = document.createElement("div");
  modelAnswer.id = "model-answer";
  modelAnswer.innerHTML = `
    <p><strong>Model answer:</strong></p>
    <p>${currentQuestion.correct_answer}</p>
  `;

  container.appendChild(modelAnswer);

  // Create self-marking buttons
  const markingContainer = document.createElement("div");
  markingContainer.id = "marking-container";

  const correctButton = document.createElement("button");
  correctButton.textContent = "Correct";
  correctButton.type = "button";

  const wrongButton = document.createElement("button");
  wrongButton.textContent = "Wrong";
  wrongButton.type = "button";

  correctButton.addEventListener("click", () => {
    score += 0.5;
    goToNextQuestion();
  });

  wrongButton.addEventListener("click", () => {
    goToNextQuestion();
  });

  markingContainer.appendChild(correctButton);
  markingContainer.appendChild(wrongButton);

  container.appendChild(markingContainer);

  // Disable the textarea so the answer cannot be changed
  document.getElementById("written-answer").disabled = true;

  // Hide the normal submit button
  document.getElementById("submit-button").style.display = "none";
}

function goToNextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < examQuestions.length) {
    // Show the submit button again
    document.getElementById("submit-button").style.display = "";

    showQuestion();
  } else {
    showFinalScore();
  }
}



function checkAnswer() {
  if (!currentQuestion) return;

  // Written questions use the Reveal Answer button instead
  if (currentQuestion.type === "written") {
    return;
  }

  const selected = document.querySelector(
    'input[name="answer"]:checked'
  );

  if (!selected) {
    document.getElementById("result").textContent =
      "Please select an answer.";
    return;
  }

  const userAnswer = selected.value;
  const result = document.getElementById("result");

  if (
    userAnswer.toLowerCase() ===
    currentQuestion.correct_answer.toLowerCase()
  ) {
    score += 0.5;
    result.textContent = "Correct! +0.5";
  } else {
    result.textContent =
      `Incorrect. Correct answer: ${currentQuestion.correct_answer}`;
  }

  setTimeout(() => {
    goToNextQuestion();
  }, 1500);
}

function showFinalScore() {
  document.getElementById("topic").textContent = "";
  document.getElementById("subtopic").textContent = "";
  document.getElementById("question-number").textContent = "";

  document.getElementById("question").textContent =
    "Exam complete!";

  document.getElementById("image-container").innerHTML = "";
  document.getElementById("answers-container").innerHTML = "";

  document.getElementById("result").textContent =
    `Final score: ${score} / 2.5`;

  // Create retake button
  const retakeButton = document.createElement("button");
  retakeButton.id = "retake-button";
  retakeButton.textContent = "Retake Exam";
  retakeButton.type = "button";

  retakeButton.addEventListener("click", retakeExam);

  document.getElementById("answers-container").appendChild(retakeButton);

  // Hide the normal submit button
  document.getElementById("submit-button").style.display = "none";
}

document
  .getElementById("submit-button")
  .addEventListener("click", checkAnswer);

loadQuestions();
