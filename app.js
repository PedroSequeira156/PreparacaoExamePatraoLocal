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
    topic: "RIEAM",
    subtopic: "Sinais Sonoros",
    path: "questions/RIEAM/SinaisSonoros/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Generalidades",
    path: "questions/Navegacao/Generalidades/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Agulha Magnetica",
    path: "questions/Navegacao/AgulhaMagnetica/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Balizagem",
    path: "questions/Navegacao/Balizagem/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Azimutes",
    path: "questions/Navegacao/Azimutes/questions.json"
  }
  ,
  {
    topic: "Navegacao",
    subtopic: "Derrotas",
    path: "questions/Navegacao/Derrotas/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "DifLatELong",
    path: "questions/Navegacao/DifLatELong/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Farois",
    path: "questions/Navegacao/Farois/questions.json"
  },
  {
    topic: "Navegacao",
    subtopic: "Rumos e Proas",
    path: "questions/Navegacao/RumosEProas/questions.json"
  },
  {
    topic: "Radiocomunicacoes",
    subtopic: "Radiocomunicacoes",
    path: "questions/Radiocomunicacoes/questions.json"
  }
];

let questions = [];
let examQuestions = [];
let currentQuestion = null;
let currentQuestionIndex = 0;
let score = 0;
let practiceMode = false;


// ===============================
// LOAD QUESTIONS
// ===============================

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

    showTopicSelection();

  } catch (error) {
    console.error(error);

    document.getElementById("question").textContent =
      "Could not load the questions.";
  }
}


// ===============================
// TOPIC SELECTION
// ===============================



function showTopicSelection() {
  document.getElementById("topic").textContent = "";
  document.getElementById("subtopic").textContent = "";
  document.getElementById("question-number").textContent = "";

  document.getElementById("question").textContent =
    "How would you like to practise?";

  document.getElementById("image-container").innerHTML = "";

  const answersContainer =
    document.getElementById("answers-container");

  answersContainer.innerHTML = "";

  document.getElementById("submit-button").style.display = "none";
  document.getElementById("result").textContent = "";


  // ===============================
  // EXAM MODE
  // ===============================

  const examButton = document.createElement("button");

  examButton.textContent = "Exam Mode";
  examButton.type = "button";

  examButton.addEventListener("click", () => {
    showExamTopicSelection();
  });

  answersContainer.appendChild(examButton);


  // ===============================
  // TOPIC PRACTICE
  // ===============================

  const topicButton = document.createElement("button");

  topicButton.textContent = "Topic Practice";
  topicButton.type = "button";

  topicButton.addEventListener("click", () => {
    showPracticeTopicSelection();
  });

  answersContainer.appendChild(topicButton);
}

function showExamTopicSelection() {
  document.getElementById("question").textContent =
    "Choose the topics you want to be examined on:";

  const answersContainer =
    document.getElementById("answers-container");

  answersContainer.innerHTML = "";


  // RIEAM checkbox
  const rieamLabel = document.createElement("label");

  rieamLabel.className = "answer-option";

  rieamLabel.innerHTML = `
    <input type="checkbox" id="rieam-checkbox">
    <strong>RIEAM</strong>
    <span>8 questions</span>
  `;

  answersContainer.appendChild(rieamLabel);


  // Navegacao checkbox
  const navegacaoLabel = document.createElement("label");

  navegacaoLabel.className = "answer-option";

  navegacaoLabel.innerHTML = `
    <input type="checkbox" id="navegacao-checkbox">
    <strong>Navegacao</strong>
    <span>8 questions</span>
  `;

  answersContainer.appendChild(navegacaoLabel);


  // Radiocomunicacoes checkbox
  const radiocomunicacoesLabel = document.createElement("label");
  radiocomunicacoesLabel.className = "answer-option";
  
  radiocomunicacoesLabel.innerHTML = `
    <input type="checkbox" id="radiocomunicacoes-checkbox">
    <strong>Radiocomunicacoes</strong>
    <span>8 questions</span>
  `;
  
  answersContainer.appendChild(radiocomunicacoesLabel);

  // Start button
  const startButton = document.createElement("button");

  startButton.textContent = "Start Exam";
  startButton.type = "button";

  startButton.addEventListener("click", () => {

    const selectedTopics = [];

    if (document.getElementById("rieam-checkbox").checked) {
      selectedTopics.push("RIEAM");
    }

    if (document.getElementById("navegacao-checkbox").checked) {
      selectedTopics.push("Navegacao");
    }

    if (document.getElementById("radiocomunicacoes-checkbox").checked) {
      selectedTopics.push("Radiocomunicacoes");
    }

    if (selectedTopics.length === 0) {
      document.getElementById("result").textContent =
        "Please select at least one topic.";

      return;
    }

    startExam(selectedTopics);
  });

  answersContainer.appendChild(startButton);


  // Back button
  const backButton = document.createElement("button");

  backButton.textContent = "Back";
  backButton.type = "button";

  backButton.addEventListener("click", () => {
    showTopicSelection();
  });

  answersContainer.appendChild(backButton);
}

