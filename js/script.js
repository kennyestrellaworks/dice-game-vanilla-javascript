const DOMStrings = {
    diceGameInitiatorsDropdown: document.querySelectorAll('.dice-game__initiators-dropdown'),
    diceGameInitiatorsDropdownItems: '', // class="dice-game__initiators-dropdown-items"
    diceGameDiceItem: '', // class="dice-game__dice-item"
    diceGamePlayerBlock: document.querySelectorAll('.dice-game__player-block'),
    itemsSelectDropdown: document.querySelectorAll('.items-select__dropdown'),
    diceGameDiceContainer: document.querySelector('.dice-game__dice-container'),
    diceGameMessagBlock: document.querySelectorAll('.dice-game__message-block'),
    btnRollDice: document.querySelector('.btn__btn-roll-dice'),
    btnHoldDice: document.querySelector('.btn__btn-hold-dice'),
    btnNewGame: document.querySelector('.btn__btn-new-game'),
    itemsSelectDropdownPlaceholder: document.querySelectorAll('.items-select__dropdown-placeholder'),
    btnBtnPrimary: document.querySelectorAll('.btn__btn-primary'),
    diceGameRuleInfoParagraph: document.querySelector('.dice-game__rule-info-paragraph')
}

const setup = {
    initiator: [
        { name: 'dice', content: [1, 2], prefix: 'Dice' },
        { name: 'winning-score', content: [20, 40, 60, 80, 100], prefix: 'Up to' }
    ],
    dangerRoll: [
        { name: 'dice-1', dangerRollValue: 1, rule: function() { return `Roll ${this.dangerRollValue}, current score becomes 0 and it'll be next player's turn.` } },
        { name: 'dice-2', dangerRollValue: 6, rule: function() { return `Roll a sum of ${this.dangerRollValue}, current score becomes 0 and it'll be next player's turn.` } }
    ],
    players: [
        { 
            name: 'player-1',
            mainScore: 0,
            currentScore: 0,
        },
        {
            name: 'player-2',
            mainScore: 0,
            currentScore: 0,
        }
    ]
}

// Game object.
const game = {
    activePlayer: '',
    otherPlayer: '',
    oldActivePlayer: '',
    gamePlay: '',
    dangerRollValue: 0,
    numberOfDice: 0,
    winningScore: 0,
    randomNumbers: [],
    randomNumbersSum: 0,
    diceSides: 6,
}

// Traversing through the DOM until we find <p class="items-select__dropdown-placeholder">
// then have it's 'innerHTML' be replaced by the 'data-number' of the dropdown item 
// being clicked.
for (let i = 0; i < DOMStrings.diceGameInitiatorsDropdown.length; i++) {
    DOMStrings.diceGameInitiatorsDropdown[i].addEventListener('click', function(event) {         
        let activeElement = event.target
        let eventElement = activeElement.parentElement
        let dataNumber = activeElement.dataset.number
        let parentElment = activeElement.parentElement.parentElement.parentElement.parentElement
        let placeholderElement = parentElment.children[0].children[0]
        placeholderElement.innerHTML = dataNumber        
        if (eventElement.dataset.name == 'winning-score') {
            // We also 'game.winningScore' to the 'data-number' of the current item.
            game.winningScore = dataNumber
            traceValues('WINNING SCORE')
        }        
        if (eventElement.dataset.name == 'dice') {
            // We also 'game.numberOfDice' to the 'data-number' of the current item.
            game.numberOfDice = dataNumber
            // We get the value of 'setup.dangerRoll.dangerRollValue'.
            Game.doDangerRoll()
            let parentElement = ''
            parentElement = DOMStrings.diceGameRuleInfoParagraph.parentElement
            parentElement.classList.add('hide')
            UI.showRule()
            // We prepare the appropriate dice to be displayed.
            for (let i = 0; i < game.numberOfDice; i++) {
                UI.prepareDice()
                UI.showDefaultDice()
            }
            traceValues('DICE')
        }
    })
}

