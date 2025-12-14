const token=localStorage.getItem("token");

// Redirect not logged in
if (!token) {
  alert("Please login first");
  window.location.href = "login.html";
}

const table=document.getElementById("reportTable");
const downloadBtn=getElementById("downloadBtn");

let isPremiumUser = false;

// check for premium user
async function checkPremiumStatus() {
  try {
    const res = await fetch("http://localhost:4000/user/status", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.isPremium) {
      isPremiumUser = true;
      downloadBtn.classList.remove("disabled");
    }
  } catch (err) {
    console.log("Error: ", err);
  }
}

// expense

async function loadReport(){
    try {
        const response=await fetch("http://localhost:4000/api/expenses",{
            headers:{Authorization:`Bearer ${token}`}
        });
        const data=await response.json();
        let totalExpense=0;
        table.innerHTML="";

        data.forEach(exp=>{
            totalExpense+=exp.amount;
            const row=`
                 <tr>
                 <td>${exp.createdAt?.split("T")[0] || "-"}</td>
                 <td>${exp.description}</td>
                 <td>${exp.category}</td>
                 <td class="text-success">${exp.isIncome?"₹" + exp.amount: "-" }</td>
                 <td class="text-danger">${!exp.isIncome?"₹" + exp.amount:"-" }</td>
                 </tr>

            `
            table.innerHTML+=row;
        });
        document.getElementById("totalExpense").innerText = `₹${totalExpense}`;
        
    } catch (error) {
        console.log("Error loading report:", err);
    }
}

// downlaodbtn for premium user
downloadBtn.addEventListner("click",()=>{
    if(!isPremiumUser)
    {
        alert("Only for Premium users")
        return;
    }
    alert("Downloaded");
});

document.addEventListener("DOMContentLoaded",async()=>{
    await checkPremiumStatus();
    await loadReport();
})