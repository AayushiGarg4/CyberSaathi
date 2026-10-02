// ===========================
// CyberNEX - script.js
// Three parts: Password, URL, Quiz
// ===========================


// ---------------------------
// PART 1: PASSWORD ANALYZER
// Runs every time you type (oninput in the HTML)
// ---------------------------
function analyzePassword(pwd) {
    // Each check is true or false
    var checks = [
        pwd.length >= 8,              // c1
        /[A-Z]/.test(pwd),            // c2: has uppercase
        /[a-z]/.test(pwd),            // c3: has lowercase
        /[0-9]/.test(pwd),            // c4: has number
        /[^A-Za-z0-9]/.test(pwd),     // c5: has symbol
        pwd.length >= 12              // c6
    ];

    var labels = [
        "8+ characters",
        "Uppercase letter",
        "Lowercase letter",
        "Number",
        "Symbol (!@#...)",
        "12+ characters"
    ];

    var score = 0;

    // Go through the 6 checks, update each line, and count the passes
    for (var i = 0; i < checks.length; i++) {
        var box = document.getElementById("c" + (i + 1));
        if (checks[i]) {
            box.classList.add("pass");
            box.textContent = "✓ " + labels[i];
            score++;
        } else {
            box.classList.remove("pass");
            box.textContent = "✗ " + labels[i];
        }
    }

    var bar = document.getElementById("sBar");
    var text = document.getElementById("sLabel");

    // Empty box: reset everything
    if (pwd.length === 0) {
        bar.style.width = "0%";
        text.textContent = "AWAITING INPUT";
        text.style.color = "#555";
        return;
    }

    // Bar width = score out of 6
    bar.style.width = (score / 6) * 100 + "%";

    // Pick a label and colour based on the score
    var color;
    if (score <= 2) {
        text.textContent = "WEAK";
        color = "#ff003c";
    } else if (score <= 4) {
        text.textContent = "MEDIUM";
        color = "#febc2e";
    } else if (score === 5) {
        text.textContent = "STRONG";
        color = "#28c840";
    } else {
        text.textContent = "VERY STRONG";
        color = "#00ffe7";
    }

    bar.style.background = color;
    text.style.color = color;
}


// ---------------------------
// PART 2: PHISHING URL DETECTOR
// Runs when you click "Scan URL"
// ---------------------------
function checkURL() {
    var url = document.getElementById("urlInput").value.trim().toLowerCase();
    var result = document.getElementById("urlResult");

    // Nothing typed
    if (url === "") {
        result.className = "url-result";
        result.innerHTML = '<i class="ri-information-line"></i> Please enter a URL first';
        return;
    }

    var problems = [];  // we collect reasons here

    // Rule 1: no HTTPS
    if (!url.startsWith("https://")) {
        problems.push("Not using HTTPS");
    }

    // Rule 2: '@' in a URL can hide the real website
    if (url.includes("@")) {
        problems.push("Contains '@' symbol");
    }

    // Rule 3: IP address instead of a domain name (e.g. http://192.168.1.1)
    if (/\d+\.\d+\.\d+\.\d+/.test(url)) {
        problems.push("Uses an IP address");
    }

    // Rule 4: very long URL
    if (url.length > 75) {
        problems.push("URL is very long");
    }

    // Rule 5: lots of hyphens (e.g. secure-paypal-login-update.com)
    if ((url.match(/-/g) || []).length >= 3) {
        problems.push("Too many hyphens");
    }

    // Rule 6: scammy words
    var badWords = ["login", "verify", "secure", "update", "account", "bank", "free", "winner", "password"];
    for (var i = 0; i < badWords.length; i++) {
        if (url.includes(badWords[i])) {
            problems.push("Suspicious word: " + badWords[i]);
            break;  // one is enough
        }
    }

    // Show result: 0 problems = safe, 1 = warning, 2+ = danger
    if (problems.length === 0) {
        result.className = "url-result safe";
        result.innerHTML = '<i class="ri-checkbox-circle-line"></i> Looks safe. No red flags found.';
    } else if (problems.length === 1) {
        result.className = "url-result warning";
        result.innerHTML = '<i class="ri-error-warning-line"></i> Be careful: ' + problems[0];
    } else {
        result.className = "url-result danger";
        result.innerHTML = '<i class="ri-alarm-warning-line"></i> Likely phishing! ' + problems.join(", ");
    }
}


// ---------------------------
// PART 3: PHISHING QUIZ
// ---------------------------

// Each question: text, 3 options, index of the correct option (0, 1 or 2), explanation
var questions = [
    {
        q: "You get an email from 'your bank' saying your account is locked. Click here to fix it NOW. What do you do?",
        options: ["Click the link quickly", "Go to the bank's website yourself", "Reply with your details"],
        answer: 1,
        explain: "Never use links in urgent emails. Type the bank's address yourself."
    },
    {
        q: "Which URL is most likely fake?",
        options: ["https://www.paypal.com", "http://paypal-secure-login.xyz", "https://www.google.com"],
        answer: 1,
        explain: "Extra words and odd endings like .xyz are classic phishing signs."
    },
    {
        q: "Which password is the strongest?",
        options: ["password123", "Rahul2005", "T7#kp9!Lm2$x"],
        answer: 2,
        explain: "Long, random, and mixed characters are the hardest to guess."
    },
    {
        q: "A stranger messages: 'You won a free phone! Send your OTP to claim.' What is this?",
        options: ["A lucky prize", "A scam", "A bank offer"],
        answer: 1,
        explain: "Never share your OTP with anyone. Real prizes don't ask for it."
    }
];

var current = 0;         // which question we are on
var answered = false;    // has the user already picked an option?

// Show the current question on the page
function showQuestion() {
    var q = questions[current];
    answered = false;

    document.getElementById("quizQ").textContent = q.q;
    document.getElementById("quizFb").textContent = "";

    var optsBox = document.getElementById("quizOpts");
    optsBox.innerHTML = "";  // clear old options

    // Make one div for each option
    for (var i = 0; i < q.options.length; i++) {
        var div = document.createElement("div");
        div.className = "quiz-opt";
        div.textContent = q.options[i];
        div.setAttribute("data-index", i);

        // When clicked, check the answer
        div.onclick = function () {
            pickAnswer(this);
        };

        optsBox.appendChild(div);
    }
}

// Runs when the user clicks an option
function pickAnswer(clickedDiv) {
    if (answered) return;   // ignore extra clicks
    answered = true;

    var q = questions[current];
    var picked = Number(clickedDiv.getAttribute("data-index"));
    var allOpts = document.querySelectorAll(".quiz-opt");
    var fb = document.getElementById("quizFb");

    // Always highlight the correct one green
    allOpts[q.answer].classList.add("correct");

    if (picked === q.answer) {
        fb.style.color = "#28c840";
        fb.textContent = "✓ Correct! " + q.explain;
    } else {
        clickedDiv.classList.add("wrong");
        fb.style.color = "#ff003c";
        fb.textContent = "✗ Wrong. " + q.explain;
    }
}

// Runs when "Next Question" is clicked
function nextQ() {
    current++;
    if (current >= questions.length) {
        current = 0;   // go back to the first question
    }
    showQuestion();
}

// Show the first question when the page loads
showQuestion();