// Showing and hiding dropdown <div class="dropdown"> by adding 'hide' class.
for (let i = 0; i < DOMStrings.itemsSelectDropdown.length; i++) {
    DOMStrings.itemsSelectDropdown[i].addEventListener('mouseover', function() {
        if (DOMStrings.itemsSelectDropdown[i].classList.contains('items-select__dropdown-enable')) {
            let dropdownGroup = DOMStrings.itemsSelectDropdown[i].children[0]
            dropdownGroup.classList.add('items-select__dropdown-group--active')
            DOMStrings.itemsSelectDropdown[i].children[1].classList.remove('hide') 
        }                  
    })
    DOMStrings.itemsSelectDropdown[i].addEventListener('mouseout', function() {
        if (DOMStrings.itemsSelectDropdown[i].classList.contains('items-select__dropdown-enable')) {
            let dropdownGroup = DOMStrings.itemsSelectDropdown[i].children[0]
            dropdownGroup.classList.remove('items-select__dropdown-group--active')
            DOMStrings.itemsSelectDropdown[i].children[1].classList.add('hide')
        }        
    })
}

// class UI starts
class UI {
    static showRule() {
        // Show static rule according to how many dice is used.
        let parentElement = ''
        for (let i = 0; i < setup.dangerRoll.length; i++) {
            if (setup.dangerRoll[i].dangerRollValue == game.dangerRollValue) {
                parentElement = DOMStrings.diceGameRuleInfoParagraph.parentElement
                setTimeout(() => {
                    parentElement.classList.remove('hide')
                    DOMStrings.diceGameRuleInfoParagraph.innerHTML = setup.dangerRoll[i].rule()
                }, 100);                
            }
        }
    }
    static clearScoredBoard() {
        // Clear the 'mainScore' and 'currentScore' of both players both in DOM and object.
        const allPlayers = setup.players
        let playerDOMS = ''
        for (let i = 0; i < allPlayers.length; i++) {
            allPlayers[i].currentScore = 0
            allPlayers[i].mainScore = 0
            playerDOMS = Game.getPlayerDOMS(allPlayers[i])
            playerDOMS.currentScoreElement.innerHTML = 0
            playerDOMS.mainScoreElement.innerHTML = 0
            playerDOMS.messageBlockElement.classList.add('hide')
            playerDOMS.rolledElement.innerHTML = ''
        }
    }
    static disableEnableItemSelect(task, element) {
        // Disable or enable 'itemSelect' elements.
        for (let i = 0; i < element.length; i++) {
            if (task == 'disable') { element[i].classList.remove('items-select__dropdown-enable') }
            if (task == 'enable') { element[i].classList.add('items-select__dropdown-enable') }
        }
    }
    static removeButtonHover() {
        // Removing hover effects on buttons except with class="btn__btn-new-game".
        for (let i = 0; i < DOMStrings.btnBtnPrimary.length; i++) {
            if (!DOMStrings.btnBtnPrimary[i].classList.contains('btn__btn-new-game')) {
                DOMStrings.btnBtnPrimary[i].classList.remove('btn__btn-primary-hover')
            }
        }
    }
    static disableEnableButtons(task, element) {
        // Received button DOMs and 'enable' or 'disable' it depending on 'task'.
        for (let i = 0; i < element.length; i++) {
            if (task == 'disable') {
                element[i].disabled = true
                element[i].classList.add('fade')
                
            }
            if (task == 'enable') {
                element[i].disabled = false
                element[i].classList.remove('fade')             
            }
        }
    }
    static displayMessageBlock(messageBlock) {
        let message = `<div class="boxed-element-1 dice-game__message-block-wrapper">
            <div class="heading-tertiary">
                <h1 class="heading-tertiary__heading">Congratulations!</h1>                            
            </div>
            <div class="heading-secondary">
                <h1 class="heading-secondary__heading">you win!</h1>                            
            </div>                                
        </div>
        `
        messageBlock.innerHTML = message
        messageBlock.classList.remove('hide')  
    }
    static createMainScore(currentPlayer) {
        // The 'currentScore' is added to 'mainScore' when a player clicks 'HOLD DICE'.
        currentPlayer.mainScore += currentPlayer.currentScore        
    }
    static resetCurrentScore(currentPlayer, currentPlayerDOMS) {
        // Resetting 'currentScore' to 0 in oject and DOM.
        currentPlayer.currentScore = 0
        currentPlayerDOMS.currentScoreElement.innerHTML = 0
    }
    static showRolled(currentPlayerDOMS) {
        // Displaying the rolled values when a player clicks 'ROLL DICE'.
        let stringEdit = ''
        let separator = ''
        for (let j = 0; j < game.randomNumbers.length; j++) {
            // Creating a new text (stringEdit) from the items of 'game.randomNumbers' object.
            // We put ', ' when an item is not second to the last item and if it's second to the
            // last item, we put ' and '.
            if ((j + 1) < (game.randomNumbers.length - 1)) { separator = ', ' }
            else if ((j + 1) == (game.randomNumbers.length - 1)) { separator = ' and ' }
            else if ((j + 1) > (game.randomNumbers.length - 1)) { separator = '' }
            stringEdit += game.randomNumbers[j].toString() + separator
        }             
        currentPlayerDOMS.rolledElement.innerHTML = `You rolled ${stringEdit}`
    }
    static updateCurrentScore() {
        // We get the 'currentPlayer' from the 'setup.players' object and we use that 'currentPlayer'
        // to get the corresponding DOMs. Then we add the value of 'game.randomNumbersSum' to the 
        // 'currentScore' of the 'currentPlayer'.     
        const currentPlayer = Game.getCurrentPlayer()
        const currentPlayerDOMS = Game.getPlayerDOMS(currentPlayer)
        currentPlayer.currentScore += game.randomNumbersSum
        currentPlayerDOMS.currentScoreElement.innerHTML = currentPlayer.currentScore        
    }
    static updateDice(number, index) {        
        if (game.numberOfDice == 1) {
            DOMStrings.diceGameDiceItem.src = `images/dice-${number}.jpg`
            DOMStrings.diceGameDiceItem.alt = `Dice ${number}` 
            this.hideSomething(DOMStrings.diceGameDiceItem, 100)
        } else {
            DOMStrings.diceGameDiceItem[index].src = `images/dice-${number}.jpg`
            DOMStrings.diceGameDiceItem[index].alt = `Dice ${number}`
            this.hideSomething(DOMStrings.diceGameDiceItem[index], 100)
        }
    }
    static showDefaultDice() {
        if (game.numberOfDice == 1) { 
            // When 'game.numberOfDice == 1' that means 1 dice is selected. Therefore, we generate 
            // 1 dice.
            DOMStrings.diceGameDiceItem = document.querySelector('.dice-game__dice-item')
            DOMStrings.diceGameDiceItem.src = `images/dice-${game.numberOfDice}.jpg`
            DOMStrings.diceGameDiceItem.alt = `Dice ${game.numberOfDice}`
            this.hideSomething(DOMStrings.diceGameDiceItem, 100)
        } else { 
            DOMStrings.diceGameDiceItem = document.querySelectorAll('.dice-game__dice-item')
            for (let i = 0; i < DOMStrings.diceGameDiceItem.length; i++) {
                DOMStrings.diceGameDiceItem[i].src = `images/dice-${setup.dangerRoll[i].dangerRollValue}.jpg`
                DOMStrings.diceGameDiceItem[i].alt = `Dice ${setup.dangerRoll[i].dangerRollValue}`
                this.hideSomething(DOMStrings.diceGameDiceItem[i], 100)
            }
        }
    }
    static hideSomething(DOMString, delay) {
        let DOM = DOMString
        setTimeout(() => {
            DOM.classList.remove('hide')
        }, delay);
    }
    static prepareDice() {
        // We create a 'string literal' that doesn't have an 'src' attribute yet showing an actual
        // dice image.
        let diceItem = ''
        for (let i = 0; i < game.numberOfDice; i++) {
            diceItem += `
                <img class="dice-game__dice-item hide" data-index="${i}">
            `
        }
        DOMStrings.diceGameDiceContainer.innerHTML = diceItem        
    }
    // Populating dropdown items of every element with class="dice-game__initiators-dropdown" with it's
    // approriate data from 'setup.initiator'. Getting the correct element is depended on each elements'
    // 'data-name'.
    static doInitiators() {
        let dropDownItems = ''
        for (let i = 0; i < setup.initiator.length; i++) {
            for (let j = 0; j < setup.initiator[i].content.length; j++) {
                if (setup.initiator[i].name == DOMStrings.diceGameInitiatorsDropdown[i].dataset.name) {
                    dropDownItems += `
                        <li class="dropdown-1__items dice-game__initiators-dropdown-items" data-number="${setup.initiator[i].content[j]}">${setup.initiator[i].prefix} ${setup.initiator[i].content[j]}</li>
                    `
                }                
            }
            DOMStrings.diceGameInitiatorsDropdown[i].innerHTML = dropDownItems
            // Items from previous object will be added to 'dropDownItems' that's why we need to empty
            // it first before the code proceeds to the parent for loop.
            dropDownItems = ''
        }
        DOMStrings.diceGameInitiatorsDropdownItems = document.querySelectorAll('.dice-game__initiators-dropdown-items')        
    }
    static checkActivePlayer() {
        for (let i = 0; i < DOMStrings.diceGamePlayerBlock.length; i++) {
            if (!DOMStrings.diceGamePlayerBlock[i].classList.contains(game.activePlayer)) {
                DOMStrings.diceGamePlayerBlock[i].classList.add('fade')
            } else { DOMStrings.diceGamePlayerBlock[i].classList.remove('fade') }
        }
    }
}
// class UI ends

