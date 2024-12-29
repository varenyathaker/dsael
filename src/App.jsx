import React, { useState, useEffect } from 'react';

const VERTEX_RADIUS = 20;
const GRID_SIZE = 500;

export default function PathFindingVisualizer() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [path, setPath] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const initialNodes = [
      { id: 'A', x: 100, y: 100, name: 'Central Square' },
      { id: 'B', x: 250, y: 50, name: 'North Market' },
      { id: 'C', x: 400, y: 100, name: 'East Station' },
      { id: 'D', x: 100, y: 300, name: 'West Park' },
      { id: 'E', x: 250, y: 400, name: 'South Mall' },
      { id: 'F', x: 400, y: 300, name: 'East Park' }
    ];

    const initialEdges = [
      { from: 'A', to: 'B', weight: 5 },
      { from: 'A', to: 'C', weight: 4 },
      { from: 'A', to: 'D', weight: 6 },
      { from: 'B', to: 'C', weight: 8 },
      { from: 'D', to: 'E', weight: 7 },
      { from: 'C', to: 'F', weight: 5 },
      { from: 'E', to: 'F', weight: 4 }
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const findShortestPath = async () => {
    if (!startNode || !endNode || isAnimating) return;
    
    setIsAnimating(true);
    setPath([]);
    setVisitedNodes([]);

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    nodes.forEach(node => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
    });
    distances[startNode] = 0;

    while (unvisited.size > 0) {
      let minDistance = Infinity;
      let current = null;
      unvisited.forEach(nodeId => {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          current = nodeId;
        }
      });

      if (current === null) break;
      if (current === endNode) break;

      unvisited.delete(current);
      setVisitedNodes(prev => [...prev, current]);
      await new Promise(resolve => setTimeout(resolve, 500));

      edges.forEach(edge => {
        if (edge.from === current && unvisited.has(edge.to)) {
          const newDistance = distances[current] + edge.weight;
          if (newDistance < distances[edge.to]) {
            distances[edge.to] = newDistance;
            previous[edge.to] = current;
          }
        }
        if (edge.to === current && unvisited.has(edge.from)) {
          const newDistance = distances[current] + edge.weight;
          if (newDistance < distances[edge.from]) {
            distances[edge.from] = newDistance;
            previous[edge.from] = current;
          }
        }
      });
    }

    const pathArray = [];
    let current = endNode;
    while (current !== null) {
      pathArray.unshift(current);
      current = previous[current];
    }
    setPath(pathArray);
    setIsAnimating(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-4xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Path Finding Visualization</h2>
          <div className="flex justify-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Start Node (A-F)"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value.toUpperCase())}
              className="w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              placeholder="End Node (A-F)"
              value={endNode}
              onChange={(e) => setEndNode(e.target.value.toUpperCase())}
              className="w-36 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              onClick={findShortestPath}
              disabled={isAnimating}
              className={`px-6 py-2 rounded-md text-white ${
                isAnimating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Find Path
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <svg 
            width={GRID_SIZE} 
            height={GRID_SIZE} 
            className="border border-gray-200 rounded-lg bg-white"
          >
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              const isInPath = path.length >= 2 && 
                path.some((id, i) => 
                  i < path.length - 1 && 
                  ((path[i] === edge.from && path[i + 1] === edge.to) ||
                   (path[i] === edge.to && path[i + 1] === edge.from))
                );

              return (
                <g key={`edge-${index}`}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isInPath ? '#4f46e5' : '#cbd5e1'}
                    strokeWidth={isInPath ? 3 : 2}
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2}
                    fill="#64748b"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {nodes.map((node) => {
              const isStart = node.id === startNode;
              const isEnd = node.id === endNode;
              const isVisited = visitedNodes.includes(node.id);
              const isInPath = path.includes(node.id);

              let fillColor = '#64748b';  // Default gray
              if (isStart) fillColor = '#4f46e5';  // Indigo
              if (isEnd) fillColor = '#059669';    // Emerald
              if (isVisited) fillColor = '#ea580c'; // Orange
              if (isInPath) fillColor = '#059669';  // Emerald

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={VERTEX_RADIUS}
                    fill={fillColor}
                    stroke="#1e293b"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dy=".3em"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {node.id}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + VERTEX_RADIUS + 15}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-center mt-6">
          <div className="space-y-3">
            <div className="flex gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                <span className="text-gray-700">Start Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                <span className="text-gray-700">End Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span className="text-gray-700">Visited Node</span>
              </div>
            </div>
            {path.length > 0 && (
              <div className="text-gray-900 text-center">
                <span className="font-medium">Shortest Path: </span>
                {path.join(' → ')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}