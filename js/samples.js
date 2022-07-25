const questionMarkup = `
          <p class="question-type">
            question <span></span> : choose the right answer
          </p>
          <p class="question-content"></p>
          <div class="choices-content">
            <div class="choice">
              <span>a)</span>
              <span class="choice-content"></span>
            </div>
            <div class="choice">
              <span>b)</span>
              <span class="choice-content"></span>
            </div>
            <div class="choice">
              <span>c)</span>
              <span class="choice-content"></span>
            </div>
            <div class="choice">
              <span>d)</span>
              <span class="choice-content"></span>
            </div>
          </div>
          <p class="explanation">
            <button class="close-explanation-btn close-btn" aria-label="Close The Explanation Box"><svg width="13" height="18" xmlns="http://www.w3.org/2000/svg"><path d="m2 1 8 8-8 8" stroke="hsl(183, 100%, 15%)" stroke-width="2" fill="none" fill-rule="evenodd"/></svg></button>
            <span class"explanation-content"></span>
          </p>
          <div class="choices-btns">
            <div class="col">
              <button class="choice-btn btn-regular" data-choice="a" aria-label="Choice a">a</button>
              <button class="choice-btn btn-regular" data-choice="b" aria-label="Choice b">b</button>
              <button class="choice-btn btn-regular" data-choice="c" aria-label="Choice c">c</button>
              <button class="choice-btn btn-regular" data-choice="d" aria-label="Choice d">d</button>
            </div>
            <div class="col">
              <button class="confirm-btn btn-regular" disabled style="cursor: not-allowed" aria-label="Confirm Your Answer">confirm answer</button>
            </div>
          </div>
          <div class="control-btns">
            <button class="previous-btn btn-regular" aria-label="Previous Questoin" data-type = "backwards">previous</button>
            <button class="show-explanation-btn btn-regular" disabled style="cursor: not-allowed" aria-label="Show Explanation">Show Explanation</button>
            <button class="next-btn btn-regular" aria-label="Next Questoin" data-type = "forwards">next</button>
          </div>
`;

const questionSample = document.createElement("div");
questionSample.className = "question-box";
questionSample.innerHTML = questionMarkup;

const codeSample = document.createElement("pre");
codeSample.classList.add("prettyprint", "code");

const questionIndexSample = document.createElement("li");
questionIndexSample.innerHTML = "<button></button>";

const percnetDivContainer = document.createElement("div");
percnetDivContainer.style.height = "100%";

const percnetDiv = document.createElement("div");
percnetDiv.className = "percent-fraction";

percnetDivContainer.appendChild(percnetDiv);

export { questionIndexSample, codeSample, questionSample, percnetDivContainer };