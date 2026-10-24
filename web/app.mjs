import { asBytes, verifyInBrowser } from "./verify.mjs";

const $ = (id) => document.getElementById(id);
const translations = new Map();
for (const element of document.querySelectorAll("[data-ko]"))
  translations.set(element, element.innerHTML);
let korean = false;
let examples = [];
let active;
let result;
let originalMaterial;
let originalPolicy;

function note(message, kind = "notice") {
  const p = document.createElement("p");
  p.className = `badge ${kind}`;
  p.textContent = message;
  $("result").replaceChildren(p);
}

function display(data) {
  result = data;
  $("download").disabled = false;
  const badge = document.createElement("p");
  badge.className = `badge ${data.consistent ? "pass" : "fail"}`;
  badge.textContent = data.consistent
    ? korean
      ? "기록이 일치함 · 수행 사실은 미확인"
      : "RECEIPT CONSISTENT · authenticity unverified"
    : korean
      ? "검사 실패 · 근거를 확인하세요"
      : "CHECKS FAILED · inspect the evidence";
  const list = document.createElement("ul");
  list.className = "findings";
  for (const finding of data.findings) {
    const item = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = finding.code;
    item.append(
      code,
      document.createTextNode(
        ` — ${finding.message}${finding.check_id ? ` (${finding.check_id})` : ""}`,
      ),
    );
    list.append(item);
  }
  const extra = document.createElement("p");
  extra.className = "small muted";
  extra.textContent = korean
    ? `의미 검증: 수행하지 않음 · ${data.synthetic ? "합성 기록" : "불러온 기록"}`
    : `Semantic review: not performed · ${data.synthetic ? "synthetic record" : "loaded record"}`;
  $("result").replaceChildren(badge, list, extra);
}

function inputContext() {
  const texts = JSON.parse($("artifacts").value);
  if (
    texts === null ||
    typeof texts !== "object" ||
    Array.isArray(texts) ||
    Object.values(texts).some((value) => typeof value !== "string")
  )
    throw new Error(
      "Artifacts must be a JSON object mapping plain filenames to text.",
    );
  if (
    Object.keys(texts).length > 1000 ||
    Object.keys(texts).some(
      (name) => !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(name),
    )
  )
    throw new Error(
      "Artifact names must be plain filenames, at most 1000 files.",
    );
  const artifacts = Object.fromEntries(
    Object.entries(texts).map(([name, text]) => [name, asBytes(text)]),
  );
  const materialBytes = originalMaterial ?? asBytes($("material").value);
  const policyBytes = originalPolicy ?? asBytes($("policy").value);
  const buffers = [
    asBytes($("receipt").value),
    materialBytes,
    policyBytes,
    ...Object.values(artifacts),
  ];
  if (
    buffers.some((bytes) => bytes.byteLength > 512 * 1024) ||
    buffers.reduce((n, bytes) => n + bytes.byteLength, 0) > 8 * 1024 * 1024
  )
    throw new Error("Maximum 512 KiB per input and 8 MiB total.");
  return {
    receipt: JSON.parse($("receipt").value),
    context: {
      materialBytes,
      policyBytes,
      artifacts,
      now: active?.now ?? Date.now(),
    },
  };
}

async function inspect() {
  $("verify").disabled = true;
  $("download").disabled = true;
  result = undefined;
  try {
    const { receipt, context } = inputContext();
    display(await verifyInBrowser(receipt, context));
  } catch (error) {
    note(`INPUT ERROR — ${error.message}`, "fail");
  } finally {
    $("verify").disabled = false;
  }
}

async function selectExample() {
  active = examples.find((item) => item.id === $("case").value);
  if (!active) return;
  $("lesson").textContent = active.lesson;
  $("clock").textContent =
    `Synthetic fixture clock: ${new Date(active.now).toISOString()}`;
  $("material").value = active.material;
  $("policy").value = active.policy;
  $("receipt").value = JSON.stringify(active.receipt, null, 2);
  $("artifacts").value = JSON.stringify(active.artifacts, null, 2);
  originalMaterial = asBytes(active.material);
  originalPolicy = asBytes(active.policy);
  await inspect();
}

