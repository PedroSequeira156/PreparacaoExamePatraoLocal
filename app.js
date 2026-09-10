// Question banks are organised by topic/subtopic.
// Add another entry here when you create a new question-bank folder.

const QUESTION_BANKS = [
  {
    topic: "RIEAM",
    subtopic: "Abalroamentos",
    path: "questions/RIEAM/Abalroamentos/questions.json"
  }
];

let questions = [];
let currentQuestion = null;

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

    showRandomQuestion();
  } catch (error) {
    console.error(error);
    document.getElementById("question").textContent =
      "Could not load the questions.";
  }
}

function showRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];

  document.getElementById("topic").textContent = currentQuestion.topic;
  document.getElementById("subtopic").textContent = currentQuestion.subtopic;
  document.getElementById("question-number").textContent =
    `Q${String(currentQuestion.id).padStart(2, "0")}`;
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
  }
}

function checkAnswer() {
  if (!currentQuestion) return;

  let userAnswer = "";

  if (currentQuestion.type === "multiple_choice") {
    const selected = document.querySelector(
      'input[name="answer"]:checked'
    );

    if (!selected) {
      document.getElementById("result").textContent =
        "Please select an answer.";
      return;
    }

    userAnswer = selected.value;
  } else {
    userAnswer = document.getElementById("written-answer").value.trim();

    if (!userAnswer) {
      document.getElementById("result").textContent =
        "Please enter an answer.";
      return;
    }
  }

  const result = document.getElementById("result");

  if (currentQuestion.type === "multiple_choice") {
    if (
      userAnswer.toLowerCase() ===
      currentQuestion.correct_answer.toLowerCase()
    ) {
      result.textContent = "Correct!";
    } else {
      result.textContent =
        `Incorrect. Correct answer: ${currentQuestion.correct_answer}`;
    }
  } else {
    result.textContent =
      `Model answer: ${currentQuestion.correct_answer}`;
  }
}

document
  .getElementById("submit-button")
  .addEventListener("click", checkAnswer);

loadQuestions();
