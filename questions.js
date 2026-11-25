/* 20문항: 분수·방정식부터 전기과 선수수학까지 단계적 진단. 학생에게 정답은 표시되지 않습니다. */
window.MATH_QUESTIONS = [
  {
    "id": 1,
    "group": "분수·지수",
    "type": "ink",
    "prompt": "3/4 + 5/6을 계산하세요. (분수로 답하세요.)",
    "answer": "19/12"
  },
  {
    "id": 2,
    "group": "분수·지수",
    "type": "ink",
    "prompt": "(−3/5) ÷ (9/10)을 계산하세요.",
    "answer": "−2/3"
  },
  {
    "id": 3,
    "group": "분수·지수",
    "type": "choice",
    "prompt": "(2³ × 2⁻¹) ÷ 2²의 값은?",
    "options": [
      "1/2",
      "1",
      "2",
      "4"
    ],
    "correctChoice": 1,
    "answer": "1"
  },
  {
    "id": 4,
    "group": "단위·비례",
    "type": "choice",
    "prompt": "저항 0.15 kΩ은 몇 Ω인가요?",
    "options": [
      "15 Ω",
      "150 Ω",
      "1,500 Ω",
      "15,000 Ω"
    ],
    "correctChoice": 1,
    "answer": "150 Ω"
  },
  {
    "id": 5,
    "group": "문자식·방정식",
    "type": "ink",
    "prompt": "3(2x − 1) − 2(x + 4)를 간단히 정리하세요.",
    "answer": "4x − 11"
  },
  {
    "id": 6,
    "group": "문자식·방정식",
    "type": "ink",
    "prompt": "(2x − 1)/3 − (x + 2)/2 = 1을 만족하는 x를 구하세요.",
    "answer": "x = 14"
  },
  {
    "id": 7,
    "group": "단위·비례",
    "type": "choice",
    "prompt": "V = IR일 때 전압 12 V, 저항 200 Ω에 흐르는 전류는?",
    "options": [
      "0.6 mA",
      "6 mA",
      "60 mA",
      "600 mA"
    ],
    "correctChoice": 2,
    "answer": "60 mA"
  },
  {
    "id": 8,
    "group": "문자식·방정식",
    "type": "ink",
    "prompt": "다음 연립방정식의 해 (x, y)를 구하세요.\nx + y = 5\n3x − 2y = 5",
    "answer": "(3, 2)"
  },
  {
    "id": 9,
    "group": "문자식·방정식",
    "type": "ink",
    "prompt": "P = I²R에서 I에 대하여 정리하세요. (P > 0, R > 0, I > 0)",
    "answer": "I = √(P/R)"
  },
  {
    "id": 10,
    "group": "다항식·함수",
    "type": "choice",
    "prompt": "(2x − 3)(x + 2)를 전개한 식은?",
    "options": [
      "2x² + x − 6",
      "2x² − x − 6",
      "2x² + x + 6",
      "2x² + 4x − 6"
    ],
    "correctChoice": 0,
    "answer": "2x² + x − 6"
  },
  {
    "id": 11,
    "group": "다항식·함수",
    "type": "ink",
    "prompt": "x² − 5x + 6 = 0의 모든 실수 해를 구하세요.",
    "answer": "x = 2, 3"
  },
  {
    "id": 12,
    "group": "다항식·함수",
    "type": "choice",
    "prompt": "두 점 (1, 3), (3, 7)을 지나는 직선의 방정식은?",
    "options": [
      "y = x + 2",
      "y = 2x − 1",
      "y = 2x + 1",
      "y = 3x"
    ],
    "correctChoice": 2,
    "answer": "y = 2x + 1"
  },
  {
    "id": 13,
    "group": "복소수",
    "type": "ink",
    "prompt": "(1 + i)(2 − i)를 계산하세요. (i² = −1)",
    "answer": "3 + i"
  },
  {
    "id": 14,
    "group": "지수·로그",
    "type": "choice",
    "prompt": "(6 × 10⁻³) ÷ (2 × 10²)를 과학적 표기법으로 나타내면?",
    "options": [
      "3 × 10⁻¹",
      "3 × 10⁻⁵",
      "3 × 10⁵",
      "3 × 10⁻⁶"
    ],
    "correctChoice": 1,
    "answer": "3 × 10⁻⁵"
  },
  {
    "id": 15,
    "group": "지수·로그",
    "type": "ink",
    "prompt": "2^(x + 1) = 16을 만족하는 x를 구하세요.",
    "answer": "x = 3"
  },
  {
    "id": 16,
    "group": "지수·로그",
    "type": "choice",
    "prompt": "log₂8 + log₃9의 값은?",
    "options": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correctChoice": 2,
    "answer": "5"
  },
  {
    "id": 17,
    "group": "삼각함수",
    "type": "choice",
    "prompt": "교류 전압 v(t) = 10 sin(100πt)에서 주파수 f는? (각주파수 ω = 2πf)",
    "options": [
      "25 Hz",
      "50 Hz",
      "100 Hz",
      "200 Hz"
    ],
    "correctChoice": 1,
    "answer": "50 Hz"
  },
  {
    "id": 18,
    "group": "극한",
    "type": "ink",
    "prompt": "lim[x→2] (x² − 4)/(x − 2)의 값을 구하세요.",
    "answer": "4"
  },
  {
    "id": 19,
    "group": "미분",
    "type": "ink",
    "prompt": "f(x) = 3x² − 2x + 1일 때 f′(2)를 구하세요.",
    "answer": "10"
  },
  {
    "id": 20,
    "group": "적분",
    "type": "ink",
    "prompt": "정적분 ∫₀² (3x² + 1) dx를 계산하세요.",
    "answer": "10"
  }
];
