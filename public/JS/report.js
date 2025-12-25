
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

const tableBody = document.getElementById("reportTable");
const totalExpenseEl = document.getElementById("totalExpense");
const downloadBtn=document.getElementById("downloadBtn");


downloadBtn.addEventListener("click",()=>{
  if(downloadBtn.disabled)
  {
    alert("Only for Premium Users");
    return;
  }
  alert("Downloading is started!")
})



const API_BASE = "http://localhost:4000";

// Fetch all expenses for report
async function loadExpenseReport() {
  try {
    const res = await fetch(`${API_BASE}/api/expenses/report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.success) {
      alert("Failed to load report");
      return;
    }

    tableBody.innerHTML = "";
    let totalExpense = 0;

    data.expenses.forEach(exp => {
      if (!exp.isIncome) totalExpense += exp.amount;

      tableBody.innerHTML += `
        <tr>
          <td>${exp.createdAt.split("T")[0]}</td>
          <td>${exp.description}</td>
          <td>${exp.category}</td>
          <td class="text-danger">${!exp.isIncome ? "₹" + exp.amount : "-"}</td>
        </tr>
      `;
    });

    totalExpenseEl.innerText = `₹${totalExpense}`;

 
  } catch (error) {
    console.log("Error loading expense report:", error);
  }
}
async function checkPremiumStatus() {
  try {
    const response = await fetch(`${API_BASE}/user/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    downloadBtn.disabled = !data.isPremium;
    if(!downloadBtn.disabled)
    {
      downloadBtn.innerText="Download Report";
    }
  } catch (error) {
    console.error("Premium check failed", error);
  }
}


document.addEventListener("DOMContentLoaded", async () => {
  await loadExpenseReport();
  await checkPremiumStatus();
});
