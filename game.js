class SolitaireGame {
    constructor() {
        this.autoMoveEnabled = false;
        this.touchStartPos = null;
        this.touchStartTime = null;
        this.selectedCard = null;
        this.isTouchDevice = 'ontouchstart' in window;
        this.initializeGame();
        this.setupEventListeners();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({
                    suit,
                    value,
                    color: ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black',
                    faceUp: false,
                    id: `${value}-${suit}`
                });
            }
        }

        return this.shuffle(deck);
    }

    shuffle(array) {
        

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    initializeGame() {
        this.deck = this.createDeck();
        this.waste = [];
        this.foundation = Array(4).fill().map(() => []);
        this.tableau = Array(7).fill().map(() => []);
        this.draggedCards = null;
        this.dragSource = null;
        
        // Deal initial cards
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.pop();
                card.faceUp = i === j;
                this.tableau[j].push(card);
            }
        }
        this.render();
    }

    setupEventListeners() {
        document.getElementById('deck').addEventListener('click', () => this.drawCard());
        
        document.getElementById('deck').addEventListener('click', () => this.drawCard());
        
        if (this.isTouchDevice) {
            // Touch event handlers
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        } else {
            // Mouse event handlers (keep existing)
            document.addEventListener('dragstart', (e) => this.handleDragStart(e));
            document.addEventListener('dragend', (e) => this.handleDragEnd(e));
            document.addEventListener('dragover', (e) => this.handleDragOver(e));
            document.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // Keep other existing listeners
        document.querySelectorAll('.restart-btn').forEach(button => {
            button.addEventListener('click', () => this.restartGame());
        });

        document.getElementById('auto-move-toggle').addEventListener('change', (e) => {
            this.autoMoveEnabled = e.target.checked;
            if (this.autoMoveEnabled) {
                this.performAutoMoves();
            }
        });
    }


    async performAutoMoves() {
        if (!this.autoMoveEnabled) return;

        let movesMade;
        do {
            movesMade = false;
            
            // Check waste pile
            if (this.waste.length > 0) {
                const wasteCard = this.waste[this.waste.length - 1];
                if (wasteCard.faceUp && this.canAutoMoveToFoundation(wasteCard)) {
                    await this.moveCardToFoundation(this.waste, wasteCard);
                    movesMade = true;
                }
            }

            // Check tableau piles
            for (const pile of this.tableau) {
                if (pile.length > 0) {
                    const topCard = pile[pile.length - 1];
                    if (topCard.faceUp && this.canAutoMoveToFoundation(topCard)) {
                        await this.moveCardToFoundation(pile, topCard);
                        movesMade = true;s
                    }
                }
            }

            if (movesMade) {
                this.render();
            }
        } while (movesMade);

        this.checkWinCondition();
    }

    canAutoMoveToFoundation(card) {
        const foundationIndex = this.getFoundationPileIndex(card.suit);
        const foundationPile = this.foundation[foundationIndex];
        
        if (foundationPile.length === 0) {
            return card.value === 'A';
        }

        const topFoundationCard = foundationPile[foundationPile.length - 1];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return card.suit === topFoundationCard.suit && 
               values.indexOf(card.value) === values.indexOf(topFoundationCard.value) + 1;
    }

    async moveCardToFoundation(sourcePile, card) {
        const foundationIndex = this.getFoundationPileIndex(card.suit);
        const cardIndex = sourcePile.indexOf(card);
        
        if (cardIndex !== -1) {
            // Get source and target elements
            const cardElement = document.querySelector(`[data-id="${card.id}"]`);
            const foundationPile = document.querySelectorAll('.foundation-pile')[foundationIndex];
            
            if (cardElement && foundationPile) {
                // Get the start and end positions
                const startRect = cardElement.getBoundingClientRect();
                const endRect = foundationPile.getBoundingClientRect();
                
                // Create a clone for animation
                const clone = cardElement.cloneNode(true);
                clone.classList.add('animating');
                clone.style.position = 'fixed';
                clone.style.left = `${startRect.left}px`;
                clone.style.top = `${startRect.top}px`;
                clone.style.width = `${startRect.width}px`;
                clone.style.height = `${startRect.height}px`;
                clone.style.margin = '0';
                clone.style.transform = 'none';
                clone.style.transition = 'all 0.3s ease-out';
                clone.style.zIndex = '1000';
                
                document.body.appendChild(clone);
                
                // Update game state before animation
                const [movedCard] = sourcePile.splice(cardIndex, 1);
                this.foundation[foundationIndex].push(movedCard);

                // Turn over next card if it exists
                if (sourcePile.length > 0 && cardIndex === sourcePile.length) {
                    sourcePile[sourcePile.length - 1].faceUp = true;
                }

                // Trigger animation
                await new Promise(resolve => {
                    clone.addEventListener('transitionend', () => {
                        clone.remove();
                        resolve();
                    }, { once: true });
                    
                    // Force reflow
                    clone.offsetHeight;
                    
                    // Animate to foundation pile
                    clone.style.left = `${endRect.left}px`;
                    clone.style.top = `${endRect.top}px`;
                });

                // Re-render after animation completes
                this.render();
            }
        }
    }

    getFoundationPileIndex(suit) {
        const suitOrder = ['hearts', 'diamonds', 'clubs', 'spades'];
        return suitOrder.indexOf(suit);
    }

    restartGame() {
        document.getElementById('win-message').classList.add('hidden');
        this.initializeGame();
    }

    async drawCard() {
        if (this.deck.length === 0) {
            this.deck = [...this.waste].reverse();
            this.waste = [];
            this.deck.forEach(card => card.faceUp = false);
            this.render();
        } else {
            const card = this.deck.pop();
            card.faceUp = true;
            
            // Get positions
            const deckElement = document.getElementById('deck');
            const wasteElement = document.getElementById('waste');
            const deckRect = deckElement.getBoundingClientRect();
            const wasteRect = wasteElement.getBoundingClientRect();

            // Create card element for animation
            const cardElement = document.createElement('div');
            cardElement.className = 'card card-flip';
            cardElement.style.position = 'fixed';
            cardElement.style.left = `${deckRect.left}px`;
            cardElement.style.top = `${deckRect.top}px`;
            cardElement.style.width = `${deckRect.width}px`;
            cardElement.style.height = `${deckRect.height}px`;
            cardElement.style.zIndex = '1000';

            // Create back face
            const backFace = document.createElement('div');
            backFace.className = 'card-face back';
            const backImg = document.createElement('img');
            backImg.src = 'assets/cards/card_back.png';
            backImg.alt = 'Card back';
            backFace.appendChild(backImg);
            cardElement.appendChild(backFace);

            // Create front face
            const frontFace = document.createElement('div');
            frontFace.className = 'card-face front';
            const frontImg = document.createElement('img');
            frontImg.src = `assets/cards/${card.value.toLowerCase()}_of_${card.suit}.png`;
            frontImg.alt = `${card.value} of ${card.suit}`;
            frontFace.appendChild(frontImg);
            cardElement.appendChild(frontFace);

            document.body.appendChild(cardElement);

            // Flip animation
            await new Promise(resolve => {
                setTimeout(() => {
                    cardElement.classList.add('flipping');
                    setTimeout(resolve, 300);
                }, 50);
            });

            // Move to waste pile
            cardElement.classList.add('moving-to-waste');
            await new Promise(resolve => {
                cardElement.style.left = `${wasteRect.left}px`;
                cardElement.style.top = `${wasteRect.top}px`;
                cardElement.addEventListener('transitionend', resolve, { once: true });
            });

            // Clean up and update game state
            cardElement.remove();
            this.waste.push(card);
            this.render();

            // Check for auto-moves
            if (this.autoMoveEnabled) {
                await this.performAutoMoves();
            }
        }
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        const cardElement = touch.target.closest('.card');
        
        if (cardElement && cardElement.dataset.id) {
            e.preventDefault();
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
            this.touchStartTime = Date.now();
            
            const [pile, index] = this.findCard(cardElement.dataset.id);
            const card = this.getCardFromPile(pile, cardElement.dataset.id);
            
            if (card && card.faceUp) {
                this.selectedCard = {
                    element: cardElement,
                    card: card,
                    pile: pile,
                    index: index,
                    originalPos: cardElement.getBoundingClientRect()
                };
                
                cardElement.style.zIndex = '1000';
            }
        }
    }

    handleTouchMove(e) {
        if (this.selectedCard) {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.touchStartPos.x;
            const deltaY = touch.clientY - this.touchStartPos.y;
            
            this.selectedCard.element.style.transform = 
                `translate(${deltaX}px, ${deltaY}px)`;
            
            // Highlight valid drop targets
            const targetElement = this.getTouchTarget(touch);
            this.clearDropTargets();
            if (targetElement && this.isValidMove(this.selectedCard.card, targetElement)) {
                targetElement.classList.add('valid-drop-target');
            }
        }
    }

    async handleTouchEnd(e) {
        if (this.selectedCard) {
            const touch = e.changedTouches[0];
            const targetElement = this.getTouchTarget(touch);
            
            if (targetElement && this.isValidMove(this.selectedCard.card, targetElement)) {
                // Valid drop
                const cards = this.selectedCard.pile.splice(this.selectedCard.index);
                this.getTargetPileArray(targetElement).push(...cards);
                
                if (this.selectedCard.pile.length > 0) {
                    this.selectedCard.pile[this.selectedCard.pile.length - 1].faceUp = true;
                }
            }
            
            this.clearDropTargets();
            this.render();
            
            if (this.autoMoveEnabled) {
                await this.performAutoMoves();
            }
            
            this.checkWinCondition();
            this.selectedCard = null;
        }
    }

    getTouchTarget(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        return element?.closest('.tableau-pile, .foundation-pile');
    }


    handleDragStart(e) {
        const cardElement = e.target.closest('.card');
        if (!cardElement || !cardElement.dataset.id) return;

        // Find the card and its location
        const [pile, index] = this.findCard(cardElement.dataset.id);
        if (!pile) return;

        // Only allow dragging face-up cards
        const card = this.getCardFromPile(pile, cardElement.dataset.id);
        if (!card || !card.faceUp) return;

        this.draggedCards = pile.slice(index);
        this.dragSource = pile;
        cardElement.classList.add('dragging');

        // Store the source pile type and index
        e.dataTransfer.setData('text/plain', JSON.stringify({
            sourceType: this.getPileType(pile),
            sourceIndex: this.getPileIndex(pile),
            cardId: cardElement.dataset.id
        }));
    }

    handleDragEnd(e) {
        const cardElement = e.target.closest('.card');
        if (cardElement) {
            cardElement.classList.remove('dragging');
        }
        this.draggedCards = null;
        this.dragSource = null;
        this.clearDropTargets();
    }

    handleDragOver(e) {
        e.preventDefault();
        const targetPile = e.target.closest('.tableau-pile, .foundation-pile');
        if (!targetPile || !this.draggedCards) return;

        this.clearDropTargets();
        if (this.isValidMove(this.draggedCards[0], targetPile)) {
            targetPile.classList.add('valid-drop-target');
        }
    }

    async handleDrop(e) {
        e.preventDefault();
        const targetPile = e.target.closest('.tableau-pile, .foundation-pile');
        if (!targetPile || !this.draggedCards) return;

        const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const sourcePile = this.getPileByType(sourceData.sourceType, sourceData.sourceIndex);
        const cardIndex = sourcePile.findIndex(card => card.id === sourceData.cardId);

        if (this.isValidMove(sourcePile[cardIndex], targetPile)) {
            const cards = sourcePile.splice(cardIndex);
            this.getTargetPileArray(targetPile).push(...cards);

            if (sourcePile.length > 0) {
                sourcePile[sourcePile.length - 1].faceUp = true;
            }
        }

        this.clearDropTargets();
        this.render();
        
        if (this.autoMoveEnabled) {
            await this.performAutoMoves();
        }
        
        this.checkWinCondition();
    }

    isValidMove(card, targetElement) {
        const targetPile = this.getTargetPileArray(targetElement);
        const isFoundation = targetElement.classList.contains('foundation-pile');

        if (isFoundation) {
            return this.isValidFoundationMove(card, targetPile);
        } else {
            return this.isValidTableauMove(card, targetPile);
        }
    }

    isValidFoundationMove(card, targetPile) {
        if (targetPile.length === 0) {
            return card.value === 'A';
        }

        const topCard = targetPile[targetPile.length - 1];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return card.suit === topCard.suit && 
               values.indexOf(card.value) === values.indexOf(topCard.value) + 1;
    }

    isValidTableauMove(card, targetPile) {
        if (targetPile.length === 0) {
            return card.value === 'K';
        }

        const topCard = targetPile[targetPile.length - 1];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        return card.color !== topCard.color && 
               values.indexOf(card.value) === values.indexOf(topCard.value) - 1;
    }

    findCard(cardId) {
        // Check waste pile
        const wasteIndex = this.waste.findIndex(card => card.id === cardId);
        if (wasteIndex !== -1) return [this.waste, wasteIndex];

        // Check foundation piles
        for (const pile of this.foundation) {
            const index = pile.findIndex(card => card.id === cardId);
            if (index !== -1) return [pile, index];
        }

        // Check tableau piles
        for (const pile of this.tableau) {
            const index = pile.findIndex(card => card.id === cardId);
            if (index !== -1) return [pile, index];
        }

        return [null, -1];
    }

    getCardFromPile(pile, cardId) {
        return pile.find(card => card.id === cardId);
    }

    getPileType(pile) {
        if (pile === this.waste) return 'waste';
        if (this.foundation.includes(pile)) return 'foundation';
        if (this.tableau.includes(pile)) return 'tableau';
        return null;
    }

    getPileIndex(pile) {
        if (pile === this.waste) return 0;
        return this.foundation.indexOf(pile) !== -1 
            ? this.foundation.indexOf(pile)
            : this.tableau.indexOf(pile);
    }

    getPileByType(type, index) {
        if (type === 'waste') return this.waste;
        if (type === 'foundation') return this.foundation[index];
        if (type === 'tableau') return this.tableau[index];
        return null;
    }

    getTargetPileArray(element) {
        if (element.classList.contains('foundation-pile')) {
            const index = Array.from(element.parentNode.children).indexOf(element);
            return this.foundation[index];
        } else {
            const index = Array.from(element.parentNode.children).indexOf(element);
            return this.tableau[index];
        }
    }

    clearDropTargets() {
        document.querySelectorAll('.valid-drop-target').forEach(element => {
            element.classList.remove('valid-drop-target');
        });
    }

    checkWinCondition() {
        const isWon = this.foundation.every(pile => 
            pile.length === 13 && pile[12].value === 'K'
        );

        if (isWon) {
            document.getElementById('win-message').classList.remove('hidden');
        }
    }

    render() {
        // Clear existing cards
        document.querySelectorAll('.card').forEach(card => card.remove());

        // Render deck
        const deckElement = document.getElementById('deck');
        if (this.deck.length > 0) {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            const img = document.createElement('img');
            img.src = 'assets/cards/card_back.png';
            img.alt = 'Card back';
            cardElement.appendChild(img);
            deckElement.appendChild(cardElement);
        }

        // Render waste pile
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            this.renderCard(document.getElementById('waste'), topCard, 0);
        }

        // Render foundation piles
        this.foundation.forEach((pile, i) => {
            const pileElement = document.querySelectorAll('.foundation-pile')[i];
            pile.forEach((card, index) => {
                this.renderCard(pileElement, card, index);
            });
        });

        // Render tableau piles
        this.tableau.forEach((pile, i) => {
            const pileElement = document.querySelectorAll('.tableau-pile')[i];
            pile.forEach((card, index) => {
                this.renderCard(pileElement, card, index);
            });
        });
    }
    renderCard(container, card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.transform = `translateY(${index * 20}px)`;
        cardElement.dataset.id = card.id;

        const img = document.createElement('img');
        if (card.faceUp) {
            img.src = `assets/cards/${card.value.toLowerCase()}_of_${card.suit}.png`;
            cardElement.draggable = true;
        } else {
            img.src = 'assets/cards/card_back.png';
        }
        img.alt = card.faceUp ? `${card.value} of ${card.suit}` : 'Card back';

        cardElement.appendChild(img);
        container.appendChild(cardElement);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
});
