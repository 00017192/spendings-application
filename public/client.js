const createNewExpense = document.querySelector(".expenses-add-new-expense-button");
const deleteBtns = document.querySelectorAll(".delete-btn");
const updateBtns = document.querySelectorAll(".update-btn");
const form = document.getElementById("form-update");

// Add event listener on create new expense and redirect
createNewExpense?.addEventListener("click", () => {
  window.location = "/expenses/create"
})

// Add event listener on every delete button
deleteBtns?.forEach((btn) => {
    btn.addEventListener("click", (e) => {
    	fetch("/expenses/delete", {
    		method: "DELETE",
    		headers: {
    			"Content-Type": "application/json"
    		},
    		body: JSON.stringify({ id: btn.dataset.id })
    	})
    	.then(res => res.json())
    	.then(data => {
				// Refresh the page
    		if (data.deleted) {
					location.reload()
				}

    	})
    })
})

// Add event listener on every update button
updateBtns?.forEach((btn) => {
    btn.addEventListener("click", () => {
    	window.location = `/expenses/update/${btn.dataset.id}`
    })
})

// Add event listener on form for new expense creation
form?.addEventListener("submit", (e) => {
    e.preventDefault()

    let formData = new FormData(form)

    fetch(`/expenses/update/${form.dataset.id}`, {
    	method: "PUT",
    	headers: {
    		"Content-Type": "application/json"
    	},
    	body: JSON.stringify({ data: Object.fromEntries(formData)})
    })
    .then(res => res.json())
    .then(() => {
    	window.location = "/expenses"
    })
})