
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

const tableBody = document.getElementById("reportTable");
const totalExpenseEl = document.getElementById("totalExpense");
const downloadBtn=document.getElementById("downloadBtn");
const downloadedFilesList=document.getElementById("downloadedFilesList");

const API_BASE = "http://localhost:4000";


downloadBtn.addEventListener("click",async()=>{
  try {
      const response= await fetch(`${API_BASE}/api/expenses/download`,{
    headers:{
      Authorization:`Bearer ${token}`,
    },
  });
      const data=await response.json();
        if(!data.success)
        {
          alert("Download failed");
          return;
        } 
    const a=document.createElement("a");
    a.href=data.fileURL;
    a.download="ExpenseReport.txt";
    document.body.appendChild(a);
    a.click();
       document.body.removeChild(a);
  }
  catch (error) {
     console.error("Download error", error);
  }

})





// Fetch all expenses for report
async function loadExpenseReport() {
  try {
    const res = await fetch(`${API_BASE}/api/expenses/report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Expense report data:", data);
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

async function loadDownloadedFiles() {
  try {
    const response = await fetch(`${API_BASE}/premium/downloadedfiles`, {  
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!data.success) {
      alert("Failed to load downloaded files");
      return;
    } 

    downloadedFilesList.innerHTML = "";
    data.files.forEach(file => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");     
      link.href = file.fileURL;
      link.innerText = `Downloaded on: ${new Date(file.createdAt).toLocaleString()}`;
      link.target = "_blank"; 
      listItem.appendChild(link);
      downloadedFilesList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error loading downloaded files:", error);
  }   
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadExpenseReport();
  await checkPremiumStatus();
  await loadDownloadedFiles();
});
