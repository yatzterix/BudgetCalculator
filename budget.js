/*
APP STRUCTURE 

THE FOLLOWING ARE MODULES:
• BUDGET CONTROLLER
• APP CONTROLLER
• UI CONTROLLER

BUDGET CONTROLLER
• addItem 
• calculateBudget 
• calculateTotal
• getBudget

EXPENSE/INCOME CONSTRUCTORS
• Expense
• Income 


APP CONTROLLER
• ctrlAddItem 
• udpateBudget 

• setupEventListeners 
• init 


UI CONTROLLER
• getInput
• addListItem
• clearFields
• displayBudget

• getDOMstrings

*/


// BUDGET CONTROLLER**********************************************
var budgetController = (function (){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0 ){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1;
        } 
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage: -1
    };

    return{
        addItem:function(type, des, val){

            var newItem, ID;

            // CREATE NEW ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            // CREATE NEW ITEM BASED ON INC OR EXP TYPE
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // PUSH IT INTO OUR DATE STRUCTURE
            data.allItems[type].push(newItem);

            // RETURN THE NEW ELEMENT
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){

            // CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');
            // CALCULATE THE BUDGET : INCOME - EXPENSES
            data.budget = data.totals.inc - data.totals.exp;
            // CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget, 
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing:function(){
            console.log(data);
        }
    };

})();

// UI CONTROLLER**********************************************
var UIController  = (function(){

    var DOMstrings = {
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn: '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__title',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type){
        var numSplit, int, dec, type;
        /*
        + or - BEFORE NUMBER
        EXACTLY 2 DECIMAL POINTS
        COMMA SEPARATING THE THOUSANDS

        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
        */
       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');

       int = numSplit[0];
       if(int.length > 3){
           int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // INPUT 23510, OUTPUT 2,3510
       }

       dec = numSplit[1];

       return (type === 'exp' ? '-' : '+')  + ' ' + int + '.' + dec;
    };


    var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

    var nodeListForEach = function(list, callback){
        for(var i =0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                 type : document.querySelector(DOMstrings.inputType).value, //WILL BE EITHER INC OR EXP
                 description : document.querySelector(DOMstrings.inputDescription).value,
                 value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem:function(obj, type){
             var html, newHtml, element;
            //CREATE HTML STRING WITH PLACEHOLDER TEXT

            if(type === 'inc'){
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
            element = DOMstrings.expenseContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            //INSERT THE HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },


        displayPercentages:function(percentages){

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = percentages[index] + '---';
                }
            });

        },


        displayMonth: function(){
            var now, months, month, year;

            now = new Date();
            // var christmas = new Date(2016 , 11, 25);

            months = ['January', 'Febuary', 'March', 'April','May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =months[month] + ' ' + year;

        },

        changedType: function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();

// GLOBAL APP CONTROLLER**********************************************
var controller  = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event){
    
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var upddateBudget = function(){
        // CALCULATE THE BUDGET
        budgetCtrl.calculateBudget();
        // RETURN THE BUDGET
        var budget = budgetCtrl.getBudget();
        // DISPLAY THE BUDGET ON THE UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1. CALCULATE PERCENTAGES
        budgetCtrl.calculatePercentages();
        // 2. READ PERCENTAGES FROM THE BUDGET CONTROLLER
        var percentages = budgetCtrl.getPercentages();
        // 3. UPDATE THE UI WITH THE NEW PERCENTAGES
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){

    var input, newItem;

    // 1. GET THE FIELD INPUT DATA
    var input = UICtrl.getInput();
    
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. ADD THE ITEM TO THE BUDGET CONTROLLER
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. ADD THE ITEM TO THE UI
            UICtrl.addListItem(newItem, input.type);

            // 4. CLEAR THE FIELDS
            UICtrl.clearFields();

            // 5. CALCULATE AND UPDATE BUDGET
            upddateBudget();

            // 6. CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }


    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){

            // INC -1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. DELETE THE ITEM FROM THE DATE STRUCTURE
            budgetCtrl.deleteItem(type, ID);
            // 2. DELETE THE ITEM FROM THE UI
            UICtrl.deleteListItem(itemID);
            // 3. UPDATE AND SHOW THE NEW BUDGET
            upddateBudget();
            // 4. CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }
    };

    return{
        init: function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0, 
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController,UIController);


controller.init();



