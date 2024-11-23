# Divine Society Simulation

An infinite, AI-powered world simulation where autonomous agents live, interact, and evolve in a procedurally generated landscape. Take on the role of a divine overseer and watch as your world comes to life!

## Features

- **Infinite World**: Explore an endless, procedurally generated landscape with diverse biomes and resources
- **AI-Powered Agents**: Autonomous beings that make intelligent decisions using GPT-4
- **Multiple Species**: Choose from various species types:
  - Gatherers: Collect and share resources
  - Builders: Construct infrastructure
  - Explorers: Discover new areas
  - Traders: Exchange resources and form alliances
- **Divine Intervention**: Influence your world through the God Panel
- **Dynamic Evolution**: Watch your society grow and adapt

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/divine-society-sim.git
cd divine-society-sim
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up your OpenAI API key:
- Open `src/utils/openai.ts`
- Replace `'Replace with your OpenAI API key'` with your actual OpenAI API key

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. **Initial Setup**
   - When you first load the simulation, you'll see the Species Selection dialog
   - Choose which species you want in your world and their quantities
   - Click "Create Society" to begin

2. **Navigation**
   - Pan: Click and drag to move around the world
   - Zoom: Use mouse wheel to zoom in/out
   - Hover over agents to see their details

3. **World Interaction**
   - Use the God Panel to influence the world
   - Watch the Event Log to see what's happening
   - Observe agents as they make decisions and interact

## Technologies Used

- React + TypeScript
- OpenAI GPT-4 API
- Tailwind CSS
- Zustand (State Management)
- Simplex Noise (World Generation)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Important Notes

- This project requires an OpenAI API key to function
- API calls are made for agent decisions, which may incur costs
- Consider implementing rate limiting for API calls
- The simulation can be resource-intensive with many agents

## Known Issues

- High CPU usage with many agents
- Occasional API rate limiting
- Memory usage grows with world exploration

## Future Plans

- [ ] Agent memory and learning
- [ ] Complex social structures
- [ ] More diverse world events
- [ ] Resource management systems
- [ ] Save/Load functionality

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
