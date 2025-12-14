// CONFIG

const API_URL = "http://localhost:4000/api/expenses";
const token = localStorage.getItem("token");

// handle logout
const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// report
const reportBtn=document.getElementById("viewReportBtn")
reportBtn.addEventListener("click", () => {
  window.location.href = "report.html";
});

// TOKEN → DECODE USER ID

function getUserIdFromToken() {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId;
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

const tokenUserId = getUserIdFromToken();

//PREMIUM UI HANDLING

function showPremiumUI() {
  document.getElementById("premium-message").style.display = "block";
  document.getElementById("premiumBtn").style.display = "none";
  document.getElementById("leaderboardBtn").style.display = "block";
}

document.getElementById("leaderboardBtn").style.display = "none";

// CHECK PREMIUM STATUS FROM BACKEND

async function checkPremiumStatus() {
  try {
    const response = await fetch("http://localhost:4000/user/status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.isPremium === true) {
      localStorage.setItem("isPremium", "true");
      showPremiumUI();
    } else {
      localStorage.setItem("isPremium", "false");
    }
  } catch (err) {
    console.error("Premium status check failed:", err);
  }
}

// CASHFREE PAYMENT (Premium Purchase)

const cashfree = new Cashfree({ mode: "sandbox" });

document.getElementById("premiumBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(
      "http://localhost:4000/api/payments/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: 500,
          customerId: tokenUserId,
          customerPhone: "9999999999",
        }),
      }
    );

    const data = await response.json();

    if (!data.paymentSessionId) {
      alert("Failed to start payment");
      return;
    }

    cashfree.checkout({
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_self",
    });
  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment failed");
  }
});

//  LEADERBOARD (Only For Premium Users)

document
  .getElementById("leaderboardBtn")
  .addEventListener("click", async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/premium/showleaderboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      const container = document.getElementById("leaderboardContainer");
      container.innerHTML = `<h3>Leaderboard</h3>`;

      if (!Array.isArray(data)) {
        container.innerHTML += `<p>${data.message || "Access Denied"}</p>`;
        return;
      }

      data.forEach((user, index) => {
        container.innerHTML += `
        <p>${index + 1}. <strong>${user.name || "Unknown"}</strong> - ₹${
          user.totalExpense
        }</p>
      `;
      });
    } catch (err) {
      console.error("Leaderboard error", err);
    }
  });

//REDIRECT IF NOT LOGGED IN

if (!token) {
  alert("Please login first.");
  window.location.href = "login.html";
}

// EXPENSE FEATURES

const expenseForm = document.getElementById("expenseForm");
const expenseDisplay = document.getElementById("expenseDisplay");
const addBtn = document.getElementById("AddBtn");

// pagination
let currentPage = 1;
let limit = parseInt(localStorage.getItem("pageLimit")) || 10;
let totalPages = 1;

document.getElementById("pageLimitSelect").value = limit;

document.getElementById("pageLimitSelect").addEventListener("change", (e) => {
  limit = parseInt(e.target.value);

  // Store preference persistently
  localStorage.setItem("pageLimit", limit);

  currentPage = 1;  // reset to first page
  renderExpenses();
});



// Load all expenses
async function renderExpenses() {
  expenseDisplay.innerHTML = "";

  try {
    const response = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data=await response.json();
    const expenses = Array.isArray(data.expenses)?data.expenses:[];
    expenses.forEach((exp) => addExpenseToList(exp));
    // pagination
    totalPages=data.totalPages;
    paginationShow();
  } catch (err) {
    console.error("Error fetching expenses:", err);
  }
}


// Add / Update Expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("expName").value.trim();
  const amount = parseFloat(document.getElementById("amt").value);
  const note=document.getElementById("note").value.trim();


  if (!description || !amount || !note) {
    alert("Please fill all fields");
    return;
  }

  const editId = expenseForm.dataset.editId;

  if (editId) {
    const expenseData = { description, amount,note };
    await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(expenseData),
    });

    delete expenseForm.dataset.editId;
    addBtn.textContent = "Add";
  } else {
     await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description, amount,note }),
    });
       // Fetch updated count to determine last page
     const countRes = await fetch(`${API_URL}?page=1&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

     const countData = await countRes.json();
    totalPages = countData.totalPages;
     currentPage = totalPages;
  }
  expenseForm.reset();
  renderExpenses();
});

// async function sendExpenseToServer(expenseData, tempId) {
//   try {
//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(expenseData),
//     });

//     const savedExpense = await response.json();

//     updateCategory(tempId, savedExpense);
    
//   } catch (err) {
//     console.error("Error adding expense:", err);
//   }
// }

// function updateCategory(tempId, savedExpense) {
//   const element = document.querySelector(`[data-id="${tempId}"]`);
//   if (!element) return;

//   element.dataset.id = savedExpense.id;
//   element.querySelector(".categoryBadge").textContent = savedExpense.category;
// }


// Add Item To UI
function addExpenseToList(exp) {
  const li = document.createElement("li");
  li.dataset.id = exp.id; 

  li.className =
    "list-group-item d-flex justify-content-between align-items-center my-2 border p-2";

  li.innerHTML = `
    <div>
      <strong>${exp.description}</strong> - ₹${exp.amount}
      <span class="badge bg-secondary ms-2 categoryBadge">${exp.category}</span>
      <span class="badge bg-secondary ms-2 categoryBadge">${exp.note}</span>
    </div>
    <div>
      <button class="btn btn-warning btn-sm me-2"
        onclick="editExpense('${exp.id}', '${exp.description}', ${exp.amount}, '${exp.category}')">
        Edit
      </button>

      <button class="btn btn-danger btn-sm"
        onclick="deleteExpense('${exp.id}')">
        Delete
      </button>
    </div>
  `;
expenseDisplay.appendChild(li);

}


// Delete Expense
async function deleteExpense(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

    const response = await fetch(`${API_URL}?page=${currentPage}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
    const data = await response.json();
    if (data.expenses.length === 0 && currentPage > 1) {
    currentPage--;
  }
  
  renderExpenses();
}

// Edit Expense
function editExpense(id, description, amount,note) {
  document.getElementById("expName").value = description;
  document.getElementById("amt").value = amount;
  document.getElementById("note")=note;
  

  expenseForm.dataset.editId = id;
  addBtn.textContent = "Update";
}

function paginationShow(){
   document.getElementById("pageInfo").innerText = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("firstBtn").disabled = currentPage === 1;

  document.getElementById("nextBtn").disabled = currentPage === totalPages;
  document.getElementById("lastBtn").disabled = currentPage === totalPages;
}

// paginationbtn event
document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    renderExpenses();
  }
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderExpenses();
  }
});

document.getElementById("firstBtn").addEventListener("click", () => {
  currentPage = 1;
  renderExpenses();
});

document.getElementById("lastBtn").addEventListener("click", () => {
  currentPage = totalPages;
  renderExpenses();
});

//INITIAL LOAD

document.addEventListener("DOMContentLoaded", async () => {
  await checkPremiumStatus();
  renderExpenses();
});

