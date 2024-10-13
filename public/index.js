import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";
import firebaseConfig from "./firebaseConfig.js";


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const date = new Date();
const formattedDate = date.toLocaleDateString('en-IN');
document.getElementById("currentDate").innerText = `Current Date: ${formattedDate}`;

const addBtn = document.getElementById("add");
const cards = document.getElementById("cards");
const username = localStorage.getItem('username');

if (!username) {
    window.location.href = 'login.html';
} else {
    const expenseNameInput = document.getElementById('expenseNameInput');
    const amountSpentInput = document.getElementById("amountSpentInput");

    addBtn.addEventListener("click", handleAdd);

    function handleAdd(event) {
        event.preventDefault(); // Prevent default form submission
        if (expenseNameInput.value === "" || amountSpentInput.value === "") {
            alert("Please enter necessary required fields");
            return;
        }

        const expenseName = expenseNameInput.value.trim();
        const amountSpent = amountSpentInput.value.trim();
        const expenseRef = ref(db, `expenses/${username}/${Date.now()}`);
        
        set(expenseRef, {
            expenseName,
            amountSpent,
            date: formattedDate
        }).then(() => {
            displayExpenses();
            expenseNameInput.value = ""; // Clear input
            amountSpentInput.value = ""; // Clear input
        }).catch((error) => {
            console.error("Error adding expense: ", error);
        });
    }

    function displayExpenses() {
        const userExpensesRef = ref(db, `expenses/${username}`);
        get(child(userExpensesRef, '/')).then((snapshot) => {
            if (snapshot.exists()) {
                const expenses = snapshot.val();
                cards.innerHTML = ''; // Clear previous content
                const expensesByDate = {};
    
                Object.values(expenses).forEach((expense) => {
                    if (!expensesByDate[expense.date]) {
                        expensesByDate[expense.date] = [];
                    }
                    expensesByDate[expense.date].push(expense);
                });
    
                Object.keys(expensesByDate).forEach((date) => {
                    const card = document.createElement("div");
                    card.classList.add("day-card");
    
                    const dateHeader = document.createElement("h4");
                    dateHeader.innerText = date;
                    card.appendChild(dateHeader);
    
                    const expenseList = document.createElement("ul");
                    let totalSpent = 0; // Initialize total spent for the day
    
                    expensesByDate[date].forEach((expense) => {
                        const listItem = document.createElement("li");
                        listItem.innerText = `${expense.expenseName} - ₹${expense.amountSpent}`;
                        expenseList.appendChild(listItem);
                        totalSpent += parseFloat(expense.amountSpent); // Add to total spent
                    });
    
                    card.appendChild(expenseList);
    
                    const totalSpentElement = document.createElement("p");
                    totalSpentElement.innerText = `Total Spent: ₹${totalSpent.toFixed(2)}`; // Display total spent
                    card.appendChild(totalSpentElement);
    
                    cards.appendChild(card);
                });
            } else {
                cards.innerHTML = "No expenses found";
            }
        }).catch((error) => {
            console.error("Error fetching expenses: ", error);
        });
    }
    
    

    displayExpenses(); 
}

