// Selects the <main> element from index.html
// This is the container where all page content will be injected/replaced
const main = document.querySelector("main");

function showPage1() {
    document.body.className = "page1";
    
  main.innerHTML = `
    <div id="page1">

      <!-- TOP BANNER -->
      <header>
        <h1>KOOL KATS!!!</h1>
        <p>😎 The Coolest Cats on the Internet 😎</p>
      </header>

      <!-- INTRO -->
      <section id="intro">
        <h2>Welcome to KOOL KATS!!!</h2>
        <p>The ultimate fan page for the coolest, smoothest, most stylish cats around.</p>
        <p>These cats don’t just nap — they chill. 😎</p>
      </section>

      <!-- CAT FACTS -->
      <section id="facts">
        <h2>Cool Cat Facts</h2>
        <ul>
          <li>Cats wearing sunglasses are scientifically cooler.</li>
          <li>Some cats are born with natural swagger.</li>
          <li>Cool cats only hang out with other cool cats.</li>
        </ul>
      </section>

      <!-- CAT GALLERY -->
      <section id="gallery">
        <h2>Cool Cat Gallery</h2>

        <!-- IMAGES -->
        <div class="cat-gallery">
          <img src="assets/cool_cat.jpg">
          <img src="assets/smoking_cat.jpg">
          <img src="assets/us_cats.jpg">
          <img src="assets/paris_cat.jpg">
          <img src="assets/stylish_cat.jpg">
          <img src="assets/yellow_sunglasses.jpg">
          <!-- https://animalcare.my/2014/05/04/cool-cat-scooter-hip-spectacles-no-testicles-gets-the-message-across/ -->
          <!-- https://www.instagram.com/p/DTzSy5AjZOi/?img_index=3 -->
          <!-- https://www.reddit.com/r/cats/comments/1l2kugo/ive_got_some_pretty_cool_cats/ -->
          <!-- https://www.pinterest.com/pin/4151824642015550/ -->
          <!-- https://www.facebook.com/groups/637834490157380/posts/1640490179891801/ -->
          <!-- https://www.facebook.com/ColeandMarmalade/posts/theres-no-denying-that-cole-was-one-cool-cat-nationalsunglassesday-coolcat-flash/1345104573641877/ -->
        </div>
      </section>

      <!-- AD IMAGE -->
      <footer id="ad-bar">
        <a href="#" id="quiz-link">
          <img src="assets/quiz_ad.png" id="ad-image">
        </a>
      </footer>

    </div>
  `;
    // Attaches a click event listener
  document.getElementById("quiz-link").addEventListener("click", (e) => {
    e.preventDefault();
    showPage2();
  });
}

function showPage2() {
  document.body.className = "page2";

  main.innerHTML = `
    <div id="page2">
      <header>
        <h1>What Is Your True Color?</h1>
      </header>

      <section id="quiz-intro">
        <p>Take this quick personality quiz to discover your true inner color.</p>
      </section>

      <section id="quiz-section">
        <form id="quiz-form">

          <p>
            <label for="name">Name</label><br>
            <input type="text" id="name" name="name" maxlength="20" required>
          </p>

          <p>
            <label for="city">City</label><br>
            <input type="text" id="city" name="city" maxlength="20" required>
          </p>

          <p>
            <label for="fear">Biggest fear</label><br>
            <input type="text" id="fear" name="fear" maxlength="20" required>
          </p>

          <p>
            <label for="desire">Greatest desire</label><br>
            <input type="text" id="desire" name="desire" maxlength="20" required>
          </p>

          <p>
            <label for="selfWord">Describe yourself in ONE word</label><br>
            <input type="text" id="selfWord" name="selfWord" maxlength="20" required>
          </p>

          <div class="consent-group">
            <label class="consent-item">
                <input type="checkbox" id="consentAnalyze" required>
                I agree to let this site analyze my responses
            </label>

            <label class="consent-item">
                <p></p>
                <input type="checkbox" id="consentPersonal" required>
                I consent to a personalized experience
                <p></p>
            </label>
          </div>

          <p><strong>You must agree to continue.</strong></p>

          <button type="submit">See My Result</button>
        </form>
      </section>

      <div id="analysis-output"></div>

    </div>
  `;

  document.getElementById("quiz-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const quizData = {
      name: document.getElementById("name").value,
      city: document.getElementById("city").value,
      selfWord: document.getElementById("selfWord").value,
      fear: document.getElementById("fear").value,
      desire: document.getElementById("desire").value,
      consentAnalyze: document.getElementById("consentAnalyze").checked,
      consentPersonal: document.getElementById("consentPersonal").checked
    };

    window.quizData = quizData; // make global

    runAnalysis(quizData);
  });
}

function showAnalysis() {

}

// Loading Result Text
function runAnalysis(data) {
  const output = document.getElementById("analysis-output");

  main.innerHTML = `
    <div class="analysis-box">
      <h2 id="analysis-text">Analyzing responses</h2>
      <p id="analysis-sub"></p>
    </div>
  `;

  const text = document.getElementById("analysis-text");
  const sub = document.getElementById("analysis-sub");

  let dots = 0;
  const dotInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    text.textContent = "Analyzing responses" + ".".repeat(dots);
  }, 600);

  setTimeout(() => {
    sub.textContent = "Analyzing personality...";
  }, 1800);

  setTimeout(() => {
      sub.textContent = "Evaluating emotional tendencies...";
  }, 3400);

  setTimeout(() => {
    sub.textContent = "Measuring color alignment...";
  }, 5200);

  setTimeout(() => {
    sub.textContent = "Determining true color...";
  }, 7000);

  setTimeout(() => {
    clearInterval(dotInterval);

    main.innerHTML = `
      <div class="analysis-box">
        <h2>${data.name}'s Result</h2>
        <h1 class="result-color">RED</h1>
        <p>You are <strong>${data.selfWord}</strong></p>
        <p>You fear <strong>${data.fear}</strong></p>
        <p>You desire <strong>${data.desire}</strong></p>
        <p class="worthy-line">You are worthy.</p>

        <button id="next-page-btn">Continue?</button>
      </div>
    `;
    document.getElementById("next-page-btn").addEventListener("click", () => {
      showPage3();
    });
  }, 8600);
}

function showPage3() {
  document.body.className = "page3";

  const data = window.quizData;

  main.innerHTML = `
    <div id="page3">

      <!-- TOP BANNER -->
      <header>
        <h1>THE RED ORDER</h1>
        <p>There is only one true color.</p>
      </header>

      <!-- PERSONALIZED TEXT -->
      <section id="cult-message">
        <h2>Welcome, ${quizData.name}.</h2>
        <p class="cult-line">
          Red has accepted you. Now you must prove yourself.
        </p>
      </section>

      <!-- GAME SECTION -->
      <section id="game-section">
        <h2>${quizData.name}'s Trial</h2>
        <p>
          Prove your loyalty. 
        </p>

        <div id="game-box">
        </div>

        <button id="start-game-btn">Start Trial</button>
      </section>

    </div>
  `;

  document.getElementById("start-game-btn").addEventListener("click", () => {
    alert("Next step: launch the Page 4 minigame.");
  });
}

// Load first page
showPage1();