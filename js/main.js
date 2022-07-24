
// Import the question-box markup from sample.js
import { questionIndexSample, codeSample, questionSample, percnetDivContainer } from "./samples.js";
import { hljs } from "../highlight/highlight.min.js";

// Getting elements from the document

const levelBtns = document.querySelectorAll(".level-btns button");
const startBtns = document.querySelectorAll("button.start-btn");
const levelInfoElements = document.querySelectorAll("p.level-info");
const introOverlay = document.querySelector(".intro-overlay");

const startOverPanel = document.querySelector(".start-over");
const closePanelBtn = startOverPanel.querySelector(".close-panel-btn");

const openAsideBtn = document.querySelector("button.open-aside-btn");
const closeAsideBtn = document.querySelector("button.close-aside-btn");
const aside = document.querySelector("aside.aside");
const asideOverlay = document.querySelector(".aside-overlay");

const questionsIndex = aside.querySelector(".questions-index");

const progressBar = document.querySelector(".progress-bar");

const timeLeftBox = document.querySelector(".timer-box .time-left")
const minutesLeftSpan = timeLeftBox.querySelector("span.minutes");
const secondsLeftSpan = timeLeftBox.querySelector("span.seconds");

const questionsContainer = document.querySelector(".questions");

const finalResult = document.querySelector(".final-result");

const startOverBtns = document.querySelectorAll("button.start-over-btn");

// Initialzing global variables

let

  currentLevelInfo, // The number of questions and the level time

  tempLevelInfo, // The same as (currentLevelInfo) but it's updated whenever the user clicks one of the levelBtns

  request, // A promise returned from fetching data from the data.json file

  questionsArr, // An array that has questions picked up randomly from the file

  questionsIndexes, // The indexes of every question

  currentAnswer, // A global varibale that has the user's current answer

  currentPrgressBarFraction, // A global variable that holds a protion of the progress bar

  timerHandler; // A handler for the timer


// Initialzing global objects

const levelsInfo = {
  easy: {
    questionsNumber: 10,
    levelTime: 8,
  },
  medium: {
    questionsNumber: 20,
    levelTime: 10,
  },
  hard: {
    questionsNumber: 30,
    levelTime: 10,
  }
}

let quizData = {
  over: false, // Has the user fininshed answering all the questions ?
  currentQuestionId: null, // The id of the current question
  currentQuestionObject: null, // An object that has the current question data including the answer
  rightAnswers: 0, // A counter for right answers
  questionsSolved: 0, // A counter for answers generallly
}

// Handling the first load of the page

document.addEventListener("DOMContentLoaded", () => {

  // Fetching an array that has the questions as JSON objects
  request = fetch("./data/questions.json").then(questions => questions.json());

  // Handling When the user choose the level
  updateLevel();

  // If the user clicks one of the "Start" button, start the quiz
  request.then(questions => startQuiz(questions));

  // Adding the eventListeners for general buttons => aside buttons, startOver buttons etc..
  addClickEvent();

})

// Function => Add click events to buttons

function addClickEvent() {

  // The aside
  openAsideBtn.addEventListener("click", () => {
    aside.classList.add("show-up");
    asideOverlay.classList.add("show-up");
  });
  closeAsideBtn.addEventListener("click", () => {
    aside.classList.remove("show-up");
    asideOverlay.classList.remove("show-up");
  });

  // The start over panel
  startOverBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      startOverPanel.classList.add("show-up");
    });
  });

  closePanelBtn.addEventListener("click", () => startOverPanel.classList.remove("show-up"));

}

// Function => Reset

function reset() {

  // Resetting the quizData object properties
  quizData.over = false;
  quizData.currentQuestionId = null;
  quizData.currentQuestionObject = null;
  quizData.rightAnswers = 0;
  quizData.questionsSolved = 0;

  // Resetting some of the global variables
  questionsArr = [];
  questionsIndexes = [];
  currentAnswer = null;
  currentPrgressBarFraction = null;

  // Emptying elmenets to fill them again 
  questionsContainer.innerHTML = "";
  questionsIndex.innerHTML = "";
  progressBar.innerHTML = "";

  // Change the color of the timer to basic color
  for (let child of timeLeftBox.children) child.classList.remove("over");

  // // Resetting the timer
  // handleTimer(true);

}

// Function => Update the level

function updateLevel() {

  levelBtns.forEach(btn => {

    btn.addEventListener("click", (event) => {

      let currentLevel = event.target.dataset.level; // Get the level the user has chosen
      tempLevelInfo = levelsInfo[currentLevel]; // Update the temporary level info (used just to tell the user about the level details)
      setLevelData(tempLevelInfo) // Show the user the level details
      addActive(levelBtns, event.target, null); // add active class to the clicked button

    });

  });

}

