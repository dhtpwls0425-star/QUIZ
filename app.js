(() => {
  "use strict";

  const ROLE = document.body.dataset.role;
  const IS_TEACHER = ROLE === "teacher";
  const QUESTIONS = window.MATH_QUESTIONS || [];
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const DRAFT_KEY = "electrical-math-v1-student-drafts";
  const PENDING_KEY = "electrical-math-v1-pending";
  const SENT_KEY = "electrical-math-v1-sent";
  const RECEIVED_KEY = "electrical-math-v1-teacher-received";
  const root = document.getElementById("questions");
  const statusNode = document.getElementById("connection-status");
  const toastNode = document.getElementById("toast");
  const cards = new Map();
  const pads = new Map();
  const drafts = readJSON(DRAFT_KEY, {});
  const pending = readJSON(PENDING_KEY, {});
  const sent = readJSON(SENT_KEY, {});
  const received = readJSON(RECEIVED_KEY, {});
  let peer = null;
  let connection = null;
  let toastTimeout;
  let reconnectTimeout;

  function readJSON(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { toast("저장 공간이 부족합니다. 작성 분량을 줄여 주세요."); }
  }

  function toast(message) {
    toastNode.textContent = message;
    toastNode.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastNode.classList.remove("show"), 2800);
  }

  function setConnectionStatus(message, status = "idle") {
    statusNode.className = `connection ${status === "idle" ? "" : status}`;
    statusNode.querySelector("span").textContent = message;
  }

  function draftFor(id) {
    if (!drafts[id] || typeof drafts[id] !== "object") {
      drafts[id] = { choice: null, answer: [], note: [], revision: 0 };
    }
    if (!Array.isArray(drafts[id].answer)) drafts[id].answer = [];
    if (!Array.isArray(drafts[id].note)) drafts[id].note = [];
    if (!Number.isInteger(drafts[id].revision)) drafts[id].revision = 0;
    return drafts[id];
  }

  function updateDraft(id) {
    const draft = draftFor(id);
    draft.revision += 1;
    writeJSON(DRAFT_KEY, drafts);
    updateCardStatus(id);
  }

  function updateCardStatus(id) {
    const el = cards.get(id)?.status;
    if (!el) return;
    if (IS_TEACHER) {
      if (received[id]) {
        const time = new Date(received[id].sentAt).toLocaleTimeString("ko-KR", {hour: "2-digit", minute: "2-digit"});
        el.className = "state-label received";
        el.textContent = `${time} 제출됨`;
      } else {
        el.className = "state-label";
        el.textContent = "제출 전";
      }
      return;
    }
    const draft = draftFor(id);
    if (pending[id]) {
      el.className = "state-label pending";
      el.textContent = connection?.open ? "전송 확인 중" : "연결되면 전송";
    } else if (sent[id] !== undefined && sent[id] === draft.revision) {
      el.className = "state-label sent";
      el.textContent = "전송 완료";
    } else if (sent[id] !== undefined) {
      el.className = "state-label";
      el.textContent = "수정됨 · 다시 제출";
    } else {
      el.className = "state-label";
      el.textContent = "";
    }
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createCard(question) {
    const card = element("article", "question-card");
    card.id = `question-${question.id}`;
    const top = element("div", "card-top");
    const number = element("span", "q-number", String(question.id).padStart(2, "0"));
    const title = element("div", "title-side");
    title.append(element("div", "group-name", question.group));
    title.append(element("div", "problem-text", question.prompt));
    const actions = element("div", "card-action");
    let submit = null;
    if (!IS_TEACHER) {
      submit = element("button", "submit-btn", "제출");
      submit.type = "button";
      submit.setAttribute("aria-label", `${question.id}번 답안 제출`);
      submit.addEventListener("click", () => submitQuestion(question.id));
      actions.append(submit);
    }
    const stateLabel = element("span", "state-label");
    stateLabel.setAttribute("aria-live", "polite");
    actions.append(stateLabel);
    top.append(number, title, actions);
    card.append(top);

    const entry = { card, status: stateLabel, options: [] };
    if (question.type === "choice") {
      const choices = element("div", "choice-grid");
      choices.setAttribute("role", "group");
      choices.setAttribute("aria-label", `${question.id}번 객관식 선택`);
      question.options.forEach((option, optionIndex) => {
        const label = element("label", `choice-option ${IS_TEACHER ? "readonly" : ""}`);
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `answer-${question.id}`;
        input.value = String(optionIndex);
        input.disabled = IS_TEACHER;
        const check = element("span", "choice-box", "✓");
        check.setAttribute("aria-hidden", "true");
        label.append(input, check, element("span", "", `${"①②③④"[optionIndex]} ${option}`));
        if (!IS_TEACHER) {
          input.addEventListener("change", () => {
            draftFor(question.id).choice = optionIndex;
            updateDraft(question.id);
            updateChoices(question.id, optionIndex);
          });
        }
        entry.options.push(label);
        choices.append(label);
      });
      card.append(choices);
    } else {
      const answerArea = element("div", "answer-area");
      const {topRow, canvas} = makePadHeader("정답", question.id, "answer");
      canvas.className = "hand-canvas";
      canvas.setAttribute("aria-label", `${question.id}번 손글씨 정답 입력`);
      answerArea.append(topRow, canvas);
      card.append(answerArea);
    }

    const noteArea = element("div", "note-area");
    const {topRow: noteHeader, canvas: noteCanvas} = makePadHeader("풀이 노트", question.id, "note");
    noteCanvas.className = "note-canvas";
    noteCanvas.setAttribute("aria-label", `${question.id}번 풀이 노트`);
    noteArea.append(noteHeader, noteCanvas);
    card.append(noteArea);

    if (IS_TEACHER) {
      const expected = element("div", "teacher-answer");
      expected.append(element("span", "", "참고 정답"), element("strong", "expected", question.answer));
      card.append(expected);
    }
    root.append(card);
    cards.set(question.id, entry);

    if (question.type === "ink") {
      const answerCanvas = card.querySelector(".hand-canvas");
      createPad(answerCanvas, question.id, "answer", !IS_TEACHER);
    }
    createPad(noteCanvas, question.id, "note", !IS_TEACHER);
    if (question.type === "choice") {
      const choice = IS_TEACHER ? received[question.id]?.choice : draftFor(question.id).choice;
      updateChoices(question.id, choice);
    }
    updateCardStatus(question.id);
  }

  function makePadHeader(label, id, field) {
    const topRow = element("div", field === "answer" ? "answer-top" : "note-top");
    topRow.append(element("span", "field-label", label));
    if (!IS_TEACHER) {
      const tools = element("div", "pad-tools");
      const undo = element("button", "pad-tool", "되돌리기");
      undo.type = "button";
      undo.addEventListener("click", () => pads.get(`${id}-${field}`)?.undo());
      const clear = element("button", "pad-tool", "지우기");
      clear.type = "button";
      clear.addEventListener("click", () => pads.get(`${id}-${field}`)?.clear());
      tools.append(undo, clear);
      topRow.append(tools);
    }
    const canvas = document.createElement("canvas");
    return {topRow, canvas};
  }

  function updateChoices(id, selected) {
    const entry = cards.get(id);
    if (!entry) return;
    entry.options.forEach((label, index) => {
      label.classList.toggle("active", Number.isInteger(selected) && selected === index);
      const input = label.querySelector("input");
      if (input) input.checked = selected === index;
    });
  }

  function cloneStrokes(value) {
    // 외부에서 전달된 필기를 화면에 그리기 전에 형태와 용량을 제한합니다.
    if (!Array.isArray(value)) return [];
    let pointCount = 0;
    const cleaned = [];
    for (const stroke of value.slice(0, 350)) {
      if (!stroke || !Array.isArray(stroke.points)) continue;
      const points = [];
      for (let i = 0; i + 1 < stroke.points.length && pointCount < 11000; i += 2) {
        const x = Number(stroke.points[i]);
        const y = Number(stroke.points[i + 1]);
        if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= 10000 && y >= 0 && y <= 10000) {
          points.push(Math.round(x), Math.round(y));
          pointCount++;
        }
      }
      if (points.length >= 2) cleaned.push({points});
      if (pointCount >= 11000) break;
    }
    return cleaned;
  }

  function createPad(canvas, id, field, editable) {
    const key = `${id}-${field}`;
    let ink = editable ? draftFor(id)[field] : (received[id]?.[field] || []);
    if (!Array.isArray(ink)) ink = [];
    let ctx;
    let width = 1;
    let height = 1;
    let drawing = null;
    let activePointer = null;

    const strokeStyle = () => {
      ctx.strokeStyle = "#24424a";
      ctx.fillStyle = "#24424a";
      ctx.lineWidth = field === "answer" ? 2.8 : 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const pointXY = (x, y) => [x * width / 10000, y * height / 10000];

    function drawStroke(stroke) {
      if (!stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;
      const points = stroke.points;
      const [x0, y0] = pointXY(points[0], points[1]);
      if (points.length === 2) {
        ctx.beginPath();
        ctx.arc(x0, y0, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      for (let i = 2; i < points.length - 1; i += 2) {
        const [x, y] = pointXY(points[i], points[i + 1]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function redraw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      strokeStyle();
      for (const stroke of ink) drawStroke(stroke);
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx = canvas.getContext("2d", {alpha: true});
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    }

    const position = event => {
      const bounds = canvas.getBoundingClientRect();
      return [
        Math.min(10000, Math.max(0, Math.round((event.clientX - bounds.left) / bounds.width * 10000))),
        Math.min(10000, Math.max(0, Math.round((event.clientY - bounds.top) / bounds.height * 10000)))
      ];
    };

    function finish(event) {
      if (!drawing || event.pointerId !== activePointer) return;
      drawing = null;
      activePointer = null;
      updateDraft(id);
    }

    if (editable) {
      canvas.addEventListener("pointerdown", event => {
        if (drawing) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        activePointer = event.pointerId;
        canvas.setPointerCapture(event.pointerId);
        const [x, y] = position(event);
        drawing = { points: [x, y] };
        ink.push(drawing);
        strokeStyle();
        const [px, py] = pointXY(x, y);
        ctx.beginPath();
        ctx.arc(px, py, ctx.lineWidth / 2, 0, 2 * Math.PI);
        ctx.fill();
      });
      canvas.addEventListener("pointermove", event => {
        if (!drawing || event.pointerId !== activePointer) return;
        event.preventDefault();
        const [x, y] = position(event);
        const points = drawing.points;
        const previousX = points[points.length - 2];
        const previousY = points[points.length - 1];
        if (Math.abs(x - previousX) + Math.abs(y - previousY) < 6) return;
        if (points.length >= 16000) return;
        points.push(x, y);
        const [px, py] = pointXY(previousX, previousY);
        const [nx, ny] = pointXY(x, y);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      });
      canvas.addEventListener("pointerup", finish);
      canvas.addEventListener("pointercancel", finish);
      canvas.addEventListener("lostpointercapture", event => {
        if (drawing && event.pointerId === activePointer) finish(event);
      });
    }

    const controller = {
      setInk(value) {
        ink = cloneStrokes(value);
        if (editable) draftFor(id)[field] = ink;
        redraw();
      },
      undo() {
        if (!editable || !ink.length) return;
        ink.pop();
        redraw();
        updateDraft(id);
      },
      clear() {
        if (!editable || !ink.length) return;
        ink.length = 0;
        redraw();
        updateDraft(id);
      }
    };
    pads.set(key, controller);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return controller;
  }

  function submitQuestion(id) {
    const question = byId.get(id);
    const draft = draftFor(id);
    const revision = draft.revision;
    const submission = {
      type: "submission",
      id: `${id}-${Date.now()}-${Math.floor(Math.random() * 1e7)}`,
      questionId: id,
      kind: question.type,
      choice: question.type === "choice" && Number.isInteger(draft.choice) ? draft.choice : null,
      answer: question.type === "ink" ? cloneStrokes(draft.answer) : [],
      note: cloneStrokes(draft.note),
      revision,
      sentAt: Date.now()
    };
    pending[id] = submission;
    writeJSON(PENDING_KEY, pending);
    updateCardStatus(id);
    if (connection?.open) {
      connection.send(submission);
      toast(`${id}번 답안을 전송하고 있습니다.`);
    } else {
      toast("선생님과 연결되면 자동으로 답안이 전송됩니다.");
    }
  }

  function resendPending() {
    if (!connection?.open || IS_TEACHER) return;
    for (const id of Object.keys(pending)) {
      if (pending[id]?.type === "submission") connection.send(pending[id]);
      updateCardStatus(Number(id));
    }
  }

  function receiveSubmission(message) {
    const question = byId.get(message?.questionId);
    if (!question || message?.type !== "submission" || typeof message.id !== "string" || message.id.length > 90) return;
    if (message.kind !== question.type) return;
    const id = question.id;
    const clean = {
      id: message.id,
      questionId: id,
      kind: question.type,
      choice: Number.isInteger(message.choice) && message.choice >= 0 && message.choice < (question.options?.length || 0) ? message.choice : null,
      answer: cloneStrokes(message.answer),
      note: cloneStrokes(message.note),
      sentAt: Number.isFinite(Number(message.sentAt)) ? Number(message.sentAt) : Date.now()
    };
    const changed = received[id]?.id !== clean.id;
    if (!received[id] || received[id].sentAt <= clean.sentAt) {
      received[id] = clean;
      writeJSON(RECEIVED_KEY, received);
      if (question.type === "choice") updateChoices(id, clean.choice);
      else pads.get(`${id}-answer`)?.setInk(clean.answer);
      pads.get(`${id}-note`)?.setInk(clean.note);
      updateCardStatus(id);
      if (changed) {
        const card = cards.get(id)?.card;
        if (card) {
          card.classList.add("just-arrived");
          setTimeout(() => card.classList.remove("just-arrived"), 1500);
          card.scrollIntoView({behavior: "smooth", block: "start"});
        }
        toast(`${id}번 답안이 도착했습니다.`);
      }
    }
    if (connection?.open) connection.send({type: "receipt", questionId: id, id: message.id});
  }

  function receiveReceipt(message) {
    const id = message?.questionId;
    if (!byId.has(id) || !pending[id] || pending[id].id !== message.id) return;
    sent[id] = pending[id].revision;
    delete pending[id];
    writeJSON(SENT_KEY, sent);
    writeJSON(PENDING_KEY, pending);
    updateCardStatus(id);
    toast(`${id}번 답안이 선생님에게 전달되었습니다.`);
  }

  function attachTeacherConnection(conn) {
    if (connection && connection !== conn) connection.close();
    connection = conn;
    conn.on("open", () => setConnectionStatus("학생 연결됨", "online"));
    conn.on("data", receiveSubmission);
    conn.on("close", () => {
      if (connection === conn) { connection = null; setConnectionStatus("학생 연결 대기 중"); }
    });
    conn.on("error", () => {
      if (connection === conn) setConnectionStatus("연결 문제 발생", "error");
    });
  }

  function startTeacher() {
    const linkButton = document.getElementById("copy-link");
    if (!window.Peer) { setConnectionStatus("통신 라이브러리를 불러오지 못함", "error"); return; }
    peer = new Peer(undefined, {debug: 1});
    peer.on("open", teacherId => {
      const studentURL = new URL("student.html", window.location.href);
      studentURL.hash = `room=${encodeURIComponent(teacherId)}`;
      linkButton.disabled = false;
      linkButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(studentURL.toString());
          toast("학생 접속 링크가 복사되었습니다.");
        } catch {
          // 일부 브라우저가 클립보드를 제한하는 경우 URL을 직접 선택할 수 있게 합니다.
          const input = document.createElement("textarea");
          input.value = studentURL.toString();
          input.style.cssText = "position:fixed;left:-9999px;";
          document.body.append(input);
          input.select();
          const succeeded = document.execCommand("copy");
          input.remove();
          if (succeeded) toast("학생 접속 링크가 복사되었습니다.");
          else window.prompt("아래 링크를 학생에게 전달하세요.", studentURL.toString());
        }
      }, {once: false});
      setConnectionStatus("학생 연결 대기 중");
    });
    peer.on("connection", attachTeacherConnection);
    peer.on("error", error => {
      setConnectionStatus("연결 오류 · 페이지를 새로고침하세요", "error");
      console.warn("Teacher PeerJS error:", error?.type || error);
    });
    peer.on("disconnected", () => setConnectionStatus("서버 연결 복구 중", "error"));
  }

  function attachStudentConnection(conn) {
    connection = conn;
    conn.on("open", () => {
      setConnectionStatus("선생님 연결됨", "online");
      resendPending();
    });
    conn.on("data", message => {
      if (message?.type === "receipt") receiveReceipt(message);
    });
    conn.on("close", () => {
      if (connection !== conn) return;
      connection = null;
      setConnectionStatus("연결 재시도 중", "error");
      for (const q of QUESTIONS) updateCardStatus(q.id);
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connectStudent, 3400);
    });
    conn.on("error", () => {
      if (connection === conn) setConnectionStatus("연결 문제 · 재시도 중", "error");
    });
  }

  let teacherId = null;
  function connectStudent() {
    if (!peer || peer.destroyed || !teacherId) return;
    if (connection?.open) return;
    try {
      const conn = peer.connect(teacherId, {reliable: true, serialization: "json"});
      attachStudentConnection(conn);
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(() => {
        if (!conn.open && connection === conn) {
          connection = null;
          try { conn.close(); } catch { /* noop */ }
          setConnectionStatus("연결 대기 중 · 선생님 링크 확인", "error");
          reconnectTimeout = setTimeout(connectStudent, 4000);
        }
      }, 12000);
    } catch {
      setConnectionStatus("연결 실패 · 링크 확인", "error");
    }
  }

  function startStudent() {
    if (!window.Peer) { setConnectionStatus("통신 라이브러리를 불러오지 못함", "error"); return; }
    teacherId = new URLSearchParams(window.location.hash.slice(1)).get("room");
    if (!teacherId || !/^[A-Za-z0-9_-]{3,100}$/.test(teacherId)) {
      setConnectionStatus("선생님이 보내 준 학생 링크로 접속하세요", "error");
      return;
    }
    peer = new Peer(undefined, {debug: 1});
    peer.on("open", connectStudent);
    peer.on("error", error => {
      setConnectionStatus("연결 오류 · 학생 링크 다시 확인", "error");
      console.warn("Student PeerJS error:", error?.type || error);
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(connectStudent, 4000);
    });
    peer.on("disconnected", () => setConnectionStatus("서버 연결 복구 중", "error"));
  }

  for (const question of QUESTIONS) createCard(question);
  if (QUESTIONS.length !== 20) console.warn("현재 문제 수가 20문항이 아닙니다:", QUESTIONS.length);
  if (IS_TEACHER) startTeacher();
  else startStudent();
})();
