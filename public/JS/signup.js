const form=document.getElementById('signupform');

form.addEventListener('submit',async(event)=>{

    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
     if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
      }
    try {
        const response = await fetch("http://localhost:4000/user/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
          
          window.location.href = "login.html";
        } else {
          alert(data.message || "Signup failed. Try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Unable to connect to server. Please try again later.");
      } 
})