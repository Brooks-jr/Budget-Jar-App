// =============================================
// -          BUDGET JAR | BUDGET APP 

// - 02.11.2018
// - jeff brooks *github.com/Brooks-jr*
// =============================================


// MODULES: create modules to keep pieces of code that are related, together, inside of seperate independant and organized units. 
// inside the modules will be private variables and functions only accessable inside of module so other code can't override it. 
// DATA INCAPSULATION allows us to hide implementation details of a module from the outside scope so we only expose a public    interface, aka API 
// public methods allows other modules to access them.
// ============================================================================================
// ============================================================================================



// =============================================
// -          BUDGET CONTROLLER
// =============================================
var budgetController = (function () {

    // exspense constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    // income constructor
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // calculate total values
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    // store data
    var data = {

        allItems: {
            expense: [],
            income: []
        },

        totals: {
            expense: 0,
            income: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;

            // create item id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create item based on type. either income or expense
            if (type === 'expense') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'income') {
                newItem = new Income(ID, desc, val);
            }

            // push item into appropriate data storage
            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function (type, id) {
            var idArr, index;

            idArr = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = idArr.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // total income and total expenses
            calculateTotal('income');
            calculateTotal('expense');

            // final budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;

            // percentage of income put into expenses
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.expense.forEach(function (current) {
                current.calculatePercentage(data.totals.income);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.expense.map(function (current) {
                return current.getPercentage();
            });

            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        }
    };
})();



// =============================================
// -             UI CONTROLLER
// =============================================
var uiController = (function () {

    // store DOM classes and IDs for querying
    var DOMQueries = {
        inputType: '.add-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputButton: '.add-button',
        incomeList: '.income-list',
        expensesList: '.expenses-list',
        budgetDisplay: '.budget-value',
        incomeDisplay: '.budget-income-value',
        expenseDisplay: '.budget-expenses-value',
        percentageDisplay: '.budget-expenses-percentage',
        container: '.container',
        expensePercentage: '.item-percentage',
        date: '.budget-date'

    };

    // format numbers
    var formatNumber = function (number) {
        var splitNumber, int, decimal;

        number = Math.abs(number);
        number = number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

        splitNumber = number.split('.');
        int = splitNumber[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + int.substr(int.length - 3, 3);
        }
        decimal = splitNumber[1];

        return int + '.' + decimal;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMQueries.inputType).value,
                description: document.querySelector(DOMQueries.inputDescription).value,
                value: parseFloat(document.querySelector(DOMQueries.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            // string of html with placeholder %text%
            if (type === 'income') {
                element = DOMQueries.incomeList;

                html = '<div class="item clearfix" id="income-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">+ <sup class="small">$</sup>%value%</div><div class="item-delete"><button class="item-delete-button"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'expense') {
                element = DOMQueries.expensesList;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">- <sup class="small">$</sup>%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-delete-button"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder %text% with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));

            // insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (elementID) {
            var element = document.getElementById(elementID);

            element.parentNode.removeChild(element);
        },

        // clear input fields after a submission
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMQueries.inputDescription + ', ' + DOMQueries.inputValue);

            // converts querySelectorAll string into an array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (currentElement, index, array) {
                currentElement.value = '';
            });

            // reset cursor back to first input field
            fieldsArr[0].focus();

        },

        displayBudget: function (object) {

            if (object.budget < 0) {
                document.querySelector(DOMQueries.budgetDisplay).textContent = '- $' + formatNumber(object.budget);
            } else if (object.budget > 0) {
                document.querySelector(DOMQueries.budgetDisplay).textContent = '+ $' + formatNumber(object.budget);
            } else {
                document.querySelector(DOMQueries.budgetDisplay).textContent = '$' + formatNumber(object.budget);
            };

            document.querySelector(DOMQueries.incomeDisplay).textContent = '+ $' + formatNumber(object.totalIncome);
            document.querySelector(DOMQueries.expenseDisplay).textContent = '- $' + formatNumber(object.totalExpense);

            if (object.percentage > 0) {
                document.querySelector(DOMQueries.percentageDisplay).textContent = object.percentage + '%';
            } else {
                document.querySelector(DOMQueries.percentageDisplay).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var queryPercentages = document.querySelectorAll(DOMQueries.expensePercentage);

            nodeListForEach(queryPercentages, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        // display current month and year
        displayDate: function () {
            var now, year, month, monthsArr;

            now = new Date();

            monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMQueries.date).textContent = monthsArr[month] + ' ' + year;
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMQueries.inputType + ',' +
                DOMQueries.inputDescription + ',' +
                DOMQueries.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('expense');
            });

            document.querySelector(DOMQueries.inputButton).classList.toggle('red');
        },

        // make DOMQueries public
        getDOMQueries: function () {
            return DOMQueries;
        }
    };

})();



// =============================================
// -            GLOBAL CONTROLLER
// =============================================
var controller = (function (budget, ui) {

    // store event listeners
    var setEventListeners = function () {

        var DOM = uiController.getDOMQueries();

        //UI add button click event
        document.querySelector(DOM.inputButton).addEventListener('click', addNewItem);

        // call addNewItem function if enter key is pressed instead of UI add button
        document.addEventListener('keypress', function (event) {
            if (event.which === 13 || event.keyCode === 13) {
                addNewItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', uiController.changedType);
    };

    // update budget
    var updateBudget = function () {

        // calculate budget
        budgetController.calculateBudget();

        // return budget
        var budget = budgetController.getBudget();

        // display budget to UI
        uiController.displayBudget(budget);
    };

    // update percentages
    var updatePercentages = function () {

        // calculate percentage
        budgetController.calculatePercentages();

        // get percetage from budget controller
        var percentages = budgetController.getPercentages();

        // update UI
        uiController.displayPercentages(percentages);
    };

    // creating new item
    var addNewItem = function () {
        var input, newItem;

        // get input data
        input = uiController.getInput();

        // check for empty input fields and a 0 value
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // add item to budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);

            // add item to ui controller
            uiController.addListItem(newItem, input.type);

            // clear input fields after adding item
            uiController.clearFields();

            // update budget
            updateBudget();

            // update percentages
            updatePercentages();
        }
    };
    //  remove an item from list
    var deleteItem = function (event) {

        var itemID, splitID, type, ID;
        // travers the DOM element to get our target parent
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // split id string at the - character. ex. id 'income-0' = ['income', '0']
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete item from data
            budgetController.deleteItem(type, ID);

            // delete item from UI
            uiController.deleteListItem(itemID);

            // update budget & display new budget
            updateBudget();

            // update percentages
            updatePercentages();
        }
    };

    // initailize app function
    return {
        init: function () {
            uiController.displayDate();
            uiController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: 0
            });
            setEventListeners();
        }
    }

})(budgetController, uiController);

// initalize app call
controller.init();