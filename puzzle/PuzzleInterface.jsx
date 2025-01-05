import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const PuzzleInterface = () => {
  const [showGenerator, setShowGenerator] = useState(false);
  
  const predefinedPuzzles = [
    { 
      title: "Mountain Lake", 
      image: "/api/placeholder/300/200",
      difficulty: "Easy",
      dimensions: "3x3"
    },
    { 
      title: "City Sunset", 
      image: "/api/placeholder/300/200",
      difficulty: "Medium",
      dimensions: "4x4"
    },
    { 
      title: "Forest Path", 
      image: "/api/placeholder/300/200",
      difficulty: "Hard",
      dimensions: "5x5"
    }
  ];

  return (
    <div className="w-full px-4 py-8 mt-16">
      {/* Pre-configured Puzzles */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Choose a Puzzle</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {predefinedPuzzles.map((puzzle, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <img 
                  src={puzzle.image} 
                  alt={puzzle.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <h3 className="font-bold">{puzzle.title}</h3>
                <div className="text-sm text-gray-600">
                  <p>Difficulty: {puzzle.difficulty}</p>
                  <p>Size: {puzzle.dimensions}</p>
                </div>
                <button 
                  className="mt-2 w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                  onClick={() => console.log(`Starting puzzle: ${puzzle.title}`)}
                >
                  Start Puzzle
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Your Own Puzzle Button */}
      <div className="text-center mb-4">
        <button 
          className="bg-teal-600 text-white py-2 px-6 rounded-md hover:bg-teal-700"
          onClick={() => setShowGenerator(!showGenerator)}
        >
          Create Your Own Puzzle
        </button>
      </div>

      {/* Puzzle Generator Form */}
      {showGenerator && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Generate Your Puzzle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input 
                  type="text" 
                  placeholder="Enter image URL"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Width</label>
                  <input 
                    type="number" 
                    min="2" 
                    max="10"
                    placeholder="Columns"
                    className="w-24 p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Height</label>
                  <input 
                    type="number" 
                    min="2" 
                    max="10"
                    placeholder="Rows"
                    className="w-24 p-2 border rounded-md"
                  />
                </div>
              </div>
              <button 
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
                onClick={() => console.log('Generating puzzle...')}
              >
                Generate Puzzle
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PuzzleInterface;