// class GAME starts
class Game {
    static playerSwap() {
        // We are not really swapping the values of 'game.activePlayer' and 'game.otherPlayer' DIRECTLY,
        // since the values will repeat, instead we use some sort of bridge, the 'game.oldActivePlayer'
        // to properly swap them.
        game.activePlayer = game.otherPlayer
        game.otherPlayer = game.oldActivePlayer
        game.oldActivePlayer = game.activePlayer
    }
    static getSumOfArrayItems(array) {
        let sumOfArrayItems = 0
        for (let i = 0; i < array.length; i++) {
            sumOfArrayItems += array[i]
        }
        return sumOfArrayItems
    }
    static getCurrentPlayer() {
        // We look through 'setup.players' and see if 'game.activePlayer' is equal to
        // 'setup.player[i].name' where [i] represents the current index.
        let currentPlayer = 0
        for (let i = 0; i < setup.players.length; i++) {
            if (game.activePlayer == setup.players[i].name) {
                currentPlayer = setup.players[i]
            }
        }
        return currentPlayer
    }
    static getPlayerDOMS(player) {
        // Player 1 and 2 block has the same DOMs, the difference is the class 'player-1' or 'player-2'
        // which is the 'player.name' property and value from 'setup.player' object.
        let playerBlockElement = ''
        let currentScoreElement = ''
        let rolledElement = ''
        let mainScoreElement = ''
        let messageBlockElement = ''
        for (let i = 0; i < DOMStrings.diceGamePlayerBlock.length; i++) {
            // We traverse through the DOM and get what is needed.
            if (DOMStrings.diceGamePlayerBlock[i].classList.contains(player.name)) {
                playerBlockElement = DOMStrings.diceGamePlayerBlock[i]
                currentScoreElement = playerBlockElement.children[1].children[3].children[0].children[1].children[0].children[0]
                rolledElement = playerBlockElement.children[1].children[2].children[0].children[0]
                mainScoreElement = playerBlockElement.children[1].children[0].children[0]
                messageBlockElement = playerBlockElement.children[1].children[1]
            }
        }
        return {playerBlockElement, currentScoreElement, rolledElement, mainScoreElement, messageBlockElement}
    }
    static doNumberValidity(number) {
        // In each dice selection, 1 or 2, there is a corresponding 'dangerRollValue' which we use to see if
        // the 'number' passed in is valid or not.
        if (number != game.dangerRollValue) {
            return true
        } else { return false }
    }
    static doRandomNumber() {
        // We generate a 'randomNumber' based on the 'game.diceSides' value.
        let randomNumber = Math.floor(Math.random() * game.diceSides) + 1
        return randomNumber
    }
    // To get the value of 'setup.dangerRoll.dangerRollValue' of each item we loop through 'setup.dangerRoll'
    // then we compare 'dice-${game.numberOfDice}' to 'setup.dangerRoll[i].name', (dice-1 to dice-1). 
    static doDangerRoll() {
        for (let i = 0; i < setup.dangerRoll.length; i++) {
            if (`dice-${game.numberOfDice}` == setup.dangerRoll[i].name) {
                game.dangerRollValue = setup.dangerRoll[i].dangerRollValue
            }
        }
    }
    static defaultState() {
        // Default values we initialize when the page is loaded.
        game.activePlayer = 'player-1'
        game.otherPlayer = 'player-2'
        game.oldActivePlayer = 'player-1'
        game.gamePlay = true
        game.numberOfDice = 1
        game.winningScore = 100
        game.itemsSelectDropdown = true
        UI.checkActivePlayer()
        UI.prepareDice()
        UI.showRule()
        UI.showDefaultDice()
        Game.doDangerRoll()
        DOMStrings.itemsSelectDropdownPlaceholder[0].innerHTML = game.numberOfDice
        DOMStrings.itemsSelectDropdownPlaceholder[1].innerHTML = game.winningScore
        for (let i = 0; i < DOMStrings.btnBtnPrimary.length; i++) {
            DOMStrings.btnBtnPrimary[i].classList.add('btn__btn-primary-hover')
        }
    }
}
// class GAME ends

