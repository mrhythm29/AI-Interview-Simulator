from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# 🔥 SWITCH (AI ON/OFF)
USE_AI = False   

# QUESTIONS
QUESTIONS = [
    "Tell me about yourself",
    "What are your strengths?",
    "Why should we hire you?",
    "Explain your final year project",
    "What are your career goals?"
]

# HOME
@app.route('/')
def index():
    return render_template('index.html')

# INTERVIEW PAGE
@app.route('/interview')
def interview():
    return render_template('interview.html')

# GET QUESTION
@app.route('/get_question')
def get_question():
    question_id = request.args.get('id', default=0, type=int)

    if question_id < len(QUESTIONS):
        return jsonify({
            "status": "success",
            "question": QUESTIONS[question_id],
            "question_id": question_id,
            "total_questions": len(QUESTIONS),
            "is_last": question_id == len(QUESTIONS) - 1
        })

    return jsonify({"status": "complete"})


# 🤖 ANALYZE (HYBRID SYSTEM — NO API NEEDED)
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    answer = data.get("answer", "").strip()

    words = answer.split()
    length = len(words)

    score = 5  # 🔥 base score (sabko milega)

    # ✅ LENGTH BONUS
    if length > 10:
        score += 1
    if length > 20:
        score += 1
    if length > 35:
        score += 1

    # ✅ KEYWORD BONUS
    keywords = ["project", "team", "experience", "skill", "problem", "solution"]
    bonus = sum(1 for word in keywords if word in answer.lower())
    score += min(bonus, 2)  # max +2

    # LIMIT
    if score > 10:
        score = 10

    # 🧠 FEEDBACK TEXT
    if score >= 9:
        strength = "Very strong answer with great clarity."
        improvement = "Try adding measurable impact."
    elif score >= 7:
        strength = "Good answer with clear explanation."
        improvement = "Add real-life examples."
    else:
        strength = "Decent attempt."
        improvement = "Add more details and examples."

    return jsonify({
        "feedback": f"""
Score: {score}/10

Strength:
- {strength}

Improvement:
- {improvement}
"""
    })
if __name__ == '__main__':
    app.run(debug=True)