function showPracticeTopicSelection() {

  document.getElementById("question").textContent =
    "Choose a topic to practise:";

  const answersContainer =
    document.getElementById("answers-container");

  answersContainer.innerHTML = "";


  // Create one button for each topic
  const topics = [...new Set(
    QUESTION_BANKS.map(bank => bank.topic)
  )];


  topics.forEach(topic => {

    const button = document.createElement("button");

    button.textContent = topic;
    button.type = "button";

    button.addEventListener("click", () => {
      showPracticeSubtopicSelection(topic);
    });

    answersContainer.appendChild(button);
  });


  // Back button
  const backButton = document.createElement("button");

  backButton.textContent = "Back";
  backButton.type = "button";

  backButton.addEventListener("click", () => {
    showTopicSelection();
  });

  answersContainer.appendChild(backButton);
}

function showPracticeSubtopicSelection(selectedTopic) {

  document.getElementById("question").textContent =
    `Choose a sub-topic from ${selectedTopic}:`;

  const answersContainer =
    document.getElementById("answers-container");

  answersContainer.innerHTML = "";


  // Find all sub-topics belonging to the selected topic
  const subtopics = QUESTION_BANKS
    .filter(bank => bank.topic === selectedTopic)
    .map(bank => bank.subtopic);


  subtopics.forEach(subtopic => {

    const button = document.createElement("button");

    button.textContent = subtopic;
    button.type = "button";

    button.addEventListener("click", () => {
      startTopicPractice(selectedTopic, subtopic);
    });

    answersContainer.appendChild(button);
  });


  // Back button
  const backButton = document.createElement("button");

  backButton.textContent = "Back";
  backButton.type = "button";

  backButton.addEventListener("click", () => {
    showPracticeTopicSelection();
  });

  answersContainer.appendChild(backButton);
}

function startTopicPractice(selectedTopic, selectedSubtopic) {
  practiceMode = true;
  examQuestions = questions
    .filter(q =>
      q.topic === selectedTopic &&
      q.subtopic === selectedSubtopic
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);


  if (examQuestions.length === 0) {

    document.getElementById("result").textContent =
      "No questions were found for this sub-topic.";

    return;
  }


  currentQuestionIndex = 0;
  score = 0;

  document.getElementById("submit-button").style.display = "";

  showQuestion();
}


// ===============================
// START EXAM
// ===============================