// ROLL DICE starts.
DOMStrings.btnRollDice.addEventListener('click', function() {
    const currentPlayer = Game.getCurrentPlayer() // Getting the 'activePlayer'.
    const currentPlayerDOMS = Game.getPlayerDOMS(currentPlayer) // Getting the 'activePlayer' DOMs.
    if (game.gamePlay == true) {
        // When 'game.gamePlay == true', we can roll the dice.
        let randomNumber = 0
        let sumOfRandomNumbers = 0   
        let isNumberValied = '' 
        UI.prepareDice()
        if (game.numberOfDice == 1) {
            DOMStrings.diceGameDiceItem = document.querySelector('.dice-game__dice-item')
            randomNumber = Game.doRandomNumber()
            game.randomNumbers.push(randomNumber)
            sumOfRandomNumbers = Game.getSumOfArrayItems(game.randomNumbers) 
            game.randomNumbersSum = sumOfRandomNumbers
            isNumberValied = Game.doNumberValidity(sumOfRandomNumbers)
            if (isNumberValied == true) {
                UI.updateDice(randomNumber)
                UI.updateCurrentScore()
                UI.showRolled(currentPlayerDOMS)
            } else {
                UI.resetCurrentScore(currentPlayer, currentPlayerDOMS)
                UI.updateDice(randomNumber)
                UI.showRolled(currentPlayerDOMS)
                Game.playerSwap()
                UI.checkActivePlayer()
            }
            traceValues('ROLL DICE 1')      
        } else {
            DOMStrings.diceGameDiceItem = document.querySelectorAll('.dice-game__dice-item')
            for (let i = 0; i < DOMStrings.diceGameDiceItem.length; i++) {
                randomNumber = Game.doRandomNumber()
                game.randomNumbers.push(randomNumber)  
                UI.updateDice(randomNumber, i)
            }     
            sumOfRandomNumbers = Game.getSumOfArrayItems(game.randomNumbers) 
            game.randomNumbersSum = sumOfRandomNumbers
            isNumberValied = Game.doNumberValidity(sumOfRandomNumbers)
            if (isNumberValied == true) {
                UI.updateCurrentScore()
                UI.showRolled(currentPlayerDOMS)
            } else {
                UI.resetCurrentScore(currentPlayer, currentPlayerDOMS)
                UI.showRolled(currentPlayerDOMS)
                Game.playerSwap()
                UI.checkActivePlayer()
            }                   
            traceValues('ROLL DICE 1')
        }
        game.randomNumbers = []
        game.randomNumbersSum = 0
    }    
})
// ROLL DICE ends.

