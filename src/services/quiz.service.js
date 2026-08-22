const cleanText = (value = "") =>
    String(value)
        .replace(/\s+/g, " ")
        .trim();

const normalizeTranscript = (value = "") => {
    let text = cleanText(value);

    // Normalize common Whisper spellings:
    // H.T.M.L. -> HTML
    // H T M L -> HTML
    // C.S.S. -> CSS
    // Java Script -> JavaScript
    text = text
        .replace(/\bH\s*[\.\s]\s*T\s*[\.\s]\s*M\s*[\.\s]\s*L\s*\.?\b/gi, "HTML")
        .replace(/\bH\s+T\s+M\s+L\b/gi, "HTML")
        .replace(/\bC\s*[\.\s]\s*S\s*[\.\s]\s*S\s*\.?\b/gi, "CSS")
        .replace(/\bC\s+S\s+S\b/gi, "CSS")
        .replace(/\bJava\s+Script\b/gi, "JavaScript");

    return text;
};

const hasConcept = (text, concept) => {
    const normalized = text.toLowerCase();

    if (concept === "html") {
        return (
            /\bhtml\b/i.test(normalized) ||
            /\bh\s*\.?\s*t\s*\.?\s*m\s*\.?\s*l\s*\.?/i.test(
                normalized
            )
        );
    }

    if (concept === "css") {
        return (
            /\bcss\b/i.test(normalized) ||
            /\bc\s*\.?\s*s\s*\.?\s*s\s*\.?/i.test(
                normalized
            )
        );
    }

    if (concept === "javascript") {
        return (
            /\bjavascript\b/i.test(normalized) ||
            /\bjava\s+script\b/i.test(normalized)
        );
    }

    return false;
};

const shuffle = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j =
            Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
};

const createQuestion = (
    question,
    correctAnswer,
    wrongAnswers
) => {
    const answer = cleanText(correctAnswer);

    const wrong = [
        ...new Set(
            wrongAnswers
                .map(cleanText)
                .filter(
                    (item) =>
                        item &&
                        item !== answer
                )
        )
    ].slice(0, 3);

    if (wrong.length !== 3) {
        return null;
    }

    return {
        question: cleanText(question),

        options: shuffle([
            answer,
            ...wrong
        ]),

        correctAnswer: answer
    };
};

const generateQuiz = async (
    title,
    description,
    transcript = ""
) => {
    if (!cleanText(transcript)) {
        throw new Error(
            "Transcript is required to generate the Knowledge Check."
        );
    }

    const text =
        normalizeTranscript(transcript);

    console.log(
        "Generating Knowledge Check locally..."
    );

    console.log(
        "Normalized transcript:",
        text
    );

    const html =
        hasConcept(text, "html");

    const css =
        hasConcept(text, "css");

    const javascript =
        hasConcept(
            text,
            "javascript"
        );

    console.log(
        "Detected concepts:",
        {
            html,
            css,
            javascript
        }
    );

    const quiz = [];

    /*
    ============================================================
    QUESTION 1
    Overall technology recognition
    ============================================================
    */

    if (
        html &&
        css &&
        javascript
    ) {
        quiz.push(
            createQuestion(
                "Which three technologies are identified as important for building websites in the lesson?",

                "HTML, CSS, and JavaScript",

                [
                    "Python, Java, and SQL",
                    "MongoDB, Express, and Node.js",
                    "Git, Docker, and Linux"
                ]
            )
        );
    }

    /*
    ============================================================
    QUESTION 2
    HTML
    ============================================================
    */

    if (html) {
        quiz.push(
            createQuestion(
                "What does HTML primarily provide in a webpage?",

                "The structure of the webpage",

                [
                    "The appearance and layout of the webpage",
                    "Database storage and queries",
                    "User authentication and login"
                ]
            )
        );
    }

    /*
    ============================================================
    QUESTION 3
    CSS
    ============================================================
    */

    if (css) {
        quiz.push(
            createQuestion(
                "What does CSS primarily control on a webpage?",

                "The appearance and layout of content",

                [
                    "The structure of HTML elements",
                    "Database storage and queries",
                    "User authentication and login"
                ]
            )
        );
    }

    /*
    ============================================================
    QUESTION 4
    JavaScript
    ============================================================
    */

    if (javascript) {
        quiz.push(
            createQuestion(
                "What is JavaScript primarily used for in web development?",

                "Adding behavior and interactivity to webpages",

                [
                    "Defining the basic webpage structure",
                    "Controlling only the visual styling",
                    "Storing data permanently in a database"
                ]
            )
        );
    }

    /*
    ============================================================
    QUESTION 5
    Understanding the relationship between technologies
    ============================================================
    */

    if (
        html &&
        css &&
        javascript
    ) {
        quiz.push(
            createQuestion(
                "How do HTML, CSS, and JavaScript work together in a webpage?",

                "HTML provides structure, CSS controls appearance, and JavaScript adds behavior",

                [
                    "HTML controls appearance, CSS stores data, and JavaScript provides structure",
                    "HTML manages databases, CSS handles authentication, and JavaScript controls colors",
                    "All three technologies are used only to create webpage structure"
                ]
            )
        );
    }

    const validQuiz =
        quiz.filter(Boolean);

    if (
        validQuiz.length < 5
    ) {
        throw new Error(
            `Only ${validQuiz.length} strong questions could be generated from the detected lesson concepts.`
        );
    }

    const finalQuiz =
        shuffle(validQuiz).slice(0, 5);

    console.log(
        `Knowledge Check generated locally: ${finalQuiz.length} questions`
    );

    return finalQuiz;
};

export {
    generateQuiz
};