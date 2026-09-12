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
  },
  {
    topic: "RIEAM",
    subtopic: "Balões",
    path: "questions/RIEAM/Baloes/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Generalidades",
    path: "questions/Navegacao/Generalidades/questions.json"
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

  const baloes = questions
    .filter(q => q.subtopic === "Balões")
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const generalidades = questions
    .filter(q => q.subtopic === "Generalidades")
    .sort(() => Math.random() - 0.5)
    .slice(0, 1);

  examQuestions = [
    ...abalroamentos,
    ...luzes,
    ...baloes,
    ...generalidades
  ];

  // Mix all 8 questions together
  examQuestions.sort(() => Math.random() - 0.5);

  currentQuestionIndex = 0;
  score = 0;

  document.getElementById("submit-button").style.display = "";

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

  // Show Submit Answer only for multiple-choice questions
  if (currentQuestion.type === "multiple_choice") {
    document.getElementById("submit-button").style.display = "";
  } else {
    document.getElementById("submit-button").style.display = "none";
  }
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

  const modelAnswer = document.createElement("div");
  modelAnswer.id = "model-answer";
  modelAnswer.innerHTML = `
    <p><strong>Model answer:</strong></p>
    <p>${currentQuestion.correct_answer}</p>
  `;

  container.appendChild(modelAnswer);

  const markingContainer = document.createElement("div");
  markingContainer.id = "marking-container";

  const correctButton = document.createElement("button");
  correctButton.textContent = "Correct";
  correctButton.type = "button";

  const wrongButton = document.createElement("button");
  wrongButton.textContent = "Wrong";
  wrongButton.type = "button";

  correctButton.addEventListener("click", () => {
    const points =
      currentQuestion.topic === "Navegacao" ? 0.3 : 0.5;

    score += points;
    currentQuestion.wasCorrect = true;

    goToNextQuestion();
  });

  wrongButton.addEventListener("click", () => {
    currentQuestion.wasCorrect = false;

    goToNextQuestion();
  });

  markingContainer.appendChild(correctButton);
  markingContainer.appendChild(wrongButton);

  container.appendChild(markingContainer);

  document.getElementById("written-answer").disabled = true;

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

  // Written questions are handled by the Reveal Answer button
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
    const points =
      currentQuestion.topic === "Navegacao" ? 0.3 : 0.5;

    score += points;
    currentQuestion.wasCorrect = true;

    result.textContent = `Correct! +${points}`;
  } else {
    currentQuestion.wasCorrect = false;

    result.textContent =
      `Incorrect. Correct answer: ${currentQuestion.correct_answer}`;
  }

  setTimeout(() => {
    goToNextQuestion();
  }, 1500);
}



function showFinalScore() {
  // Calculate scores by topic
  let rieamScore = 0;
  let navegacaoScore = 0;

  examQuestions.forEach(question => {
    if (question.wasCorrect) {
      if (question.topic === "RIEAM") {
        rieamScore += 0.5;
      } else if (question.topic === "Navegacao") {
        navegacaoScore += 0.3;
      }
    }
  });

  document.getElementById("topic").textContent = "";
  document.getElementById("subtopic").textContent = "";
  document.getElementById("question-number").textContent = "";

  document.getElementById("question").textContent =
    "Exam complete!";

  document.getElementById("image-container").innerHTML = "";
  document.getElementById("answers-container").innerHTML = "";

  document.getElementById("result").innerHTML = `
    <p><strong>RIEAM:</strong> ${rieamScore.toFixed(1)} / 3.5</p>
    <p><strong>Navegacao:</strong> ${navegacaoScore.toFixed(1)} / 0.3</p>
    <p><strong>Total:</strong> ${score.toFixed(1)} / 3.8</p>
  `;

  // Hide the Submit Answer button
  document.getElementById("submit-button").style.display = "none";

  // Create Retake Exam button
  const retakeButton = document.createElement("button");
  retakeButton.id = "retake-button";
  retakeButton.textContent = "Retake Exam";
  retakeButton.type = "button";

  retakeButton.addEventListener("click", retakeExam);

  document.getElementById("answers-container").appendChild(retakeButton);
}




document
  .getElementById("submit-button")
  .addEventListener("click", checkAnswer);

loadQuestions();