function startExam(selectedTopics) {
  practiceMode = false;
  examQuestions = [];

  // -------------------------------
  // RIEAM
  // -------------------------------

  if (selectedTopics.includes("RIEAM")) {

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

    const sinaisSonoros = questions
      .filter(q => q.subtopic === "Sinais Sonoros")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    examQuestions.push(
      ...abalroamentos,
      ...luzes,
      ...baloes,
      ...sinaisSonoros
    );
  }


  // -------------------------------
  // NAVEGACAO
  // -------------------------------

  if (selectedTopics.includes("Navegacao")) {

    const generalidades = questions
      .filter(q => q.subtopic === "Generalidades")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const agulhaMagnetica = questions
      .filter(q => q.subtopic === "Agulha Magnetica")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);
    
    const balizagem = questions
      .filter(q => q.subtopic === "Balizagem")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const azimutes = questions
      .filter(q => q.subtopic === "Azimutes")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const derrotas = questions
      .filter(q => q.subtopic === "Derrotas")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const difLatELong = questions
      .filter(q => q.subtopic === "DifLatELong")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const farois = questions
      .filter(q => q.subtopic === "Farois")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);

    const rumosEProas = questions
      .filter(q => q.subtopic === "Rumos e Proas")
      .sort(() => Math.random() - 0.5)
      .slice(0, 1);
    
    examQuestions.push(
      ...generalidades,
      ...agulhaMagnetica,
      ...balizagem,
      ...azimutes,
      ...derrotas,
      ...difLatELong,
      ...farois,
      ...rumosEProas
    );
  }

  // -------------------------------
  // RADIOCOMUNICACOES
  // -------------------------------
  
  if (selectedTopics.includes("Radiocomunicacoes")) {
  
    const radiocomunicacoes = questions
      .filter(q =>
        q.topic === "Radiocomunicacoes" &&
        q.subtopic === "Radiocomunicacoes"
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  
    examQuestions.push(
      ...radiocomunicacoes
    );
  }

  // Mix all selected questions together
  examQuestions.sort(() => Math.random() - 0.5);

  currentQuestionIndex = 0;
  score = 0;

  document.getElementById("submit-button").style.display = "";

  showQuestion();
}


// ===============================
// SHOW QUESTION
// ===============================

