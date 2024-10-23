const backgrounds = [
    '../assets/images/backgrounds/backgroundCastles.png',
    '../assets/images/backgrounds/backgroundColorDesert.png',
    '../assets/images/backgrounds/backgroundColorFall.png',
    '../assets/images/backgrounds/backgroundColorForest.png',
    '../assets/images/backgrounds/backgroundColorGrass.png',
    '../assets/images/backgrounds/backgroundDesert.png',
    '../assets/images/backgrounds/backgroundForest.png'
];

let currentBackgroundIndex = 0;
let isBg1Visible = true;

// Function to change the background
function changeBackground() {
    const bg1 = document.getElementById('bg1');
    const bg2 = document.getElementById('bg2');

    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;

    if (isBg1Visible) {
        bg2.style.backgroundImage = `url(${backgrounds[currentBackgroundIndex]})`;
        bg2.style.opacity = 1; // Show bg2
        bg1.style.opacity = 0; // Hide bg1
    } else {
        bg1.style.backgroundImage = `url(${backgrounds[currentBackgroundIndex]})`;
        bg1.style.opacity = 1; // Show bg1
        bg2.style.opacity = 0; // Hide bg2
    }

    isBg1Visible = !isBg1Visible; // Toggle visibility
}

// Change the background every 4 seconds
setInterval(changeBackground, 4000);

// Variables for character state
let isJumping = false;
let jumpTimeout;
let jumpDuration = 1000; // Duration of the jump
let verticalPosition = 0; // Vertical position of the character
let horizontalSpeed = 10; // Speed of horizontal movement
let isMovingRight = false; // Check if the character is moving right
let isMovingLeft = false; // Check if the character is moving left
let fallTimeout;
let walkAnimationFrame = 0; // Frame index for walking animation
let walkAnimationInterval; // Interval for switching walk images

// Get the character's maximum movement bounds
const windowWidth = window.innerWidth;

// Function to jump
function characterJump() {
    if (isJumping) return; // Prevent double jumping
    isJumping = true;

    const character = document.getElementById('game-character');
    character.style.backgroundImage = "url('../assets/images/characters/platformChar_jump.png')"; // Jump image

    // Move the character up for a short duration
    verticalPosition += 50; // Set the jump height
    character.style.bottom = `${verticalPosition}px`; // Update position

    // Allow the character to stay in the air for 1 second before starting to fall
    jumpTimeout = setTimeout(() => {
        fall(); // Start falling after jump
    }, jumpDuration);
}

// Function to handle the fall
function fall() {
    const character = document.getElementById('game-character');

    // Start falling after 1 second
    fallTimeout = setInterval(() => {
        if (verticalPosition > 0) {
            verticalPosition -= 5; // Move down by 5 pixels
            character.style.bottom = `${verticalPosition}px`; // Update position
        } else {
            clearInterval(fallTimeout); // Stop falling when on the ground
            verticalPosition = 0; // Reset position
            character.style.backgroundImage = "url('../assets/images/characters/platformChar_idle.png')"; // Set to idle image
            isJumping = false; // Reset jump state
            clearInterval(walkAnimationInterval); // Stop walking animation
            walkAnimationFrame = 0; // Reset animation frame
        }
    }, 50); // Update fall position every 50ms
}

// Function to start the game
function startGame() {
    const startCharacter = document.getElementById('start-character');
    const gameCharacter = document.getElementById('game-character');
    const startButton = document.querySelector('.start-button');

    // Hide start character and button
    startCharacter.style.display = 'none';
    startButton.style.display = 'none'; // Hide the start button

    // Show game character
    gameCharacter.style.display = 'block';
    gameCharacter.style.backgroundImage = "url('../assets/images/characters/platformChar_idle.png')"; // Set to idle image

    // Add keydown event for character movement
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp); // Add keyup event listener
}

// Handle keydown events for movement
function handleKeyDown(event) {
    const gameCharacter = document.getElementById('game-character');
    const leftPos = parseInt(window.getComputedStyle(gameCharacter).left);

    // Check if the jump key (space or ArrowUp) is pressed
    if (event.key === ' ' || event.key === 'ArrowUp') {
        characterJump(); // Jump on space bar or arrow up
        return; // Prevent further handling
    }

    // Check if the right arrow key is pressed
    if (event.key === 'ArrowRight') {
        isMovingRight = true; // Set moving right state
        gameCharacter.style.transform = "scaleX(1)"; // Face right
    }

    // Check if the left arrow key is pressed
    if (event.key === 'ArrowLeft') {
        isMovingLeft = true; // Set moving left state
        gameCharacter.style.transform = "scaleX(-1)"; // Face left (mirror image)
    }

    // Start walking animation if moving
    if (isMovingRight || isMovingLeft) {
        startWalkingAnimation();
        const newLeftPos = leftPos + (isMovingRight ? horizontalSpeed : -horizontalSpeed);

        // Prevent moving out of the screen bounds
        if (newLeftPos >= 0 && newLeftPos <= windowWidth - gameCharacter.offsetWidth) {
            gameCharacter.style.left = `${newLeftPos}px`; // Move character within bounds
        }
    }
}

