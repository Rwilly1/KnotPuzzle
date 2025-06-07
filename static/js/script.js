// Knot Puzzle Game - JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('Knot Puzzle Game script loaded.');

    const puzzleContainer = document.getElementById('puzzle-container');
    const piecesTray = document.getElementById('pieces-tray');
    const trashCan = document.getElementById('trash-can');
    let selectedPiece = null;

    const finishedPuzzleImg = document.getElementById('finished-puzzle-img');
    const prevPuzzleBtn = document.getElementById('prev-puzzle-btn');
    const nextPuzzleBtn = document.getElementById('next-puzzle-btn');

    // Preload the transparent drag image
    const emptyDragImage = new Image();
    emptyDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // --- Puzzle Data ---
    const puzzles = [
        {
            id: 'puzzle1',
            name: 'Puzzle 1',
            previewImage: '/static/img/Puzzle1.png', // Corrected filename
            availablePieces: [
                { id: 'pieceCurve', imgSrc: '/static/img/curve.png', original: true },
                { id: 'pieceStraight', imgSrc: '/static/img/straight.png', original: true }
            ]
        },
        {
            id: 'puzzle2',
            name: 'Puzzle 2',
            previewImage: '/static/img/Puzzle2.png', // Corrected filename
            availablePieces: [
                // Assuming same pieces for now, can be customized
                { id: 'pieceCurve', imgSrc: '/static/img/curve.png', original: true },
                { id: 'pieceStraight', imgSrc: '/static/img/straight.png', original: true }
            ]
        }
        // Add more puzzles here
    ];
    let currentPuzzleIndex = 0;
    let currentPuzzlePiecesData = []; // Holds pieces for the *current* puzzle

    // --- Load Pieces to Tray (uses currentPuzzlePiecesData) ---
    function loadPiecesToTray() {
        piecesTray.innerHTML = '';
        currentPuzzlePiecesData.forEach(pieceData => {
            if (pieceData.original) {
                const pieceElement = document.createElement('img');
                // Use a base ID for originals in tray, instances will get unique IDs
                pieceElement.id = pieceData.id + '_trayOriginal'; 
                pieceElement.src = pieceData.imgSrc;
                pieceElement.classList.add('puzzle-piece');
                pieceElement.draggable = true;
                // This dataset.sourceId is what's cloned to make instances
                pieceElement.dataset.sourceId = pieceData.id; 
                piecesTray.appendChild(pieceElement);
                pieceElement.addEventListener('dragstart', handleDragStart);
            }
        });
    }

    // --- Load Specific Puzzle ---
    function loadPuzzle(puzzleIndex) {
        if (puzzleIndex < 0 || puzzleIndex >= puzzles.length) {
            console.error('Invalid puzzle index:', puzzleIndex);
            return;
        }
        currentPuzzleIndex = puzzleIndex;
        const puzzle = puzzles[currentPuzzleIndex];

        finishedPuzzleImg.src = puzzle.previewImage;
        finishedPuzzleImg.alt = puzzle.name + " Preview";
        
        puzzleContainer.innerHTML = ''; // Clear the board
        selectedPiece = null; // Deselect any piece

        // Update the pieces data for the current puzzle and reload the tray
        currentPuzzlePiecesData = puzzle.availablePieces;
        loadPiecesToTray();

        // Update navigation buttons
        prevPuzzleBtn.disabled = currentPuzzleIndex === 0;
        nextPuzzleBtn.disabled = currentPuzzleIndex === puzzles.length - 1;
        console.log(`Loaded ${puzzle.name}`);
    }

    // --- Event Listeners for Puzzle Navigation ---
    prevPuzzleBtn.addEventListener('click', () => {
        if (currentPuzzleIndex > 0) {
            loadPuzzle(currentPuzzleIndex - 1);
        }
    });

    nextPuzzleBtn.addEventListener('click', () => {
        if (currentPuzzleIndex < puzzles.length - 1) {
            loadPuzzle(currentPuzzleIndex + 1);
        }
    });

    function handleDragStart(event) {
        const draggedElement = event.target;
        const dragId = draggedElement.dataset.sourceId || draggedElement.id;
        event.dataTransfer.setData('text/plain', dragId);

        // Store the current rotation in dataTransfer
        const rotation = draggedElement.dataset.rotation || '0';
        event.dataTransfer.setData('rotation', rotation);
        
        // Store original position for potential return, but ONLY if it's a piece on the board
        if (draggedElement.parentElement === puzzleContainer) {
            event.dataTransfer.setData('isOnBoard', 'true');
            event.dataTransfer.setData('originalLeft', draggedElement.style.left);
            event.dataTransfer.setData('originalTop', draggedElement.style.top);
        } else {
            event.dataTransfer.setData('isOnBoard', 'false');
        }
        
        // Use the preloaded transparent image as drag image
        event.dataTransfer.setDragImage(emptyDragImage, 0, 0);

        // Hide the original element during drag only if it's on the board
        if (draggedElement.parentElement === puzzleContainer) {
            draggedElement.style.opacity = '0';
        }

        // Create a visual feedback element that follows the mouse
        const visualFeedback = draggedElement.cloneNode(true);
        visualFeedback.id = 'drag-feedback';
        visualFeedback.style.position = 'fixed';
        visualFeedback.style.pointerEvents = 'none';
        visualFeedback.style.transform = `rotate(${rotation}deg)`;
        visualFeedback.style.opacity = '0';
        visualFeedback.style.zIndex = '1000';
        visualFeedback.style.left = '-1000px'; // Position off-screen initially
        visualFeedback.style.top = '-1000px';
        document.body.appendChild(visualFeedback);
        
        // Make it visible in the next frame
        requestAnimationFrame(() => {
            visualFeedback.style.opacity = '0.8';
        });

        // Store initial mouse position relative to the piece
        const rect = draggedElement.getBoundingClientRect();
        const mouseOffsetX = event.clientX - rect.left;
        const mouseOffsetY = event.clientY - rect.top;
        draggedElement.dataset.mouseOffsetX = mouseOffsetX;
        draggedElement.dataset.mouseOffsetY = mouseOffsetY;

        // Update visual feedback position during drag
        const moveHandler = (e) => {
            if (visualFeedback) {
                const pieceWidth = visualFeedback.offsetWidth;
                const pieceHeight = visualFeedback.offsetHeight;
                visualFeedback.style.left = `${e.clientX - pieceWidth/2}px`;
                visualFeedback.style.top = `${e.clientY - pieceHeight/2}px`;
            }
        };

        // Clean up on drag end
        const endHandler = () => {
            if (visualFeedback && visualFeedback.parentElement) {
                document.body.removeChild(visualFeedback);
            }
            // Restore the original element's opacity
            draggedElement.style.opacity = '1';
            document.removeEventListener('dragover', moveHandler);
            document.removeEventListener('dragend', endHandler);
        };

        document.addEventListener('dragover', moveHandler);
        document.addEventListener('dragend', endHandler);

        // Mark if piece is from the board for drop handling
        if (draggedElement.parentElement === puzzleContainer) {
            event.dataTransfer.setData('sourceContainer', 'puzzleContainer');
        }

        console.log(`Dragging: ${dragId} with rotation ${rotation}°`);
    }

    // Add double-click handler for piece selection
    puzzleContainer.addEventListener('dblclick', (event) => {
        const clickedPiece = event.target.closest('.puzzle-piece');
        if (clickedPiece) {
            // Remove selection from previously selected piece
            if (selectedPiece && selectedPiece !== clickedPiece) {
                selectedPiece.classList.remove('selected-piece');
            }
            
            // Toggle selection on clicked piece
            clickedPiece.classList.toggle('selected-piece');
            selectedPiece = clickedPiece.classList.contains('selected-piece') ? clickedPiece : null;
        }
    });

    // --- Puzzle Container Drop Logic --- 
    puzzleContainer.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
    });

    puzzleContainer.addEventListener('drop', (event) => {
        event.preventDefault();
        const transferredId = event.dataTransfer.getData('text/plain');
        let pieceToDrop = document.getElementById(transferredId);
        const rotation = event.dataTransfer.getData('rotation') || '0';

        if (!pieceToDrop || pieceToDrop.parentElement !== puzzleContainer) {
            const originalPieceData = currentPuzzlePiecesData.find(p => p.id === transferredId);
            if (originalPieceData) {
                // Create new instance from tray piece
                pieceToDrop = document.createElement('img');
                pieceToDrop.src = originalPieceData.imgSrc;
                pieceToDrop.id = originalPieceData.id + '_instance_' + Date.now();
                pieceToDrop.classList.add('puzzle-piece');
                pieceToDrop.draggable = true;
                pieceToDrop.style.zIndex = '1'; // Set initial z-index

                // Add event listeners
                pieceToDrop.addEventListener('dragstart', handleDragStart);
                pieceToDrop.addEventListener('click', handlePieceSelection);
                pieceToDrop.addEventListener('wheel', handlePieceRotation, { passive: false });
            } else {
                console.error('Could not determine piece to drop from ID:', transferredId);
                return;
            }
        }

        const rect = puzzleContainer.getBoundingClientRect();
        const pieceWidth = pieceToDrop.offsetWidth || parseInt(getComputedStyle(pieceToDrop).height, 10) || 50;
        const pieceHeight = pieceToDrop.offsetHeight || parseInt(getComputedStyle(pieceToDrop).height, 10) || 50;

        // Position the piece centered on the mouse cursor
        pieceToDrop.style.position = 'absolute';
        pieceToDrop.style.left = `${event.clientX - rect.left - pieceWidth/2}px`;
        pieceToDrop.style.top = `${event.clientY - rect.top - pieceHeight/2}px`;
        pieceToDrop.dataset.rotation = rotation;
        pieceToDrop.style.transform = `rotate(${rotation}deg)`;

        puzzleContainer.appendChild(pieceToDrop);
        console.log(`Dropped ${pieceToDrop.id} at (${pieceToDrop.style.left}, ${pieceToDrop.style.top}) with rotation ${rotation}°`);
    });

    // --- Trash Can Drop Logic ---
    trashCan.addEventListener('dragover', (event) => {
        event.preventDefault(); // Allow drop
        // Check if the item being dragged is from the puzzle container
        const draggedElementId = event.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedElementId);
        if (draggedElement && draggedElement.parentElement === puzzleContainer) {
             trashCan.classList.add('trash-hover');
        }
    });

    trashCan.addEventListener('dragleave', () => {
        trashCan.classList.remove('trash-hover');
    });

    trashCan.addEventListener('drop', (event) => {
        event.preventDefault();
        const pieceId = event.dataTransfer.getData('text/plain');
        const pieceElement = document.getElementById(pieceId);

        // Clean up any existing drag feedback
        const existingFeedback = document.getElementById('drag-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        if (pieceElement && pieceElement.parentElement === puzzleContainer) {
            // Show confirmation dialog
            const confirmDelete = window.confirm('Are you sure you want to delete this piece?');

            if (confirmDelete) {
                // Immediately deselect if it was selected
                if (selectedPiece === pieceElement) {
                    selectedPiece = null;
                }
                
                // Immediately remove the piece
                pieceElement.remove();
                console.log(`Trashed piece: ${pieceId}`);
            } else {
                // Restore the piece to its original position
                const originalLeft = event.dataTransfer.getData('originalLeft');
                const originalTop = event.dataTransfer.getData('originalTop');
                const rotation = event.dataTransfer.getData('rotation') || '0';
                
                // Only restore position if it was originally on the board
                const wasOnBoard = event.dataTransfer.getData('isOnBoard') === 'true';
                if (wasOnBoard) {
                    pieceElement.style.opacity = '1';
                    pieceElement.style.left = originalLeft;
                    pieceElement.style.top = originalTop;
                    pieceElement.dataset.rotation = rotation;
                    
                    // Add a subtle bounce animation
                    pieceElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    pieceElement.style.transform = `rotate(${rotation}deg) scale(1.1)`;
                    setTimeout(() => {
                        pieceElement.style.transform = `rotate(${rotation}deg) scale(1)`;
                        // Remove the transition after animation
                        setTimeout(() => {
                            pieceElement.style.transition = '';
                        }, 300);
                    }, 50);
                }
                
                console.log(`Returned piece ${pieceId} to board`);
            }
        }
        trashCan.classList.remove('trash-hover');
    });

    // --- Piece Selection Logic ---
    function handlePieceSelection(event) {
        const clickedPiece = event.currentTarget; 
        if (clickedPiece.parentElement !== puzzleContainer) return; 

        if (selectedPiece === clickedPiece) {
            // Clicked on the already selected piece, so deselect it
            selectedPiece.classList.remove('selected-piece');
            selectedPiece = null; 
        } else {
            // Clicked on a new piece, or no piece was selected
            if (selectedPiece) {
                selectedPiece.classList.remove('selected-piece'); // Deselect old one
            }
            selectedPiece = clickedPiece;
            selectedPiece.classList.add('selected-piece');
            if (!selectedPiece.dataset.rotation) { 
                selectedPiece.dataset.rotation = "0";
            }
        }
    }
    
    // --- Piece Rotation Logic (Mouse Wheel) ---
    function handlePieceRotation(event) {
        if (event.currentTarget === selectedPiece) { 
            event.preventDefault(); 

            let currentRotation = parseFloat(selectedPiece.dataset.rotation || 0);
            const rotationAmount = event.deltaY > 0 ? 15 : -15; 
            currentRotation = (currentRotation + rotationAmount);
            
            selectedPiece.dataset.rotation = currentRotation;
            selectedPiece.style.transform = `rotate(${currentRotation}deg)`;
        }
    }
    
    // --- Arrow Key Rotation Logic ---
    document.addEventListener('keydown', (event) => {
        if (!selectedPiece) return; // Only act if a piece is selected

        let rotationAmount = 0;
        if (event.key === 'ArrowLeft') {
            rotationAmount = -15; // Rotate counter-clockwise
        } else if (event.key === 'ArrowRight') {
            rotationAmount = 15;  // Rotate clockwise
        }

        if (rotationAmount !== 0) {
            event.preventDefault(); // Prevent page scrolling with arrow keys
            let currentRotation = parseFloat(selectedPiece.dataset.rotation || 0);
            currentRotation = (currentRotation + rotationAmount);
            
            selectedPiece.dataset.rotation = currentRotation;
            selectedPiece.style.transform = `rotate(${currentRotation}deg)`;
            console.log(`Arrow key rotated ${selectedPiece.id} to ${currentRotation}deg`);
        }
    });

    // --- Deselect piece when clicking on the puzzle board background ---
    puzzleContainer.addEventListener('click', (event) => {
        // Check if the click was directly on the puzzleContainer itself,
        // and not on a child element (like another puzzle piece).
        if (event.target === puzzleContainer) {
            if (selectedPiece) {
                selectedPiece.classList.remove('selected-piece');
                selectedPiece = null;
                // console.log('Piece deselected by clicking background.'); // Optional for debugging
            }
        }
    });

    // --- Layer Control Functions ---
    function bringToFront(piece) {
        const pieces = Array.from(puzzleContainer.children);
        const maxZ = Math.max(...pieces.map(p => parseInt(p.style.zIndex || 0)), 0);
        piece.style.zIndex = maxZ + 1;
    }

    function sendToBack(piece) {
        // First, set all other pieces' z-index up by 1
        const pieces = Array.from(puzzleContainer.children);
        pieces.forEach(p => {
            if (p !== piece) {
                const currentZ = parseInt(p.style.zIndex || 1);
                p.style.zIndex = currentZ + 1;
            }
        });
        // Then set this piece to z-index 1
        piece.style.zIndex = '1';
    }

    function bringForward(piece) {
        const currentZ = parseInt(piece.style.zIndex || 0);
        const nextPiece = Array.from(puzzleContainer.children)
            .find(p => parseInt(p.style.zIndex || 0) === currentZ + 1);
        
        if (nextPiece) {
            nextPiece.style.zIndex = currentZ;
            piece.style.zIndex = currentZ + 1;
        } else {
            piece.style.zIndex = currentZ + 1;
        }
    }

    function sendBackward(piece) {
        const currentZ = parseInt(piece.style.zIndex || 0);
        if (currentZ <= 1) return; // Don't go below 1
        
        const prevPiece = Array.from(puzzleContainer.children)
            .find(p => parseInt(p.style.zIndex || 0) === currentZ - 1);
            
        if (prevPiece) {
            prevPiece.style.zIndex = currentZ;
            piece.style.zIndex = currentZ - 1;
        } else {
            piece.style.zIndex = currentZ - 1;
        }
    }

    // Create context menu element
    const contextMenu = document.createElement('div');
    contextMenu.id = 'context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="bring-front">Bring to Front</div>
        <div class="context-menu-item" data-action="send-back">Send to Back</div>
        <div class="context-menu-item" data-action="bring-forward">Bring Forward</div>
        <div class="context-menu-item" data-action="send-backward">Send Backward</div>
    `;
    document.body.appendChild(contextMenu);

    // --- Context Menu Event Handlers ---
    let contextMenuTarget = null;

    // Handle right-click on puzzle pieces
    puzzleContainer.addEventListener('contextmenu', (event) => {
        const piece = event.target;
        if (!piece.classList.contains('puzzle-piece') || piece.parentElement !== puzzleContainer) return;

        event.preventDefault();
        contextMenuTarget = piece;

        // Ensure the piece has a z-index
        if (!piece.style.zIndex) {
            piece.style.zIndex = '1';
        }

        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
    });

    // Handle context menu item clicks
    contextMenu.addEventListener('click', (event) => {
        const action = event.target.dataset.action;
        if (!contextMenuTarget || !action) return;

        switch(action) {
            case 'bring-front':
                bringToFront(contextMenuTarget);
                break;
            case 'send-back':
                sendToBack(contextMenuTarget);
                break;
            case 'bring-forward':
                bringForward(contextMenuTarget);
                break;
            case 'send-backward':
                sendBackward(contextMenuTarget);
                break;
        }

        contextMenu.style.display = 'none';
        contextMenuTarget = null;
    });

    // Hide context menu when clicking elsewhere
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
        contextMenuTarget = null;
    });

    // Initial load - Load the first puzzle
    loadPuzzle(currentPuzzleIndex);
    console.log('Game initialized with puzzle navigation. Arrow key, trash can, and wheel rotation logic active.');
});