// HOLD DICE starts.
DOMStrings.btnHoldDice.addEventListener('click', function() {
    const currentPlayer = Game.getCurrentPlayer() // Getting the 'activePlayer'.
    const currentPlayerDOMS = Game.getPlayerDOMS(currentPlayer) // Getting the 'activePlayer' DOMs
    currentPlayer.mainScore += currentPlayer.currentScore
    currentPlayerDOMS.mainScoreElement.innerHTML = currentPlayer.mainScore
    if (currentPlayer.mainScore < game.winningScore) {
        UI.resetCurrentScore(currentPlayer, currentPlayerDOMS)
        Game.playerSwap()
        UI.checkActivePlayer()
    } else {
        // There's a winner
        //currentPlayerDOMS.messageBlockElement.classList.remove('hide')
        UI.displayMessageBlock(currentPlayerDOMS.messageBlockElement)
        UI.disableEnableButtons('disable', [DOMStrings.btnRollDice, DOMStrings.btnHoldDice])
        UI.disableEnableItemSelect('disable', DOMStrings.itemsSelectDropdown)
        UI.removeButtonHover()
    }
    traceValues('HOLD DICE')
})
// HOLD DICE ends.

// NEW GAME starts.
DOMStrings.btnNewGame.addEventListener('click', function() {
    UI.disableEnableButtons('enable', [DOMStrings.btnRollDice, DOMStrings.btnHoldDice])
    UI.disableEnableItemSelect('enable', DOMStrings.itemsSelectDropdown)
    UI.clearScoredBoard()
    Game.defaultState()
    traceValues('NEW GAME')
})

