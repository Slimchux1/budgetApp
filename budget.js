

var budgetController = (function(){
     var Income, Expense, data ;
    Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;  
    };

    Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;  
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100)
        }else{
            this.percentage = -1;
        }    
    };
    Expense.prototype.getPercentage = function(){
            return this.percentage;
    };
  
    var calculateTotal = function(type){
         var sum;
         sum = 0;
         data.allItems[type].forEach(function(cur){
              sum = sum + cur.value;
         });
         data.totals[type] = sum;
    },

    data = {
        allItems: {
            inc: [],
            exp: [],
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }
   
         return {
             addItem : function(type, des, val) {
                 var newItem, ID;
                 //create new ID
                 if (data.allItems[type].length > 0){
                    ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
                 }else {
                     ID = 0
                 }
                  
             // Create new item based on inc or exp 
                  if (type === 'exp'){
                 newItem = new Expense(ID, des, val)
             }else if (type === 'inc'){
                 newItem = new Income (ID, des, val)
             }
             //push it into our data structure
             data.allItems[type].push(newItem) 
             //Return our new element
             return newItem;
             },
             deleteItem: function(type, id) {
                var ids, index;
                
                // id = 6
                //data.allItems[type][id];
                // ids = [1 2 4  8]
                //index = 3
                
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });
    
                index = ids.indexOf(id);
    
                if (index !== -1) {
                    data.allItems[type].splice(index, 1);
                }
            },
             calculateBudget: function(){
                 //calculate total income and expense
                     calculateTotal('inc');
                     calculateTotal('exp');
                 //calculate the budget: income - expense
                 data.budget = data.totals.inc - data.totals.exp;

                 //calculate the percentage of income that we spent
                 if (data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
                 }else {
                     data.percentage = -1;
                 }
                  
                },
                getBudget: function(){
                  return{
                      budget: data.budget,
                      totalInc: data.totals.inc,
                      totalExp: data.totals.exp,
                      percentage: data.percentage
                  }
                },

                calculatePercentages: function() {
                     data.allItems.exp.forEach(function(curr){
                            curr.calcPercentage(data.totals.inc);
                     });
                },
  
                getPercentages: function(){
                  var allperc = data.allItems.exp.map(function(cur){
                          return cur.getPercentage();
                  });
                  return allperc;
                },

             testing: function() {
                 console.log (data)
             }
         }
        
})();

var UIController = (function() {
       var DOMStrings;

      DOMStrings= {
                    inputType:  '.add__type',
                    description: '.add__description',
                    value: '.add__value',
                    btnAdd: '.add__btn',
                    incomeContainer:'.income__list',
                    expensesContainer:'.expenses__list',
                    budgetLabel: '.budget__value',
                    incomeLabel: '.budget__income--value',
                    expenseLabel: '.budget__expenses--value',
                    percentageLabel: '.budget__expenses--percentage',
                    container: '.container',
                    expensesPerLabel: '.item__percentage',
                    dateLabel: '.budget__title--month',
     };
     var formatNumber = function(num, type){
        var numSplit, int, dec;  
         num = Math.abs(num);
         //to give it to two decimal placee
         num = num.toFixed(2)
        // to put comma btw number

        numSplit = num.split('.')
        int = numSplit[0]

        if(int.length >3){
            int.substr(0, int.length) + ','+ int.substr(int.length - 3, 3);
        }
        dec = numSplit[1]

        return (type === 'exp'  ? sign = '-' : sign = '+')  + ' ' + int + '.' + dec;
        
     };


     var nodeListForEach = function(list, callback){
        for (var i = 0; i<list.length; i++){
            callback(list[i], i)
        }
  };
         
     return {
         getInput: function() {
            return {
                 type: document.querySelector(DOMStrings.inputType).value,
                 description: document.querySelector(DOMStrings.description).value,
                 value: parseFloat(document.querySelector(DOMStrings.value).value)
            }
         },


         changeType: function() {
             var fields = document.querySelectorAll(DOMStrings.inputType + ',' +
              DOMStrings.description + ',' +
               DOMStrings.value)
               
                nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMStrings.btnAdd).classList.toggle('red');
            
         },

         addListItem: function(obj, type){
            var html, element, newHtml;
            //create HTML string with placeholder
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
             html =  '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
             html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>'
            }
            //Replace the placeholder text with some actual data
     
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
     
            //insert the html into the dome
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);    
     },

     displayPercentages: function(percentages){
        var fields = document.querySelectorAll(DOMStrings.expensesPerLabel);   
  
        nodeListForEach(fields, function(current, index){
             
        if (percentages[index] > 0){
            current.textContent = percentages[index] + "%";
        }else {
            current.textContent = "---";
        }
        });
    },

    displayMonth: function() {
        var now, month, allMonth, year;
         now = new Date();
        //var chrismas = newDate(2020, 11, 25)

       year = now.getFullYear();
       month = now.getMonth();
 
       allMonth =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
       document.querySelector(DOMStrings.dateLabel).textContent =  allMonth[month] +  ',  ' + year;

    },

     
     deleteListItem: function(selectorID){
         var el = document.getElementById(selectorID)
           el.parentNode.removeChild(el)
     },


         getDOMStrings: function() {
             return DOMStrings;
         },


         clearFields: function(){
            var fields, fieldsArr;
            
           fields = document.querySelectorAll(DOMStrings.description + ',' + DOMStrings.value);
       fieldsArr =  Array.prototype.slice.call(fields);
           fieldsArr.forEach(function(current, index, array){
              current.value = ""; 
           });
           fieldsArr[0].focus();
       },

       displayBudget: function(obj){
           var type;
           obj.budget > 0 ? type = 'inc' : type = 'exp';
          document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
          document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
          document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalExp;
          document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
      
          if (obj.percentage > 0) {
            document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }
    },
         
     };

    
})();

var AppController = (function(budgetCtrl, UICtrl) {
    var DOM, setUpEventListeners, crtlAddItem;

    setUpEventListeners = function(){
        DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.btnAdd).addEventListener('click', crtlAddItem);

        document.addEventListener('keypress', function(event)  {
            if (event.keycode === 13 || event.which === 13) {
              crtlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 
         document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };


    
    var updateBudget = function(){
        //Calculate the budget
        budgetCtrl.calculateBudget()

        //Return the budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the UI
       UICtrl.displayBudget(budget);

    };

   var  updatePercentages = function() {
         //calculate percentage
           budgetCtrl.calculatePercentages();
         //Read percentage from the budget controller
       var percentages = budgetCtrl.getPercentages();
         //update the UI
        UICtrl.displayPercentages(percentages);
     };

     crtlAddItem = function (){
         //Get the field input data
            var inputs, newItem;
        //Get items from input fields
         inputs = UICtrl.getInput();
         if(inputs.description !== "" && !isNaN(inputs.value) && inputs.value > 0){
             //Add item to budget controller
        newItem = budgetCtrl.addItem(inputs.type, inputs.description, inputs.value)
        //Add item to 
        UICtrl.addListItem(newItem, inputs.type)

         //clear fields
         UICtrl.clearFields();

         //calculate and update Budget
         updateBudget();
         updatePercentages();
         }
        
     }
     var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

             //3.update and show new budget
             updateBudget();

             //4.Update percentages
             updatePercentages();
         }
     };
       
     
return {
    init: function(){
        console.log('Application started');
        UICtrl.displayMonth();
        setUpEventListeners();
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        })
    }
}

})(budgetController, UIController);


AppController.init();