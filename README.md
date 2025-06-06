# Knot Puzzle Game

A web-based puzzle game where players arrange and connect knot pieces to solve patterns. Built with Flask, JavaScript, and modern CSS.

## Features

- **Drag & Drop Interface**: Intuitive piece placement with smooth drag and drop functionality
- **Piece Rotation**: Use the mouse wheel to rotate pieces for perfect alignment
- **Layer Control**: Right-click menu to adjust piece layering:
  - Bring to Front
  - Send to Back
  - Bring Forward
  - Send Backward
- **Puzzle Navigation**: Browse through multiple puzzles using arrow buttons
- **Preview System**: View the completed puzzle pattern for reference
- **Piece Management**: 
  - Organized piece tray
  - Drag pieces onto the board
  - Remove pieces using the trash can
- **Responsive Design**: Clean, modern interface that adapts to different screen sizes

## Technologies Used

- **Backend**: Flask 3.0.0 (Python)
- **Frontend**: 
  - Vanilla JavaScript (ES6+)
  - Modern CSS with Flexbox
  - HTML5 Drag and Drop API
- **Assets**: PNG images for puzzle pieces

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Rwilly1/KnotPuzzle.git
   cd KnotPuzzle
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   flask run
   ```

5. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

## Game Controls

- **Left Click + Drag**: Move pieces
- **Mouse Wheel**: Rotate selected piece
- **Right Click**: Open layer control menu
- **Left/Right Arrows**: Navigate between puzzles
- **Drag to Trash**: Remove pieces from board

## Project Structure

```
knotgame/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── static/
│   ├── css/
│   │   ├── style.css         # Main styles
│   │   └── context-menu.css  # Layer control menu styles
│   ├── js/
│   │   └── script.js         # Game logic
│   └── img/                  # Puzzle pieces and patterns
└── templates/
    └── index.html     # Main game interface
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built as a learning project for web development and game design
- Inspired by classic puzzle and knot-tying games