// PAGE LOAD starts.
document.addEventListener('DOMContentLoaded', function() {
    UI.doInitiators()
    Game.defaultState()
    UI.showRule()
    UI.disableEnableItemSelect('enable', DOMStrings.itemsSelectDropdown)
    traceValues('PAGE LOAD')
})

const traceValues = function(event) {
    console.log('******************')
    console.log('***', event)
    console.log(`activePlayer: ${game.activePlayer}`)
    console.log(`otherPlayer: ${game.otherPlayer}`)
    console.log(`oldActivePlayer: ${game.oldActivePlayer}`)
    console.log(`gamePlay: ${game.gamePlay}`)
    console.log(`dangerRollValue: ${game.dangerRollValue}`)
    console.log(`numberOfDice: ${game.numberOfDice}`)
    console.log(`winningScore: ${game.winningScore}`)
    console.log(`randomNumbers: ${game.randomNumbers}`)
    console.log(`randomNumbersSum: ${game.randomNumbersSum}`)
    console.log(`itemsSelectDropdown: ${game.itemsSelectDropdown}`)
    console.log('***')
    console.log(`${setup.players[0].name} current score: ${setup.players[0].currentScore}`)
    console.log(`${setup.players[0].name} main score: ${setup.players[0].mainScore}`)
    console.log('***')
    console.log(`${setup.players[1].name} current score: ${setup.players[1].currentScore}`)
    console.log(`${setup.players[1].name} main score: ${setup.players[1].mainScore}`)
}