async function readTextFile(input) {
  const file = $(input).files[0];
  if (!file) throw new Error(`Choose ${input.replace("-file", "")} first.`);
  if (file.size > 512 * 1024) throw new Error("Maximum 512 KiB per file.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  return {
    bytes,
    text: new TextDecoder("utf-8", { fatal: true }).decode(bytes),
  };
}

$("verify").addEventListener("click", inspect);
$("case").addEventListener("change", selectExample);
$("reset").addEventListener("click", selectExample);
$("material").addEventListener("input", () => {
  originalMaterial = undefined;
});
$("policy").addEventListener("input", () => {
  originalPolicy = undefined;
});
for (const id of ["material", "policy", "receipt", "artifacts"])
  $(id).addEventListener("input", () => {
    result = undefined;
    $("download").disabled = true;
    note(
      korean
        ? "내용이 바뀌었습니다. 다시 검사하세요."
        : "Inputs changed. Run the checks again.",
    );
  });
$("language").addEventListener("click", () => {
  korean = !korean;
  document.documentElement.lang = korean ? "ko" : "en";
  for (const [element, english] of translations) {
    if (korean)
      element.textContent = element.dataset.ko.replaceAll("\\n", "\n");
    else element.innerHTML = english;
  }
  $("language").textContent = korean ? "English" : "한국어";
  if (result) display(result);
});
$("local").addEventListener("click", async () => {
  result = undefined;
  $("download").disabled = true;
  try {
    const material = await readTextFile("material-file");
    const policy = await readTextFile("policy-file");
    const receipt = await readTextFile("receipt-file");
    const artifacts = Object.create(null);
    const files = Array.from($("artifact-files").files);
    if (files.length > 1000) throw new Error("Too many artifacts.");
    for (const file of files) {
      if (Object.hasOwn(artifacts, file.name))
        throw new Error("Duplicate artifact filenames.");
      if (file.size > 512 * 1024)
        throw new Error("Maximum 512 KiB per artifact.");
      artifacts[file.name] = new TextDecoder("utf-8", { fatal: true }).decode(
        await file.arrayBuffer(),
      );
    }
    active = undefined;
    $("lesson").textContent = korean
      ? "내 파일 · 현재 시각 기준"
      : "Your files · checked at the current clock";
    $("clock").textContent =
      "Current clock · raw uploaded material/policy bytes preserved until edited";
    $("material").value = material.text;
    $("policy").value = policy.text;
    $("receipt").value = receipt.text;
    $("artifacts").value = JSON.stringify(artifacts, null, 2);
    originalMaterial = material.bytes;
    originalPolicy = policy.bytes;
    await inspect();
  } catch (error) {
    note(`INPUT ERROR — ${error.message}`, "fail");
  }
});
$("download").addEventListener("click", () => {
  if (!result) return;
  const blob = new Blob(
    [
      JSON.stringify(
        { ...result, exported_at: new Date().toISOString() },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "review-evidence-result.json";
  link.click();
  URL.revokeObjectURL(url);
});

try {
  if (!crypto.subtle)
    throw new Error("Web Crypto requires HTTPS or localhost.");
  const response = await fetch(new URL("./fixtures.json", import.meta.url));
  if (!response.ok) throw new Error(`Cannot load examples: ${response.status}`);
  examples = await response.json();
  $("case").replaceChildren(
    ...examples.map((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.id;
      return option;
    }),
  );
  $("case").disabled = false;
  $("verify").disabled = false;
  await selectExample();
} catch (error) {
  note(
    `Unable to start — ${error.message}. Serve this folder over HTTPS or localhost.`,
    "fail",
  );
}
