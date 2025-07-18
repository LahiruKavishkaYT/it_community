import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  X,
  Move,
  Navigation,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointer2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from './Card';
import Button from './Button';

// Import SVG files
import frontendSvg from '../../assets/frontend.svg';
import backendSvg from '../../assets/Backend.svg';
import devopsSvg from '../../assets/Devops.svg';
import fullstackSvg from '../../assets/fullstack.svg';

interface SimpleSVGViewerProps {
  pathId: string;
  pathTitle: string;
}

const SimpleSVGViewer: React.FC<SimpleSVGViewerProps> = ({ pathId, pathTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLImageElement>(null);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [svgSize, setSvgSize] = useState({ width: 800, height: 600 });

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Zoom controls with smooth animation
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev * 1.2, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev / 1.2, 0.2));
  }, []);

  const handleResetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Enhanced keyboard navigation
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (isFullscreen && e.key === 'Escape') {
      setIsFullscreen(false);
      return;
    }

    const moveSpeed = 50;
    const zoomSpeed = 0.1;

    switch (e.key) {
      case 'r':
      case 'R':
        handleResetView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        setPosition(prev => ({ ...prev, y: prev.y + moveSpeed }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setPosition(prev => ({ ...prev, y: prev.y - moveSpeed }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setPosition(prev => ({ ...prev, x: prev.x + moveSpeed }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setPosition(prev => ({ ...prev, x: prev.x - moveSpeed }));
        break;
      case '+':
      case '=':
        e.preventDefault();
        setScale(prev => Math.min(prev + zoomSpeed, 5));
        break;
      case '-':
        e.preventDefault();
        setScale(prev => Math.max(prev - zoomSpeed, 0.2));
        break;
      case 'm':
      case 'M':
        setShowMinimap(prev => !prev);
        break;
    }
  }, [isFullscreen, handleResetView]);

  // Smooth scrolling function
  const smoothScrollTo = useCallback((targetX: number, targetY: number, duration = 500) => {
    const startX = position.x;
    const startY = position.y;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      setPosition({
        x: startX + (targetX - startX) * easedProgress,
        y: startY + (targetY - startY) * easedProgress,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [position]);

  // Center view function
  const centerView = useCallback(() => {
    const centerX = (containerSize.width - svgSize.width * scale) / 2;
    const centerY = (containerSize.height - svgSize.height * scale) / 2;
    smoothScrollTo(centerX, centerY);
  }, [containerSize, svgSize, scale, smoothScrollTo]);

  // Fit to screen function
  const fitToScreen = useCallback(() => {
    if (containerSize.width && containerSize.height) {
      const scaleX = containerSize.width / svgSize.width;
      const scaleY = containerSize.height / svgSize.height;
      const newScale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding
      
      setScale(newScale);
      setTimeout(() => centerView(), 100); // Center after scale change
    }
  }, [containerSize, svgSize, centerView]);

  // Enhanced mouse controls for panning with momentum
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Enhanced wheel zoom with center point zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * delta, 0.2), 5);
      
      // Calculate zoom center point
      const scaleChange = newScale / scale;
      const newX = mouseX - (mouseX - position.x) * scaleChange;
      const newY = mouseY - (mouseY - position.y) * scaleChange;
      
      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
  };

  // Touch support for mobile devices
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList) => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      setLastTouchDistance(getTouchDistance(e.touches));
    }
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      
      if (lastTouchDistance && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.min(Math.max(scale * scaleChange, 0.2), 5);
        
        const center = getTouchCenter(e.touches);
        const mouseX = center.x - rect.left;
        const mouseY = center.y - rect.top;
        
        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);
        
        setScale(newScale);
        setPosition({ x: newX, y: newY });
        setLastTouchDistance(distance);
      }
    }
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  // Keyboard shortcuts and events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Minimap component
  const renderMinimap = () => {
    if (!showMinimap || !containerSize.width) return null;
    
    const minimapScale = 0.15;
    const minimapWidth = svgSize.width * minimapScale;
    const minimapHeight = svgSize.height * minimapScale;
    
    // Calculate viewport position on minimap
    const viewportX = (-position.x / scale) * minimapScale;
    const viewportY = (-position.y / scale) * minimapScale;
    const viewportWidth = (containerSize.width / scale) * minimapScale;
    const viewportHeight = (containerSize.height / scale) * minimapScale;
    
    return (
      <div className="absolute top-4 right-4 bg-black/80 border border-gray-600 rounded-lg p-2 backdrop-blur-sm">
        <div 
          className="relative cursor-pointer"
          style={{ width: minimapWidth, height: minimapHeight }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Convert minimap click to main view position
            const targetX = -(clickX / minimapScale) * scale + containerSize.width / 2;
            const targetY = -(clickY / minimapScale) * scale + containerSize.height / 2;
            
            smoothScrollTo(targetX, targetY);
          }}
        >
          <div 
            className="absolute bg-gray-600 opacity-50 rounded"
            style={{ 
              width: minimapWidth, 
              height: minimapHeight,
              background: 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)',
              backgroundSize: '4px 4px',
              backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
            }}
          />
          <div 
            className="absolute border-2 border-blue-400 bg-blue-400/20"
            style={{
              left: Math.max(0, Math.min(viewportX, minimapWidth - viewportWidth)),
              top: Math.max(0, Math.min(viewportY, minimapHeight - viewportHeight)),
              width: Math.min(viewportWidth, minimapWidth),
              height: Math.min(viewportHeight, minimapHeight),
            }}
          />
        </div>
        <div className="text-xs text-gray-300 mt-1 text-center">Navigation</div>
      </div>
    );
  };

  // Get the appropriate SVG based on pathId
  const getSVGPath = (pathId: string) => {
    const svgMap: Record<string, string> = {
      'frontend': frontendSvg,
      'backend': backendSvg,
      'devops': devopsSvg,
      'fullstack': fullstackSvg
    };
    return svgMap[pathId];
  };

  const svgPath = getSVGPath(pathId);

  const renderViewer = (isFullscreenMode = false) => (
    <div 
      ref={containerRef}
      className={`relative bg-gray-950 overflow-hidden ${
        isFullscreenMode ? 'h-full' : 'h-[600px]'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* SVG Container */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Dynamic SVG based on pathId */}
        <img 
          ref={svgRef}
          src={svgPath} 
          alt={`${pathTitle} Developer Roadmap`}
          className="max-w-none h-auto select-none"
          style={{ 
            filter: 'brightness(1.1) contrast(1.2)',
            minWidth: `${svgSize.width}px`,
            minHeight: `${svgSize.height}px`
          }}
          draggable={false}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            setSvgSize({ width: img.naturalWidth, height: img.naturalHeight });
          }}
        />
      </div>

      {/* Enhanced Navigation Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Quick Navigation Buttons */}
        <div className="flex items-center gap-1 bg-black/80 rounded-lg p-1 backdrop-blur-sm">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPosition(prev => ({ ...prev, y: prev.y + 100 }))}
            className="text-gray-300 hover:text-white p-2"
            title="Pan Up (Arrow Up)"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPosition(prev => ({ ...prev, y: prev.y - 100 }))}
            className="text-gray-300 hover:text-white p-2"
            title="Pan Down (Arrow Down)"
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPosition(prev => ({ ...prev, x: prev.x + 100 }))}
            className="text-gray-300 hover:text-white p-2"
            title="Pan Left (Arrow Left)"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPosition(prev => ({ ...prev, x: prev.x - 100 }))}
            className="text-gray-300 hover:text-white p-2"
            title="Pan Right (Arrow Right)"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Additional Controls */}
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={centerView}
            className="bg-black/80 text-gray-300 hover:text-white backdrop-blur-sm px-3 py-2 text-xs"
            title="Center View"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Center
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={fitToScreen}
            className="bg-black/80 text-gray-300 hover:text-white backdrop-blur-sm px-3 py-2 text-xs"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Fit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowMinimap(prev => !prev)}
            className="bg-black/80 text-gray-300 hover:text-white backdrop-blur-sm px-3 py-2 text-xs"
            title="Toggle Minimap (M)"
          >
            <MousePointer2 className="w-4 h-4 mr-1" />
            Map
          </Button>
        </div>
      </div>
      
      {/* Enhanced Navigation Hint */}
      <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg px-4 py-3 backdrop-blur-sm max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <Move className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Navigation Guide</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• <strong>Mouse:</strong> Drag to pan, scroll to zoom</div>
          <div>• <strong>Touch:</strong> Single finger to pan, pinch to zoom</div>
          <div>• <strong>Keyboard:</strong> Arrow keys to pan, +/- to zoom, R to reset, M for minimap</div>
        </div>
      </div>
      
      {/* Zoom Level and Position Indicator */}
      <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg px-3 py-2 backdrop-blur-sm">
        <div className="text-sm text-gray-300 text-center">
          <div className="font-medium">{Math.round(scale * 100)}%</div>
          <div className="text-xs text-gray-400">
            ({Math.round(position.x)}, {Math.round(position.y)})
          </div>
        </div>
      </div>

      {/* Minimap */}
      {renderMinimap()}
    </div>
  );

  // If no SVG is available for this path, show coming soon message
  if (!svgPath) {
    return (
      <Card className="w-full bg-gray-900/95 border-gray-800">
        <CardContent className="p-8 text-center">
          <div className="text-gray-400">
            <h3 className="text-xl font-semibold text-white mb-2">Interactive Roadmap Coming Soon</h3>
            <p>The interactive roadmap for {pathTitle} is currently being developed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full bg-gray-900/95 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div>
            <h3 className="text-xl font-bold text-white">Interactive Learning Roadmap</h3>
            <p className="text-gray-300">Visual guide to mastering {pathTitle} • Enhanced scrolling enabled</p>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-gray-300 hover:text-white p-2"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-300 px-2 min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="text-gray-300 hover:text-white p-2"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={centerView}
              className="text-gray-300 hover:text-white p-2"
              title="Center View"
            >
              <Navigation className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={fitToScreen}
              className="text-gray-300 hover:text-white p-2"
              title="Fit to Screen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetView}
              className="text-gray-300 hover:text-white p-2"
              title="Reset View (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="text-gray-300 hover:text-white p-2"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {renderViewer()}
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="flex items-center justify-between p-4 bg-gray-900/95 border-b border-gray-700">
            <div>
              <h3 className="text-xl font-bold text-white">{pathTitle} Interactive Roadmap</h3>
              <p className="text-gray-300">Press ESC to exit fullscreen</p>
            </div>
            
            {/* Fullscreen Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-gray-300 hover:text-white p-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-300 px-2 min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-gray-300 hover:text-white p-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetView}
                className="text-gray-300 hover:text-white p-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setIsFullscreen(false)}
                className="text-gray-300 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="h-[calc(100vh-4rem)]">
            {renderViewer(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleSVGViewer; 