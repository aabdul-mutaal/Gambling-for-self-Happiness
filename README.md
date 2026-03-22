Gambling for Self-Happiness
A specialized browser extension designed to gamify personal well-being by managing mental health resources through interactive unboxing mechanics. This project serves as a creative metaphor for resource management, allowing users to "roll" for positive reinforcement and self-care items.

🚀 Key Features
Cinematic Unboxing Experience: High-fidelity slider animation with a 9.2-second roll duration and smooth ease-out physics.

Custom Image Pool: Personalize the experience by dragging and dropping local images or web URLs directly into the resource pool.

Rarity System: Items are categorized into five distinct rarity tiers, each with unique border highlights and winning probabilities:

⚪ Grey: Common (50%)

🔵 Blue: Rare (25%)

🟣 Purple: Epic (15%)

🔴 Red: Legendary (9%)

🟡 Gold: Mythic (1%)

Dynamic Visual Effects:

Spiral Glow: A rotating conic-gradient background that activates during the roll.

Magnifier Frame: A precision gold outline marker with a backdrop-filter effect to highlight the winning item.

Celebration: Integrated confetti bursts and amplified "yippee" audio triggers upon landing on a winner.

Persistence: All configuration settings, including theme (Dark/Light), volume, and the uploaded image pool, are saved locally in the browser.

🛠 Technical Architecture
The extension is built using standard web technologies optimized for browser performance:

Frontend: HTML5, CSS3 (Flexbox, CSS Animations, Custom Properties).

Logic: Asynchronous JavaScript handling image processing (FileReader API), storage (chrome.storage.local), and roll mathematics.

Audio Engine: Uses the Web Audio API with a dedicated AudioContext and GainNode to provide a 200% volume boost for celebratory sound effects.

📦 Installation
Download or clone this repository.

Open your browser's Extensions page (e.g., chrome://extensions).

Enable Developer Mode (usually a toggle in the top right).

Click Load unpacked and select the folder containing the extension files.

🎮 How to Use
Add Images: Click the Settings (Cog) icon at the bottom and drop your images into the drop zone.

Start a Roll: Navigate back to the home page and click the central Case icon to trigger the shake animation and start the unboxing.

Manage Pool: View and remove individual images from your resource pool within the settings menu at any time.
