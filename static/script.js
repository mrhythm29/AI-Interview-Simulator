// ================== GLOBAL ==================
let currentQuestionId = 0;
let scores = [];

let timerInterval;
let secondsElapsed = 0;

// ================== ELEMENTS ==================
const questionTextElem = document.getElementById('question-text');
const currentQElem = document.getElementById('current-q');
const totalQElem = document.getElementById('total-q');
const nextBtn = document.getElementById('next-btn');
const answerInput = document.getElementById('answer-input');
const feedbackBox = document.getElementById("feedback-box");
const feedbackText = document.getElementById("feedback-text");
const timerElem = document.getElementById("timer");
const wordCountElem = document.getElementById("word-count");

// ================== TIMER ==================
function startTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;

    timerInterval = setInterval(() => {
        secondsElapsed++;

        const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
        const secs = String(secondsElapsed % 60).padStart(2, '0');

        if (timerElem) {
            timerElem.innerText = `⏱️ ${mins}:${secs}`;
        }
    }, 1000);
}

// ================== WORD COUNT ==================
if (answerInput && wordCountElem) {
    answerInput.addEventListener('input', () => {
        const words = answerInput.value
            .trim()
            .split(/\s+/)
            .filter(word => word.length > 0);

        wordCountElem.innerText = words.length;
    });
}

// ================== FETCH QUESTION ==================
async function fetchQuestion(id) {
    try {
        const response = await fetch(`/get_question?id=${id}`);
        const data = await response.json();

        if (data.status === 'success') {
            questionTextElem.innerText = data.question;
            currentQElem.innerText = data.question_id + 1;
            totalQElem.innerText = data.total_questions;

            answerInput.value = '';
            if (wordCountElem) wordCountElem.innerText = 0;

            startTimer();
        } else {
            questionTextElem.innerText = "Interview Complete!";
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

// ================== BUTTON CLICK ==================
nextBtn.addEventListener("click", async () => {
    const answer = answerInput.value.trim();

    if (answer === "") {
        alert("Please write an answer!");
        return;
    }

    // CALL BACKEND
    const res = await fetch("/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ answer })
    });

    const data = await res.json();

    // SHOW FEEDBACK
    feedbackBox.style.display = "block";
    feedbackText.innerText = data.feedback;

    // ================== SCORE ==================
    const match = data.feedback.match(/Score: (\d+)/);
    if (match) {
        const score = parseInt(match[1]);
        scores.push(score);

        if (score >= 8) {
            feedbackText.className = "score-high";
        } else if (score >= 5) {
            feedbackText.className = "score-medium";
        } else {
            feedbackText.className = "score-low";
        }
    }

    // ================== NEXT QUESTION ==================
    setTimeout(() => {

        if (currentQuestionId >= 4) {
            showResult();
            return;
        }

        currentQuestionId++;
        fetchQuestion(currentQuestionId);

        feedbackBox.style.display = "none";

    }, 4000);
});
// 🔥 SKIP BUTTON FIX
const skipBtn = document.getElementById("skip-btn");

if (skipBtn) {
    skipBtn.addEventListener("click", () => {

        // next question load karo
        if (currentQuestionId >= 4) {
            showResult();
            return;
        }

        currentQuestionId++;
        fetchQuestion(currentQuestionId);

        // reset UI
        feedbackBox.style.display = "none";
        answerInput.value = "";
        if (wordCountElem) wordCountElem.innerText = 0;
    });
}

// ================== RESULT SCREEN ==================
function showResult() {
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = (total / scores.length).toFixed(1);

    let message = "";
    let color = "";

    if (avg >= 8) {
        message = "🔥 Excellent performance!";
        color = "#22c55e";
    } else if (avg >= 5) {
        message = "👍 Good, but can improve.";
        color = "#facc15";
    } else {
        message = "⚠️ Needs improvement.";
        color = "#ef4444";
    }

    document.body.innerHTML = `
    <div style="
        height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background: linear-gradient(135deg,#0b101e,#1a2238);
        color:white;
        font-family:sans-serif;
    ">
        <div style="
            padding:40px;
            border-radius:20px;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            text-align:center;
            box-shadow: 0 0 40px rgba(120,156,255,0.3);
        ">
            <h1>🎉 Interview Complete</h1>
            <h2 style="color:${color}; margin:20px 0;">
                Average Score: ${avg}/10
            </h2>
            <p style="font-size:18px;">${message}</p>
            <button onclick="location.reload()" style="
                margin-top:20px;
                padding:10px 20px;
                border:none;
                border-radius:20px;
                background:#789cff;
                cursor:pointer;
            ">
                Restart
            </button>
        </div>
    </div>
    `;
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    fetchQuestion(currentQuestionId);
});