// Function => Update the content of the (levelInfoElements) to tell the user some info. about the level

function setLevelData(tempLevelInfo) {

  levelInfoElements.forEach(element => {
    element.textContent = `you have ${tempLevelInfo.levelTime} minutes\
    to answer ${tempLevelInfo.questionsNumber} questoins`;
  })

}

// Function => Start the quiz when one of the (startBtns) gets clicked

function startQuiz(questions) {

  startBtns.forEach(btn => {

    enableButton(btn); // Enable the button to be clickable (only after the user chooses a level)

    btn.addEventListener("click", (event) => {

      currentLevelInfo = tempLevelInfo; // Set the (currentLevelInfo) to be the same as the last level the user has chosen

      // Make the button unclickable to avoid the user clicking twice on the button and thus, generate more questions than needed
      event.target.style.pointerEvents = "none";

      reset(); // Reset the quiz data to start a new one
      distributeData(questions); // Insert questions and questions indexes to the document
      handleTimer(); // Start the timer

      // Reveal the questions after 1.5 seconds
      setTimeout(() => {

        introOverlay.classList.add("fuck-off");
        startOverPanel.classList.remove("show-up");
        btn.style.pointerEvents = "all"; // Make the button clickable again

      }, 1500)

    })

  });

}

// Function => Insert questions and questions indexes to the document

function distributeData(questions) {

  let len = questions.length; // Get the length of the total number of questions

  let i = 0, numberOfQuestions = currentLevelInfo.questionsNumber;

  // Divide the progress bar to to have as many columns as the number of the level questoins
  progressBar.style.gridTemplateColumns = `repeat(${numberOfQuestions}, 1fr)`;

  // A loop to Insert the questions
  while (i != numberOfQuestions) { // Repeat the loop until we reach the (numberOfQuestions)

    let result = addQestions(len, questions, i); // The result will be 0 if the question was already chosen before
    if (result === 0) continue;
    i = questionsArr.length;

  }

}

// Function => Insert the questions

function addQestions(len, questions, i) {

  let index = Math.trunc(Math.random() * len); // Get a random index

  // If the questions was chosen before => return 0 => exit the while loop in (distributeData) function
  if (questionsIndexes.includes(index)) return 0;

  // If not:

  // Add the question index to the (questionsIndexes) array and add the qestion to the (questionsArr) array
  let question = questions[index];
  questionsIndexes.push(index);
  questionsArr.push(question)

  // Make a clone of the (questionSample) and give a (data-id) of (index)
  let questionClone = questionSample.cloneNode(true);
  questionClone.dataset.id = index;

  // Fill in the content of the (questionClone) using the (question) object:

  // 1 => Set the question number and the question content
  questionClone.querySelector("p.question-type span").textContent = i + 1;
  questionClone.querySelector("p.question-content").textContent = question.question;

  // 2 => Set the choices
  let choicesContainer = questionClone.querySelector(".choices-content");
  let choices = choicesContainer.querySelectorAll(".choice span.choice-content");
  for (let j = 0; j < 4; j++) {
    choices[j].textContent = question.choices[j];
  }

  // 3 => Set the explanation
  let explanationParagraph = questionClone.querySelector("p.explanation");
  explanationParagraph.lastElementChild.textContent = question.explanation;

  // 4 => If there's a code snippet, Insert it
  if (question.code != null) {
    let codeSnippet = codeSample.cloneNode(true);
    codeSnippet.textContent = question.code;
    hljs.highlightElement(codeSnippet);
    questionClone.insertBefore(codeSnippet, choicesContainer)
  }

  addInteractivity(questionClone); // Add interacitivity to the buttons of the (question-box) div

  if (i == 0) { // If it's the first question:

    questionClone.classList.add("active"); // Add active class
    quizData.currentQuestionId = index; // set the (currentQuestionId) to (index)
    quizData.currentQuestionObject = question; // set the (currentQuestionObject) to (question)

  };

  addIndexes(i, index); // Insert a (questionIndexSample) to the questions index in the (aside)
  addPrgressBarFractions(i); // Insert a (percentDivContainer) to the (progressBar)

  questionsContainer.appendChild(questionClone); // Append the question to the (questionsContainer) element
}

// Function => Add interactivity to the buttons of the (question-box) div

