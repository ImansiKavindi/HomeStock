import React, { useState } from 'react';

const AddMealPlan = () => {
    const [mealName, setMealName] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Meal Plan Added:", { mealName, servings, ingredients });
    };

    return (
        <div>
            <h2>Add Meal Plan</h2>
            <form onSubmit={handleSubmit}>
                <label>Meal Name:</label>
                <input type="text" value={mealName} onChange={(e) => setMealName(e.target.value)} required />

                <label>Servings:</label>
                <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} required />

                <label>Ingredients:</label>
                <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} required />

                <button type="submit">Add Meal Plan</button>
            </form>
        </div>
    );
};

export default AddMealPlan;


//Allows users to enter meal details (name, servings, ingredients).
// Displays an alert when a meal is added (Later, we will connect it to the database).