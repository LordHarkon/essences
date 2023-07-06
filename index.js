const essenceContainer = document.querySelector("#essenceContainer");
const searchInput = document.querySelector("#searchInput");
const resultsSpan = document.querySelector("#results");
const searchBoth = document.querySelector("#searchBoth");
const searchTitle = document.querySelector("#searchTitle");
const searchDescription = document.querySelector("#searchDescription");
const showMore = document.querySelector("#showMore");

let allEssences = [];
let shownEssences = 20;
let shownStep = 20;
let searchWithin = "both";
let found = 0;

fetch("./essences.json")
  .then(async (response) => {
    const essences = await response.json();
    allEssences = essences;
    found = essences.length;

    for (let i = 0; i < 20; i++) {
      essenceContainer.innerHTML += essenceCard(essences[i]);
    }

    addCopyButtons();
  })
  .then((json) => console.log(json));

function essenceCard(essence) {
  return `
    <div class="border border-white/20 px-2 py-1 hover:bg-slate-900 hover:border-white/40 relative">
      <h3 class="font-semibold text-lg">${essence.name}</h3>
      <p class="italic">${essence.description[0]}</p>
      <ul class="list-disc ml-5">
        ${essence.description
          .filter((e, i) => (i === 0 ? false : true))
          .map((ed) => `<li>${ed}</li>`)
          .join("")}
      </ul>
      <div id="copy-${
        essence.id
      }" class="absolute top-0 right-0 px-1 pb-1 pt-0.5 m-1 border border-white/20 hover:border-white/40 group"><i class="bi bi-clipboard text-zinc-300 group-hover:text-white"></i></div>
    </div>
  `;
}

function resetShown(length = 20) {
  shownEssences = length < 20 ? (length === 1 ? 1 : length - 1) : 20;
}

function addCopyButtons() {
  const copyButtons = Array.from(document.querySelectorAll("[id^=copy-]"));
  console.log(copyButtons);
  copyButtons.forEach((copyButton) => {
    copyButton.onclick = function () {
      const id = copyButton.id.replace("copy-", "");
      const essence = allEssences.find((es) => es.id === id);

      console.log(`Clicked copy for ${essence.name} (${essence.id})`);

      const text = `**${essence.name}**
*${essence.description[0]}
${essence.description
  .filter((e, i) => (i === 0 ? false : true))
  .map((ed) => `- ${ed}`)
  .join("\n")}`;

      navigator.clipboard.writeText(text);
    };
  });
}

function search(value = "", reset = true) {
  const foundEssences = allEssences.filter((elem) => {
    switch (searchWithin) {
      case "both": {
        const both = elem.name.toLowerCase() + " " + elem.description.join(" ").toLowerCase();
        return both.includes(value.toLowerCase());
      }
      case "title": {
        return elem.name.toLowerCase().includes(value.toLowerCase());
      }
      case "description": {
        return elem.description.join(" ").toLowerCase().includes(value.toLowerCase());
      }
      default:
        return true;
    }
  });
  found = foundEssences.length;

  if (reset) resetShown(found);

  if (found <= 20) showMore.hidden = true;
  else showMore.hidden = false;

  resultsSpan.innerHTML = `Found ${found} results. Showing ${shownEssences} result.`;
  essenceContainer.innerHTML = "";
  for (let i = 0; i <= (shownEssences === 1 ? 1 : shownEssences - 1); i++) {
    essenceContainer.innerHTML += essenceCard(foundEssences[i]);
  }

  addCopyButtons();
}

searchInput.addEventListener("input", (e) => {
  search(e.target.value);
});

searchBoth.onclick = function () {
  searchWithin = "both";
  search(searchInput.value);
};

searchTitle.onclick = function () {
  searchWithin = "title";
  search(searchInput.value);
};

searchDescription.onclick = function () {
  searchWithin = "description";
  search(searchInput.value);
};

showMore.onclick = function () {
  if (found > shownEssences) {
    if (shownEssences + shownStep >= found) shownEssences = found;
    else shownEssences += shownStep;

    search(searchInput.value, false);
  }
  if (shownEssences === found) showMore.hidden = true;
};
