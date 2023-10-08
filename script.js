document.addEventListener("DOMContentLoaded", function () {
  let editIndex = null;
  // Initialize water tank
  const tank = document.getElementById("tank");
  const water = document.getElementById("water");
  const level = document.getElementById("level");
  let waterLevel = 0;
  let isDragging = false;

  function setWaterLevel(newLevel) {
    waterLevel = newLevel;
    water.style.height = `${waterLevel}%`;

    let levelText = "";
    if (waterLevel <= 30) levelText = "LL: Very Low";
    else if (waterLevel <= 50) levelText = "L: Low";
    else if (waterLevel <= 70) levelText = "N: Normal";
    else if (waterLevel <= 80) levelText = "H: High";
    else levelText = "HH: Very High";

    level.textContent = levelText;
  }

  tank.addEventListener("click", function (event) {
    const rect = tank.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const newLevel = 100 - (y / rect.height) * 100;
    setWaterLevel(newLevel);
  });

  tank.addEventListener("mousedown", function (event) {
    isDragging = true;
  });

  tank.addEventListener("mousemove", function (event) {
    if (!isDragging) return;
    const rect = tank.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const newLevel = 100 - (y / rect.height) * 100;
    setWaterLevel(newLevel);
  });

  tank.addEventListener("mouseup", function (event) {
    isDragging = false;
  });

  tank.addEventListener("mouseleave", function (event) {
    isDragging = false;
  });

  setWaterLevel(10);

  $("#ruleModal").on("hidden.bs.modal", function () {
    editIndex = null;
  });

  // localStorage.removeItem('rules');

  const defaultRules = JSON.stringify({
    rules: [
      {
        name: "Rule 1",
        thres: [
          { name: "Threshold 1", min: 1, max: 2 },
          { name: "Threshold 2", min: 3, max: 4 },
          { name: "Threshold 3", min: 5, max: 6 },
        ],
      },
      {
        name: "Rule 2",
        thres: [
          { name: "Threshold 1", min: 7, max: 8 },
          { name: "Threshold 2", min: 9, max: 10 },
          { name: "Threshold 3", min: 11, max: 12 },
        ],
      },
      {
        name: "Rule 3",
        thres: [
          { name: "Threshold 1", min: 13, max: 14 },
          { name: "Threshold 2", min: 15, max: 16 },
          { name: "Threshold 3", min: 17, max: 18 },
        ],
      },
    ],
  });

  const checkRule = localStorage.getItem("rules");
  if (checkRule == null) {
    localStorage.setItem("rules", defaultRules);
  }

  let storedData = JSON.parse(localStorage.getItem("rules") || defaultRules);
  console.log(storedData);
  let rules = storedData.rules;

  function saveRules() {
    localStorage.setItem("rules", JSON.stringify({ rules: rules }));
  }

  function renumberRules() {
    rules.forEach((rule, index) => {
      rule.number = index + 1;
    });
  }

  window.addThres = function () {
    const oldData = localStorage.getItem("rules");
    let oldRules = JSON.parse(oldData);
    let currentThres = oldRules["rules"][editIndex]["thres"];

    // Find the next available threshold number
    let nextNumber = 1;
    let existingNumbers = currentThres
      .map((thres) => {
        const match = thres.name.match(/Threshold (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .sort((a, b) => a - b);

    for (let i = 0; i < existingNumbers.length; i++) {
      if (existingNumbers[i] === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    // Add the new threshold
    currentThres.push({ name: `Threshold ${nextNumber}`, min: 0, max: 0 });

    oldRules["rules"][editIndex]["thres"] = currentThres;
    localStorage.setItem("rules", JSON.stringify(oldRules));

    generateCards(oldRules["rules"][editIndex]["name"], currentThres);

    console.log(currentThres);
  };

  window.saveRule = function () {
    const ruleNameInput = document.getElementById("ruleNameInput").value;
    const minInputs = document.querySelectorAll(".min-input");
    const maxInputs = document.querySelectorAll(".max-input");
    const thresNameInputs = document.querySelectorAll(".thresname-input");

    console.log("hellos");
    console.log(thresNameInputs);
    const thresholds = [];
    minInputs.forEach((minInput, index) => {
      const min = parseFloat(minInput.value);
      const max = parseFloat(maxInputs[index].value);
      const name = thresNameInputs[index].innerHTML;
      thresholds.push({ name, min, max });
    });

    const oldData = localStorage.getItem("rules");
    let oldRules = JSON.parse(oldData);
    oldRules["rules"][editIndex]["name"] = ruleNameInput;
    oldRules["rules"][editIndex]["thres"] = thresholds;

    localStorage.setItem("rules", JSON.stringify(oldRules));
    window.location.reload();
  };

  function generateCards(rulename, thresholds) {
    const sortableCards = document.getElementById("sortableCards");
    sortableCards.innerHTML = "";

    thresholds.forEach((threshold, index) => {
      const card = document.createElement("div");
      card.className = "card mt-3 position-relative";
      card.id = rulename + "-" + index;
      card.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="thresname-input">${threshold.name}</span>
          <button type="button" class="btn-close btn-close-red" aria-label="Close" onclick="deleteCard('${rulename}', ${index}, '${card.id}')"></button>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div style="width: 48%">
              <label for="minValueInput${index}">Min Value</label>
              <input type="number" class="form-control min-input" id="minValueInput${index}" value="${threshold.min}" />
            </div>
            <div style="width: 48%">
              <label for="maxValueInput${index}">Max Value</label>
              <input type="number" class="form-control max-input" id="maxValueInput${index}" value="${threshold.max}" />
            </div>
          </div>
        </div>
      `;
      sortableCards.appendChild(card);
    });
  }

  window.deleteCard = function (rulename, index, id) {
    const jsonData = localStorage.getItem("rules");
    let decodedData = JSON.parse(jsonData);

    const findRule = decodedData.rules.find((rule) => rule.name === rulename);

    if (findRule) {
      findRule.thres.splice(index, 1);
    }

    localStorage.setItem("rules", JSON.stringify(decodedData)); //kiv 0838 4/10/23

    const element = document.getElementById(id);
    element.parentNode.removeChild(element);
  };

  window.showModal = function (index) {
    editIndex = index;
    const rule = rules[index];
    const modal = document.getElementById("ruleModal");
    const ruleNameInput = document.getElementById("ruleNameInput");

    const storedRule = JSON.parse(localStorage.getItem(rule.name) || "{}");
    ruleNameInput.value = storedRule.name || rule.name;

    generateCards(ruleNameInput.value, storedRule.thres || rule.thres || []);

    $(modal).modal("show");
  };

  function loadRules() {
    const ruleTable = document.getElementById("ruleTable");
    ruleTable.innerHTML = "";
    rules.forEach((rule, index) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
            <td>${index + 1}</td>
            <td onclick="showModal(${index})" style="cursor: pointer;">${
        rule.name
      }</td>
            <td><button onclick="deleteRule(${index})"><span class='text-danger'>🗑️</span></button></td>
          `;
      ruleTable.appendChild(newRow);
    });
  }

  window.deleteRule = function (index) {
    const ruleToDelete = rules[index];
    localStorage.removeItem(ruleToDelete.name);
    rules.splice(index, 1);
    renumberRules();
    saveRules();
    loadRules();
  };

  window.makeEditable = function (element, index) {
    element.setAttribute("contenteditable", "true");
    element.focus();
    element.addEventListener(
      "blur",
      function () {
        element.removeAttribute("contenteditable");
        const newName = element.textContent;
        rules[index].name = newName;
        saveRules();
        loadRules();
      },
      { once: true }
    );
  };

  const addRuleButton = document.getElementById("addRule");
  addRuleButton.addEventListener("click", function () {
    let newRuleName = "New Rule";
    let counter = 1;

    while (rules.some((rule) => rule.name === newRuleName)) {
      newRuleName = `New Rule (${counter})`;
      counter++;
    }

    // Initialize with 3 sets of min and max values
    const initialThres = [
      { min: 0, max: 0 },
      { min: 0, max: 0 },
      { min: 0, max: 0 },
    ];

    const newRule = { name: newRuleName, thres: initialThres };
    rules.push(newRule);
    renumberRules();
    saveRules();
    loadRules();
  });

  loadRules();
});

$(function () {
  $("#sortableCards").sortable();
  $("#sortableCards").disableSelection();
});
