# Priyanka Saha - 3D Portfolio Website

A stunning 3D portfolio website featuring an interactive WebGL particle background, smooth animations, and a professional dark-themed design.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-19-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Live Demo

**[View Live Portfolio](https://deploy-portfolio-3.preview.emergentagent.com)**

## Features

- **3D WebGL Particle Background** - Interactive particle system with mouse tracking and smooth animations
- **Responsive Design** - Mobile-friendly layout with adaptive navigation
- **7 Professional Sections**:
  - Hero with animated introduction
  - About with personal info grid
  - Skills & Tools categorized display
  - Projects showcase
  - Education timeline
  - Certifications
  - Contact section
- **Smooth Animations** - Scroll-reveal effects and hover interactions
- **Modern Typography** - Space Grotesk + Inter font combination
- **Side Navigation** - Fixed navigation dots with active section tracking
- **Custom Cursor Glow** - Subtle mouse-following glow effect

## Tech Stack

- **React 19** - UI framework
- **WebGL** - 3D particle graphics
- **CSS3** - Custom animations and styling
- **Google Fonts** - Space Grotesk & Inter typography

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/PriyankaSaha01/priyanka-portfolio.git
cd priyanka-portfolio
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn start
# or
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
yarn build
# or
npm run build
```

The optimized production build will be in the `build/` folder.

## Project Structure

```
priyanka-portfolio/
├── public/
│   └── index.html          # HTML template with meta tags
├── src/
│   ├── App.js              # Main component with 3D effects & all sections
│   ├── App.css             # Complete styling and animations
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── lib/
│       └── utils.js        # Utility functions
├── .gitignore
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── craco.config.js         # Build configuration
└── README.md
```

## Customization

### Update Personal Information

Edit `src/App.js` to update:
- Name and tagline in the Hero section
- About description
- Skills and tools in each category
- Project details
- Education and certifications
- Contact information

### Change Colors

Edit `src/App.css` and modify the CSS variables at the top:

```css
:root {
  --bg: #0a0a0f;           /* Background */
  --card: #1a1a26;         /* Card background */
  --accent: #c9a0dc;       /* Purple accent */
  --accent2: #7eb8da;      /* Blue accent */
  --accent3: #f2c57c;      /* Gold accent */
  --text: #e8e6f0;         /* Primary text */
  --text-dim: #8a889a;     /* Secondary text */
}
```

### Adjust 3D Particle Effects

In `src/App.js`, find the particle configuration:

```javascript
const NUM = 400;           // Number of particles (increase for more density)
const CONN_DIST = 4.5;     // Connection distance between particles
```

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your GitHub repository
4. Build settings:
   - Build command: `yarn build`
   - Publish directory: `build`

### Deploy to GitHub Pages

1. Install gh-pages:
```bash
yarn add -D gh-pages
```

2. Add to `package.json`:
```json
{
  "homepage": "https://priyankasaha01.github.io/priyanka-portfolio",
  "scripts": {
    "predeploy": "yarn build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:
```bash
yarn deploy
```

## Contact

**Priyanka Saha**
- Email: priyanka.riya2003@gmail.com
- Phone: +91-8597049809
- Location: Malda, West Bengal
- GitHub: [@PriyankaSaha01](https://github.com/PriyankaSaha01)

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with love by Priyanka Saha | Powered by Emergent
