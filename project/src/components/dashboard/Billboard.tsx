import React, { useState } from 'react';
import { MapPin, CheckCircle, XCircle, Info } from 'lucide-react';

interface Billboard {
  id: string;
  name: string;
  x: number;
  y: number;
  authorized: boolean;
  address: string;
  brand: string;
  size: string;
  lastInspected: string;
}

const mockBillboards: Billboard[] = [
  { id: '1', name: 'Downtown Plaza', x: 15, y: 20, authorized: true, address: '123 Main St', brand: 'Nike', size: '14x48', lastInspected: '2024-01-15' },
  { id: '2', name: 'Central Park', x: 45, y: 30, authorized: false, address: '456 Oak Ave', brand: 'Unknown', size: '12x24', lastInspected: '2024-01-10' },
  { id: '3', name: 'Shopping District', x: 70, y: 25, authorized: true, address: '789 Pine Rd', brand: 'McDonald\'s', size: '10x20', lastInspected: '2024-01-18' },
  { id: '4', name: 'Highway Junction', x: 25, y: 60, authorized: true, address: '321 Highway 1', brand: 'Coca-Cola', size: '14x48', lastInspected: '2024-01-12' },
  { id: '5', name: 'Industrial Area', x: 80, y: 70, authorized: false, address: '654 Factory St', brand: 'Unknown', size: '8x16', lastInspected: '2024-01-08' },
  { id: '6', name: 'University Campus', x: 60, y: 15, authorized: true, address: '987 College Blvd', brand: 'Apple', size: '12x36', lastInspected: '2024-01-20' },
  { id: '7', name: 'Airport Terminal', x: 85, y: 40, authorized: true, address: '147 Airport Dr', brand: 'Samsung', size: '16x64', lastInspected: '2024-01-16' },
  { id: '8', name: 'Riverside District', x: 35, y: 80, authorized: false, address: '258 River Rd', brand: 'Unknown', size: '10x30', lastInspected: '2024-01-05' },
  { id: '9', name: 'Tech Hub', x: 50, y: 50, authorized: true, address: '369 Innovation Way', brand: 'Google', size: '20x60', lastInspected: '2024-01-19' },
  { id: '10', name: 'Sports Complex', x: 20, y: 40, authorized: false, address: '741 Sports Ave', brand: 'Unknown', size: '14x42', lastInspected: '2024-01-07' },
];

const Billboard: React.FC = () => {
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [hoveredBillboard, setHoveredBillboard] = useState<string | null>(null);

  const authorizedCount = mockBillboards.filter(b => b.authorized).length;
  const unauthorizedCount = mockBillboards.filter(b => !b.authorized).length;

  return (
    <div className="space-y-6">
      {/* Map Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-2xl font-bold text-green-600">{authorizedCount}</div>
              <div className="text-sm text-gray-600">Authorized Billboards</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <div className="text-2xl font-bold text-red-600">{unauthorizedCount}</div>
              <div className="text-sm text-gray-600">Unauthorized Billboards</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-3">
            <MapPin className="w-6 h-6 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{mockBillboards.length}</div>
              <div className="text-sm text-gray-600">Total Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">City Billboard Locations</h3>
          <p className="text-sm text-gray-600">Click on markers to view billboard details</p>
        </div>
        
        <div className="flex">
          {/* Map Area */}
          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-green-50 min-h-[500px]">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ minHeight: '500px' }}
            >
              {/* City Background Elements */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Roads */}
              <rect x="0" y="48" width="100" height="4" fill="#d1d5db" opacity="0.7" />
              <rect x="48" y="0" width="4" height="100" fill="#d1d5db" opacity="0.7" />
              <rect x="20" y="0" width="2" height="100" fill="#e5e7eb" opacity="0.5" />
              <rect x="75" y="0" width="2" height="100" fill="#e5e7eb" opacity="0.5" />
              <rect x="0" y="25" width="100" height="2" fill="#e5e7eb" opacity="0.5" />
              <rect x="0" y="75" width="100" height="2" fill="#e5e7eb" opacity="0.5" />
              
              {/* City Areas */}
              <rect x="5" y="5" width="15" height="15" fill="#f3f4f6" opacity="0.6" rx="2" />
              <rect x="60" y="10" width="20" height="10" fill="#f3f4f6" opacity="0.6" rx="2" />
              <rect x="70" y="60" width="25" height="15" fill="#f3f4f6" opacity="0.6" rx="2" />
              <rect x="10" y="80" width="30" height="15" fill="#f3f4f6" opacity="0.6" rx="2" />
              
              {/* Billboard Markers */}
              {mockBillboards.map((billboard) => (
                <g key={billboard.id}>
                  {/* Marker Shadow */}
                  <circle
                    cx={billboard.x + 0.5}
                    cy={billboard.y + 0.5}
                    r="2.5"
                    fill="rgba(0,0,0,0.2)"
                  />
                  {/* Marker */}
                  <circle
                    cx={billboard.x}
                    cy={billboard.y}
                    r={hoveredBillboard === billboard.id ? "3" : "2"}
                    fill={billboard.authorized ? "#10b981" : "#ef4444"}
                    stroke="white"
                    strokeWidth="1"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredBillboard(billboard.id)}
                    onMouseLeave={() => setHoveredBillboard(null)}
                    onClick={() => setSelectedBillboard(billboard)}
                  />
                  {/* Marker Icon */}
                  <text
                    x={billboard.x}
                    y={billboard.y + 0.5}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="white"
                    className="cursor-pointer pointer-events-none select-none"
                    fontFamily="Arial, sans-serif"
                  >
                    📍
                  </text>
                  
                  {/* Hover Tooltip */}
                  {hoveredBillboard === billboard.id && (
                    <g>
                      <rect
                        x={billboard.x - 8}
                        y={billboard.y - 10}
                        width="16"
                        height="6"
                        fill="rgba(0,0,0,0.8)"
                        rx="1"
                      />
                      <text
                        x={billboard.x}
                        y={billboard.y - 7.5}
                        textAnchor="middle"
                        fontSize="1.2"
                        fill="white"
                        className="pointer-events-none select-none"
                        fontFamily="Arial, sans-serif"
                      >
                        {billboard.name}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 border">
              <div className="text-sm font-semibold text-gray-800 mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Authorized</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Unauthorized</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Billboard Details Panel */}
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            {selectedBillboard ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">{selectedBillboard.name}</h4>
                  <button
                    onClick={() => setSelectedBillboard(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    {selectedBillboard.authorized ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      selectedBillboard.authorized ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedBillboard.authorized ? 'Authorized' : 'Unauthorized'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="text-gray-800">{selectedBillboard.address}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Brand</div>
                      <div className="text-gray-800">{selectedBillboard.brand}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Size</div>
                      <div className="text-gray-800">{selectedBillboard.size} ft</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Last Inspected</div>
                      <div className="text-gray-800">{selectedBillboard.lastInspected}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                      <Info className="w-4 h-4" />
                      <span>View Full Report</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>Click on a billboard marker to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Changed from named export to default export
export default Billboard;