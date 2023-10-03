document.addEventListener("DOMContentLoaded", function () {
  let editIndex = null;
  let ruleToDeleteIndex = null;
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
        name: "rule1",
        thres: [
          { min: 1, max: 2 },
          { min: 3, max: 4 },
          { min: 5, max: 6 },
        ],
      },
      {
        name: "rule2",
        thres: [
          { min: 7, max: 8 },
          { min: 9, max: 10 },
          { min: 11, max: 12 },
        ],
      },
      {
        name: "rule3",
        thres: [
          { min: 13, max: 14 },
          { min: 15, max: 16 },
          { min: 17, max: 18 },
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
    console.log("localStorage:", localStorage.getItem("rules"));
  }

  function renumberRules() {
    rules.forEach((rule, index) => {
      rule.number = index + 1;
    });
  }

  window.saveRule = function () {
    console.log("editIndex from saveRule: " + editIndex);
    const ruleNameInput = document.getElementById("ruleNameInput").value;
    const minInputs = document.querySelectorAll(".min-input");
    const maxInputs = document.querySelectorAll(".max-input");

    const thresholds = [];
    minInputs.forEach((minInput, index) => {
      const min = parseFloat(minInput.value);
      const max = parseFloat(maxInputs[index].value);
      thresholds.push({ min, max });
    });
    console.log(thresholds);
    console.log(ruleNameInput);

    const oldData = localStorage.getItem("rules");
    let oldRules = JSON.parse(oldData);
    oldRules["rules"][editIndex]["name"] = ruleNameInput;
    oldRules["rules"][editIndex]["thres"] = thresholds;

    localStorage.setItem("rules", JSON.stringify(oldRules));
    window.location.reload();
  };

  function generateCards(thresholds) {
    const sortableCards = document.getElementById("sortableCards");
    sortableCards.innerHTML = "";

    thresholds.forEach((threshold, index) => {
      const card = document.createElement("div");
      card.className = "card mt-3";
      card.innerHTML = `
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

  window.showModal = function (index) {
    editIndex = index;
    console.log("editIndex : " + editIndex);
    const rule = rules[index];
    const modal = document.getElementById("ruleModal");
    const ruleNameInput = document.getElementById("ruleNameInput");

    const storedRule = JSON.parse(localStorage.getItem(rule.name) || "{}");
    ruleNameInput.value = storedRule.name || rule.name;

    generateCards(storedRule.thres || rule.thres || []);

    $(modal).modal("show");
  };

  function loadRules() {
    const ruleTable = document.getElementById("ruleTable");
    ruleTable.innerHTML = "";
    rules.forEach((rule, index) => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
            <td>${index + 1}</td>
            <td onclick="showModal(${index})" style="cursor: pointer;">${rule.name}</td>
            <td><button onclick="deleteRule(${index})"><span class='text-danger'>🗑️</span></button></td>
          `;
      ruleTable.appendChild(newRow);
    });
  }


  window.deleteRule = function (index) {
    console.log("Delete rule function called.");
    const ruleToDelete = rules[index];
    localStorage.removeItem(ruleToDelete.name);
    console.log(`Deleted ${ruleToDelete.name} from LocalStorage`);
    rules.splice(index, 1);
    renumberRules();
    saveRules();
    loadRules();
  };
  

  //   window.deleteRule = function (index) {
  //     const ruleToDelete = rules[index];
  //     $("#deleteModal").modal("show");

  //     document
  //       .getElementById("confirmDelete")
  //       .addEventListener("click", function () {
  //         localStorage.removeItem(ruleToDelete.name);
  //         console.log(`Deleted ${ruleToDelete.name} from LocalStorage`);
  //         rules.splice(index, 1);
  //         renumberRules();
  //         saveRules();
  //         loadRules();
  //         $("#deleteModal").modal("hide");
  //       });
  //   };

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