function addInteractivity(questionClone) {

  // Selecting the buttons
  let choicesBtns = Array.from(questionClone.querySelectorAll(".choices-btns .choice-btn"));
  let confirmBtn = questionClone.querySelector("button.confirm-btn");
  let showExplanationBtn = questionClone.querySelector("button.show-explanation-btn");
  let closeExplanationBtn = questionClone.querySelector("button.close-explanation-btn");
  let explanationParagraph = questionClone.querySelector("p.explanation");

  // Choices buttons
  choicesBtns.forEach(choiceBtn => {

    choiceBtn.addEventListener("click", (event) => {

      addActive(choicesBtns, event.target, null); // Add active class to the button
      currentAnswer = choiceBtn.dataset.choice; // Update the current answer variable
      enableButton(confirmBtn) // Enable the confirmBtn to be clickable

    });

  });

  // Confirm answer button
  confirmBtn.addEventListener("click", () => {

    // If the the user answered all the questions or the time is over, do nothing
    if (quizData.over) return;

    // If not:

    quizData.questionsSolved++; // Increase the (questionsSolved) variable by one
    enableButton(showExplanationBtn) // Enable the showExplanationBtn to be clickable
    let result = verifyAnswer(questionClone); // Check whether the user has answerd correctly

    // Set the background color of the (progressBarFraction) according to the uesr's answer
    let bgColor = result ? "#016001" : "brown";
    handleProgressBarFraction(bgColor);

    // Set the background color of the (confirmBtn) according to the uesr's answer
    confirmBtn.style.backgroundColor = bgColor;
    confirmBtn.style.pointerEvents = "none"; // Make the (confirmBtn) unclickable

    // If it's the last questoin, make the final result
    if (quizData.questionsSolved == currentLevelInfo.questionsNumber) {
      checkQuizResult();
    }

  });

  // Show and close explanation buttons
  showExplanationBtn.addEventListener("click", () => explanationParagraph.classList.add("show-up"));
  closeExplanationBtn.addEventListener("click", () => explanationParagraph.classList.remove("show-up"));

  // Next and Previous buttons
  managePreviousNextBtns(questionClone);


}

// Function => Add questions indexes in the (questionsIndex) element

function addIndexes(iteration, index) {

  let questionIndexClone = questionIndexSample.cloneNode(true); // Make a clone of the (questionIndexSample)
  let indexBtn = questionIndexClone.querySelector("button"); // Select the button
  indexBtn.dataset.id = index; // Give the button the index of the corresponding question
  indexBtn.textContent = `question ${iteration + 1}`;

  // Adding interacivity to the button
  indexBtn.addEventListener("click", (event) => {

    // When the indexBtn gets clicked:

    let targetedId = event.target.dataset.id; // 1 => Get the (data-id) of the button
    let indexOfId = questionsIndexes.indexOf(+targetedId); // 2 => Get the index of this id in the (questionsIndexes) array
    questionsContainer.classList.add("fade"); // 3 => Set the opacity of the (questionsContainer) to 0

    setTimeout(() => { // Wait half a second and then:

      currentAnswer = null; // 1 => Set the (currentAnswer) to null
      addActive(questionsContainer.children, null, indexOfId); // 2 => Add active class to the targeted question
      quizData.currentQuestionId = +targetedId; // 3 => Update the (quizData.currentQuestionId) to targetedId
      questionsContainer.classList.remove("fade"); // 4 => put the obacity of the (questionsContainer) back to 1

    }, 500)

  });

  // Append the (questionIndexClone) to the (questionsIndex)
  questionsIndex.appendChild(questionIndexClone);

}

// Function => Add one one of the progress bar portions

function addPrgressBarFractions(i) {

  let clone = percnetDivContainer.cloneNode(true); // Make a clone of the (percnetDivContainer)
  if (i == 0) currentPrgressBarFraction = clone; // Set the (currentPrgressBarFraction) to (clone)
  progressBar.appendChild(clone); // Append the (clone) to the (progressBar)

}

// Function => Making previous and next buttons interactive

function managePreviousNextBtns(questionClone) {

  // Selecting the previous and next buttons
  let btns = questionClone.querySelectorAll(".control-btns button:not(.show-explanation-btn)");

  btns.forEach(btn => {

    btn.addEventListener("click", (event) => {

      let type = event.target.dataset.type; // Deciding whether the button is previous or next
      let currentIndex = questionsIndexes.indexOf(quizData.currentQuestionId); // Getting the index of the (currentQuestionId)

      let targetedIndex;

      if (type == "forwards") {
        if (!questionClone.isSameNode(questionsContainer.lastElementChild)) { // If it's not the last question
          targetedIndex = ++currentIndex;
        } else return;
      } else {
        if (!questionClone.isSameNode(questionsContainer.firstElementChild)) { // If it's not the first question
          targetedIndex = --currentIndex;
        } else return;
      }

      questionsContainer.classList.add("fade"); // Setting the opacity of the (questionsContainer) to 0

      setTimeout(() => { // Wait half a second and then:

        addActive(questionsContainer.children, null, targetedIndex); // 1 => Show the targetted question
        questionsContainer.classList.remove("fade"); // 2 => Set the opacity of the (questionsContainer) to 0

        // Reset some global varibales
        currentAnswer = null;
        quizData.currentQuestionId = questionsIndexes[targetedIndex];

      }, 500)

    });

  });

}

