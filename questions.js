/*
 * 문제 수정은 이 파일만 편집하세요.
 * type: "choice"(객관식) 또는 "ink"(손글씨 단답형)
 * correctChoice / answer는 학생 화면에 표시하지 않습니다.
 * 20문항은 기존 기초 진단평가 1~20번을 바탕으로 구성했습니다.
 */
window.MATH_QUESTIONS = [
  { id: 1, group: "기초 연산", type: "choice", prompt: "−7 + 12 − 9의 값을 구하세요.", options: ["−14", "−4", "4", "14"], correctChoice: 1, answer: "−4" },
  { id: 2, group: "기초 연산", type: "ink", prompt: "3/4 + 1/6을 계산하세요.", answer: "11/12" },
  { id: 3, group: "기초 연산", type: "ink", prompt: "5/6 − 1/4을 계산하세요.", answer: "7/12" },
  { id: 4, group: "기초 연산", type: "ink", prompt: "(2/3) ÷ (4/5)를 계산하세요.", answer: "5/6" },
  { id: 5, group: "기초 연산", type: "choice", prompt: "0.25 × 0.8의 값을 고르세요.", options: ["0.02", "0.2", "2", "0.5"], correctChoice: 1, answer: "0.2" },
  { id: 6, group: "기초 연산", type: "choice", prompt: "18의 2/3는 얼마인가요?", options: ["6", "9", "12", "27"], correctChoice: 2, answer: "12" },
  { id: 7, group: "기초 연산", type: "choice", prompt: "80의 15%는 얼마인가요?", options: ["8", "12", "15", "20"], correctChoice: 1, answer: "12" },
  { id: 8, group: "기초 연산", type: "choice", prompt: "2³ × 2²의 값을 고르세요.", options: ["12", "16", "32", "64"], correctChoice: 2, answer: "32" },
  { id: 9, group: "기초 연산", type: "choice", prompt: "√49의 값을 고르세요.", options: ["−7", "7", "14", "49"], correctChoice: 1, answer: "7" },
  { id: 10, group: "기초 연산", type: "ink", prompt: "2 : 5 = x : 20을 만족하는 x의 값을 쓰세요.", answer: "8" },
  { id: 11, group: "문자식과 방정식", type: "ink", prompt: "3(2x − 1) − 2x를 간단히 정리하세요.", answer: "4x − 3" },
  { id: 12, group: "문자식과 방정식", type: "ink", prompt: "5x − 7 = 18에서 x의 값을 쓰세요.", answer: "5" },
  { id: 13, group: "문자식과 방정식", type: "ink", prompt: "x/3 + 1/2 = 5/6에서 x의 값을 쓰세요.", answer: "1" },
  { id: 14, group: "문자식과 방정식", type: "ink", prompt: "V = IR에서 R을 구하는 식을 쓰세요. (I ≠ 0)", answer: "R = V/I" },
  { id: 15, group: "문자식과 방정식", type: "ink", prompt: "다음 연립방정식을 만족하는 (x, y)를 쓰세요.\nx + y = 7\n2x − y = 2", answer: "(3, 4)" },
  { id: 16, group: "문자식과 방정식", type: "choice", prompt: "y = 3x − 2에서 x = 2일 때 y의 값을 고르세요.", options: ["2", "4", "6", "8"], correctChoice: 1, answer: "4" },
  { id: 17, group: "문자식과 방정식", type: "ink", prompt: "두 점 (0, 1), (2, 5)를 지나는 직선이 y = ax + b일 때 (a, b)를 쓰세요.", answer: "(2, 1)" },
  { id: 18, group: "문자식과 방정식", type: "ink", prompt: "x² + 5x + 6을 인수분해하세요.", answer: "(x + 2)(x + 3)" },
  { id: 19, group: "고등수학 확인", type: "ink", prompt: "x² − 9 = 0의 모든 실수 해를 쓰세요.", answer: "−3, 3" },
  { id: 20, group: "고등수학 확인", type: "choice", prompt: "sin 30°의 값을 고르세요.", options: ["0", "1/2", "√2/2", "√3/2"], correctChoice: 1, answer: "1/2" }
];
