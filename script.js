document.addEventListener('DOMContentLoaded', function() {
    const sheets = [];
    let currentSheet = '';
    let dishes = [];
    
    const fileInput = document.getElementById('fileInput');
    const dishModal = document.getElementById('dishModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeModalBtn = document.querySelector('.close');
    const dishForm = document.getElementById('dishForm');
    const dishId = document.getElementById('dishId');
    const dishName = document.getElementById('name');
    const dishCuisine = document.getElementById('cuisine');
    const dishCalories = document.getElementById('calories');
    const dishIngredients = document.getElementById('ingredients');
    const dishRecipe = document.getElementById('recipe');
    const dishTableBody = document.querySelector('#dishTable tbody');
    const sheetNav = document.getElementById('sheetNav');
    const currentSheetTitle = document.getElementById('currentSheetTitle');

    fileInput.addEventListener('change', handleFile);

    closeModalBtn.addEventListener('click', function() {
        closeModal();
    });

    dishForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addDish();
        closeModal();
    });

    function handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            workbook.SheetNames.forEach(sheetName => {
                if (sheetName !== 'Столы(диеты)') {
                    sheets.push(sheetName);
                }
            });

            currentSheet = sheets[0];
            updateNavigation(workbook);
            fetchData(currentSheet, workbook);
        };
        reader.readAsArrayBuffer(file);
    }

    function updateNavigation(workbook) {
        sheetNav.innerHTML = '';
        sheets.forEach(sheet => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.sheet = sheet;
            a.textContent = sheet;
            a.addEventListener('click', function(event) {
                event.preventDefault();
                currentSheet = this.dataset.sheet;
                currentSheetTitle.textContent = currentSheet;
                fetchData(currentSheet, workbook);
            });
            li.appendChild(a);
            sheetNav.appendChild(li);
        });
    }

    function fetchData(sheetName, workbook) {
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rows.length) return;

        dishes = rows.slice(1).map((row, index) => ({
            id: index + 1,
            name: row[0],
            cuisine: row[1],
            calories: row[2],
            ingredients: row[3],
            recipe: row[4]
        }));
        renderDishes();
    }

    function openModal(title) {
        modalTitle.textContent = title;
        dishModal.style.display = 'block';
    }

    function closeModal() {
        dishModal.style.display = 'none';
        resetForm();
    }

    function resetForm() {
        dishId.value = '';
        dishName.value = '';
        dishCuisine.value = '';
        dishCalories.value = '';
        dishIngredients.value = '';
        dishRecipe.value = '';
    }

    function addDish() {
        const dish = {
            id: dishes.length ? dishes[dishes.length - 1].id + 1 : 1,
            name: dishName.value,
            cuisine: dishCuisine.value,
            calories: dishCalories.value,
            ingredients: dishIngredients.value,
            recipe: dishRecipe.value
        };
        dishes.push(dish);
        renderDishes();
    }

    function renderDishes() {
        dishTableBody.innerHTML = '';
        dishes.forEach((dish, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dish.id}</td>
                <td>${dish.name}</td>
                <td>${dish.cuisine}</td>
                <td>${dish.calories}</td>
                <td>${dish.ingredients}</td>
                <td>${dish.recipe}</td>
                <td>
                    <button class="edit-btn" onclick="editDish(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteDish(${index})">Delete</button>
                </td>
            `;
            dishTableBody.appendChild(row);
        });
    }

    window.editDish = function(index) {
        const dish = dishes[index];
        dishId.value = dish.id;
        dishName.value = dish.name;
        dishCuisine.value = dish.cuisine;
        dishCalories.value = dish.calories;
        dishIngredients.value = dish.ingredients;
        dishRecipe.value = dish.recipe;
        openModal('Edit Dish');
    };

    window.deleteDish = function(index) {
        dishes.splice(index, 1);
        renderDishes();
    };
});