// Function => verifying the answer

function verifyAnswer(questionClone) {

  // Select the current questoin's choices buttons
  let choicesBtns = Array.from(questionClone.querySelectorAll(".choices-btns .choice-btn"));
  let answer = quizData.currentQuestionObject.answer;

  choicesBtns.forEach(btn => {

    btn.style.pointerEvents = "none"; // Make the (choicesBtns) unclickable

    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      btn.style.backgroundColor = "brown";
    }
    if (btn.dataset.choice == answer) btn.style.backgroundColor = "#016001";

  });

  if (currentAnswer == answer) { // If the answer is correct
    quizData.rightAnswers++;
    return true;
  }

}

// Function => Set the color of the (currentPrgressBarFraction) and expand it

function handleProgressBarFraction(bgColor) {

  let fraction = currentPrgressBarFraction.firstElementChild;

  fraction.style.cssText = `background-color: ${bgColor}; width: 100%;`;

}

// Function => Set the timer and manage it

function handleTimer() {

  // Clear the last interval if there is
  clearInterval(timerHandler);

  // Initialize the minutes and seconds variables
  let minutes = currentLevelInfo.levelTime - 1, seconds = 59;

  // Add the primitive values in the (timer-box) div
  minutesLeftSpan.textContent =
    minutes < 10 ? "0" + minutes : minutes;

  secondsLeftSpan.textContent = 60;

  setTimeout(() => { // Start the timer after a second to give the user some time

    timerHandler = setInterval(() => { // Start the timer

      if (quizData.over) { // If all the questions were answered:

        clearInterval(timerHandler);
        timerHandler = null;
        return;

      }

      if (seconds < 10) { // If seconds is less than 10, add 0 at the beginning
        secondsLeftSpan.textContent = "0" + seconds;
      } else {
        secondsLeftSpan.textContent = seconds;
      }

      if (seconds == 0) { // If seconds is equal to 0:
        if (minutes == 0) { // If minutes is equal to 0 => it's over

          checkQuizResult(); // Check the quiz result

          // Change the color of the timer
          for (let child of timeLeftBox.children) child.classList.add("over");

          // Clear the interval and return
          clearInterval(timerHandler);
          timerHandler = null;
          return;

        }

        // If seconds isn't equal to 0:

        if (minutes < 10) { // If minutes is less than 10, add 0 at the beginning
          minutesLeftSpan.textContent = "0" + minutes--;
        } else {
          minutesLeftSpan.textContent = minutes--;
        }

        // Set the seconds to 60 again
        secondsLeftSpan.textContent = 60;
        seconds = 60;

      }

      // Decrease the seconds by one
      seconds--;

    }, 1000)

  }, 1000)

}

// Function => Check the result of the quiz

function checkQuizResult() {

  // Set the (quizData.over) to true => that will stop the timer
  quizData.over = true;

  let message;

  // Set the value of (message) according the number of questions the user has answered correctly
  if (quizData.rightAnswers == 0) {
    message = "you haven't answered any questions";
  } else if (quizData.rightAnswers == 1) {
    message = "you have answered one question";
  } else {
    message = `you have correctly answered ${quizData.rightAnswers} questoins out of ${currentLevelInfo.questionsNumber}`
  }

  // Print the message to the user
  finalResult.querySelector(".message").textContent = message;
  finalResult.classList.add("show-up");

  // Hide the message after 5 seconds
  setTimeout(() => {
    finalResult.classList.remove("show-up");
  }, 5000)
}

// Function => addActive

function addActive(array, sample, index) {

  if (sample) {  // The function was triggered to add active to a button using this button
    array.forEach(item => {
      item.classList.remove("active");
      if (item.isEqualNode(sample)) item.classList.add("active");
    });
  } else {  // The function was triggered to add active to an element using its index in an array
    for (let elemnet of array) {
      elemnet.classList.remove("active");
    }
    array[index].classList.add("active"); // Add active class to the targeted element

    // Update some global variables
    currentPrgressBarFraction = progressBar.children[index];
    quizData.currentQuestionObject = questionsArr[index];
  }

}

// Function => Enable a disabled button

function enableButton(btn) {

  btn.removeAttribute("disabled");
  btn.style.cursor = "pointer";

}