// Function to start walking animation
function startWalkingAnimation() {
    const gameCharacter = document.getElementById('game-character');

    if (!walkAnimationInterval) {
        walkAnimationFrame = 0; // Reset animation frame
        walkAnimationInterval = setInterval(() => {
            if (isMovingRight || isMovingLeft) {
                // Alternate between the two walk images
                walkAnimationFrame++;
                gameCharacter.style.backgroundImage = walkAnimationFrame % 2 === 0
                    ? "url('../assets/images/characters/platformChar_walk1.png')"
                    : "url('../assets/images/characters/platformChar_walk2.png')";
            }
        }, 200); // Change image every 200 ms
    }
}

// Handle keyup events to stop movement
function handleKeyUp(event) {
    const gameCharacter = document.getElementById('game-character');

    // Check if the right arrow key is released
    if (event.key === 'ArrowRight') {
        isMovingRight = false; // Reset moving right state
    }

    // Check if the left arrow key is released
    if (event.key === 'ArrowLeft') {
        isMovingLeft = false; // Reset moving left state
    }

    // Stop walking animation if both keys are released
    if (!isJumping && !isMovingRight && !isMovingLeft) {
        gameCharacter.style.backgroundImage = "url('../assets/images/characters/platformChar_idle.png')"; // Set to idle image
        clearInterval(walkAnimationInterval); // Stop walking animation
        walkAnimationInterval = null; // Reset animation interval
        walkAnimationFrame = 0; // Reset animation frame
    }
}

// Continuously check for movement while jumping
function updateMovement() {
    const gameCharacter = document.getElementById('game-character');
    const leftPos = parseInt(window.getComputedStyle(gameCharacter).left);

    if (isJumping) {
        // If jumping, allow movement but keep jump image
        if (isMovingRight) {
            const newLeftPos = leftPos + horizontalSpeed;
            if (newLeftPos <= windowWidth - gameCharacter.offsetWidth) {
                gameCharacter.style.left = `${newLeftPos}px`; // Move right within bounds
            }
        }
        if (isMovingLeft) {
            const newLeftPos = leftPos - horizontalSpeed;
            if (newLeftPos >= 0) {
                gameCharacter.style.left = `${newLeftPos}px`; // Move left within bounds
            }
        }
    } else {
        // If on the ground, allow walking animation
        if (isMovingRight || isMovingLeft) {
            gameCharacter.style.backgroundImage = walkAnimationFrame % 2 === 0
                ? "url('../assets/images/characters/platformChar_walk1.png')"
                : "url('../assets/images/characters/platformChar_walk2.png')"; // Alternate between walking images
        }
    }
}

// Array to store active monsters
let monsters = [];

// Function to spawn a monster
function spawnMonster() {
    const monster = document.createElement('div');
    monster.classList.add('monster');
    monster.style.backgroundImage = "url('../assets/images/characters/blue-monster.gif')";
    monster.style.position = 'absolute';
    monster.style.right = '0px'; // Start on the right side
    monster.style.bottom = '10px'; // Lower the monster to near the ground
    monster.style.width = '150px'; // Increase monster width
    monster.style.height = '150px'; // Increase monster height

    document.body.appendChild(monster);
    monsters.push(monster); // Add the monster to the array

    // Move the monster from right to left
    let monsterPos = window.innerWidth; // Start at the right edge of the screen
    const monsterSpeed = 5; // Speed at which the monster moves

    const moveMonsterInterval = setInterval(() => {
        if (monsterPos <= -150) { // If the monster is off-screen on the left, remove it
            clearInterval(moveMonsterInterval);
            document.body.removeChild(monster);
            monsters = monsters.filter(m => m !== monster); // Remove from array
        } else {
            monsterPos -= monsterSpeed;
            monster.style.right = `${window.innerWidth - monsterPos}px`; // Move left
        }
    }, 50); // Move the monster every 50ms
}

// Function to spawn monsters every 3 seconds
setInterval(spawnMonster, 3000);

// Style for monsters (CSS in JS)
const style = document.createElement('style');
style.innerHTML = `
  .monster {
    background-size: contain;
    background-repeat: no-repeat;
  }
`;
document.head.appendChild(style);


// Start updating movement while the game is running
setInterval(updateMovement, 50);

// Event listener for start button
document.querySelector('.start-button').addEventListener('click', startGame);