function showQuestion() {

  currentQuestion = examQuestions[currentQuestionIndex];

  document.getElementById("topic").textContent =
    currentQuestion.topic;

  document.getElementById("subtopic").textContent =
    currentQuestion.subtopic;

  document.getElementById("question-number").textContent =
    `Q${currentQuestionIndex + 1} / ${examQuestions.length}`;

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


// ===============================
// IMAGE
// ===============================

function renderImage() {

  const container =
    document.getElementById("image-container");

  container.innerHTML = "";

  if (!currentQuestion.image) {
    return;
  }

  const image = document.createElement("img");

  const bankFolder = currentQuestion.bankPath.substring(
    0,
    currentQuestion.bankPath.lastIndexOf("/")
  );

  image.src =
    `${bankFolder}/${currentQuestion.image}`;

  image.alt =
    `Diagram for question ${currentQuestion.id}`;

  image.onerror = () => {
    container.innerHTML =
      "<p>Image not found. Check the image filename and images folder.</p>";
  };

  container.appendChild(image);
}


// ===============================
// ANSWERS
// ===============================

function renderAnswers() {

  const container =
    document.getElementById("answers-container");

  container.innerHTML = "";


  // Multiple choice
  if (currentQuestion.type === "multiple_choice") {

    Object.entries(currentQuestion.answers).forEach(
      ([letter, text]) => {

        const label = document.createElement("label");

        label.className = "answer-option";

        label.innerHTML = `
          <input
            type="radio"
            name="answer"
            value="${letter}"
          >
          <strong>${letter})</strong> ${text}
        `;

        container.appendChild(label);
      }
    );

  }


  // Written
  else if (currentQuestion.type === "written") {

    const textarea = document.createElement("textarea");

    textarea.id = "written-answer";

    textarea.placeholder =
      "Write your answer here...";

    container.appendChild(textarea);


    const revealButton =
      document.createElement("button");

    revealButton.id = "reveal-button";

    revealButton.textContent =
      "Reveal answer";

    revealButton.type = "button";

    revealButton.addEventListener(
      "click",
      revealAnswer
    );

    container.appendChild(revealButton);
  }
}


// ===============================
// CHECK MULTIPLE-CHOICE ANSWER
// ===============================

function checkAnswer() {

  if (!currentQuestion) return;

  // Written questions use Reveal Answer
  if (currentQuestion.type === "written") {
    return;
  }

  const selected =
    document.querySelector(
      'input[name="answer"]:checked'
    );

  if (!selected) {

    document.getElementById("result").textContent =
      "Please select an answer.";

    return;
  }

  const userAnswer = selected.value;

  const result =
    document.getElementById("result");


  if (
    userAnswer.toLowerCase() ===
    currentQuestion.correct_answer.toLowerCase()
  ) {

    const points =
      currentQuestion.topic === "Navegacao"
        ? 0.3
        : 0.5;

    score += points;

    currentQuestion.wasCorrect = true;

    result.textContent =
      `Correct! +${points}`;

  } else {

    currentQuestion.wasCorrect = false;

    result.textContent =
      `Incorrect. Correct answer: ${currentQuestion.correct_answer}`;
  }


  // Disable answer options
  document
    .querySelectorAll('input[name="answer"]')
    .forEach(input => {
      input.disabled = true;
    });


  // Hide submit button
  document.getElementById("submit-button").style.display =
    "none";


  // Next question button
  const nextButton =
    document.createElement("button");

  nextButton.id = "next-button";

  nextButton.textContent =
    "Next Question";

  nextButton.type = "button";

  nextButton.addEventListener(
    "click",
    goToNextQuestion
  );

  document
    .getElementById("answers-container")
    .appendChild(nextButton);
}


// ===============================
// REVEAL WRITTEN ANSWER
// ===============================

function revealAnswer() {

  if (!currentQuestion) return;

  const userAnswer =
    document
      .getElementById("written-answer")
      .value
      .trim();

  if (!userAnswer) {

    document.getElementById("result").textContent =
      "Please write your answer first.";

    return;
  }


  const container =
    document.getElementById("answers-container");


  const modelAnswer =
    document.createElement("div");

  modelAnswer.id = "model-answer";

  modelAnswer.innerHTML = `
    <p><strong>Model answer:</strong></p>
    <p>${currentQuestion.correct_answer}</p>
  `;

  container.appendChild(modelAnswer);


  const markingContainer =
    document.createElement("div");

  markingContainer.id =
    "marking-container";


  const correctButton =
    document.createElement("button");

  correctButton.textContent =
    "Correct";

  correctButton.type =
    "button";


  const wrongButton =
    document.createElement("button");

  wrongButton.textContent =
    "Wrong";

  wrongButton.type =
    "button";


  correctButton.addEventListener(
    "click",
    () => {

      const points =
        currentQuestion.topic === "Navegacao"
          ? 0.3
          : 0.5;

      score += points;

      currentQuestion.wasCorrect =
        true;

      goToNextQuestion();
    }
  );


  wrongButton.addEventListener(
    "click",
    () => {

      currentQuestion.wasCorrect =
        false;

      goToNextQuestion();
    }
  );


  markingContainer.appendChild(
    correctButton
  );

  markingContainer.appendChild(
    wrongButton
  );

  container.appendChild(
    markingContainer
  );


  document.getElementById(
    "written-answer"
  ).disabled = true;

  document.getElementById(
    "submit-button"
  ).style.display = "none";
}


// ===============================
// NEXT QUESTION
// ===============================

function goToNextQuestion() {

  currentQuestionIndex++;

  if (
    currentQuestionIndex <
    examQuestions.length
  ) {

    showQuestion();

  } else {

    showFinalScore();
  }
}


// ===============================
// RETAKE
// ===============================

function retakeExam() {

  showTopicSelection();
}


// ===============================
// FINAL SCORE
// ===============================

function showFinalScore() {

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


  if (practiceMode) {
  
    const correctAnswers = examQuestions.filter(
      question => question.wasCorrect
    ).length;
  
    document.getElementById("result").innerHTML = `
      <p><strong>Score:</strong> ${correctAnswers} / ${examQuestions.length}</p>
    `;
  
  } else {
  
    document.getElementById("result").innerHTML = `
      <p><strong>RIEAM:</strong> ${rieamScore.toFixed(1)} / 4</p>
      <p><strong>Navegacao:</strong> ${navegacaoScore.toFixed(1)} / 2.4</p>
      <p><strong>Total:</strong> ${score.toFixed(1)} / 6.4</p>
    `;
  }


  document.getElementById("submit-button").style.display =
    "none";


  const retakeButton =
    document.createElement("button");

  retakeButton.id =
    "retake-button";

  retakeButton.textContent =
    "Retake Exam";

  retakeButton.type =
    "button";

  retakeButton.addEventListener(
    "click",
    retakeExam
  );

  document
    .getElementById("answers-container")
    .appendChild(retakeButton);
}


// ===============================
// SUBMIT BUTTON
// ===============================

document
  .getElementById("submit-button")
  .addEventListener(
    "click",
    checkAnswer
  );


// Start loading questions
loadQuestions();
