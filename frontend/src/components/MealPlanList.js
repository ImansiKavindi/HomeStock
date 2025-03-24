import React, { useState } from 'react';

const MealPlanList = () => {
    const [mealPlans, setMealPlans] = useState([
        { id: 1, mealName: "Pasta", servings: 2, ingredients: "Pasta, Tomato Sauce" },
        { id: 2, mealName: "Omelette", servings: 1, ingredients: "Eggs, Cheese, Salt" }
    ]);

    return (
        <div>
            <h2>Meal Plan List</h2>
            <ul>
                {mealPlans.map(meal => (
                    <li key={meal.id}>
                        <strong>{meal.mealName}</strong> - Servings: {meal.servings} <br />
                        Ingredients: {meal.ingredients}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MealPlanList;

// Displays a list of meal plans