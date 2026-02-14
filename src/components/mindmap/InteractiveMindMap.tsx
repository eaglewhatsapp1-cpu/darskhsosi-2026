import React, { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';
import { Home, BookOpen, Briefcase, Heart, Lightbulb, Target, Users, Settings, Star } from 'lucide-react';

interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  level?: number;
}

interface InteractiveMindMapProps {
  data: MindMapNode;
  language: 'ar' | 'en';
  className?: string;
}

const nodeColors = [
  'linear-gradient(135deg, #06b6d4, #0891b2)', // Cyan
  'linear-gradient(135deg, #10b981, #059669)', // Emerald
  'linear-gradient(135deg, #f59e0b, #d97706)', // Amber
  'linear-gradient(135deg, #8b5cf6, #7c3aed)', // Violet
  'linear-gradient(135deg, #ec4899, #db2777)', // Pink
  'linear-gradient(135deg, #3b82f6, #2563eb)', // Blue
];

const getIconForLabel = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('home') || l.includes('بيت') || l.includes('منزل')) return <Home className="w-5 h-5" />;
  if (l.includes('study') || l.includes('دراس') || l.includes('تعلم')) return <BookOpen className="w-5 h-5" />;
  if (l.includes('work') || l.includes('عمل') || l.includes('وظيفة')) return <Briefcase className="w-5 h-5" />;
  if (l.includes('health') || l.includes('صحة') || l.includes('غذاء')) return <Heart className="w-5 h-5" />;
  if (l.includes('idea') || l.includes('فكر')) return <Lightbulb className="w-5 h-5" />;
  if (l.includes('target') || l.includes('هدف')) return <Target className="w-5 h-5" />;
  if (l.includes('people') || l.includes('ناس') || l.includes('فريق')) return <Users className="w-5 h-5" />;
  if (l.includes('setting') || l.includes('إعداد')) return <Settings className="w-5 h-5" />;
  return <Star className="w-5 h-5" />;
};

const convertToFlowNodes = (
  node: MindMapNode,
  level: number = 0,
  parentId: string | null = null,
  direction: 'left' | 'right' | 'center' = 'center',
  siblingIndex: number = 0,
  totalSiblingsAtLevel: number = 1
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const horizontalSpacing = 320;
  const verticalSpacing = 120;

  let nodeX = 0;
  let nodeY = 0;

  if (level === 0) {
    nodeX = 0;
    nodeY = 0;
  } else {
    const dirFactor = direction === 'left' ? -1 : 1;
    nodeX = dirFactor * level * horizontalSpacing;

    // Vertical distribution
    const levelHeight = (totalSiblingsAtLevel - 1) * verticalSpacing;
    nodeY = (siblingIndex * verticalSpacing) - (levelHeight / 2);

    // Add some organic jitter for level 1
    if (level === 1) {
      nodeY += (siblingIndex % 2 === 0 ? 30 : -30);
    }
  }

  const flowNode: Node = {
    id: node.id,
    position: { x: nodeX, y: nodeY },
    data: {
      label: node.label,
      level,
      direction,
    },
    type: 'mindMapNode',
    // Position handles depending on direction
    sourcePosition: direction === 'left' ? Position.Left : Position.Right,
    targetPosition: direction === 'left' ? Position.Right : Position.Left,
  };

  if (level === 0) {
    flowNode.sourcePosition = undefined; // Center handles both
    flowNode.targetPosition = undefined;
  }

  nodes.push(flowNode);

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'bezier',
      animated: level === 1,
      style: {
        stroke: nodeColors[siblingIndex % nodeColors.length].match(/#\w+/)?.[0] || '#cbd5e1',
        strokeWidth: level === 1 ? 4 : 2,
        opacity: 0.6,
      },
    });
  }

  if (node.children && node.children.length > 0) {
    const half = Math.ceil(node.children.length / 2);

    node.children.forEach((child, index) => {
      let childDirection = direction;

      if (level === 0) {
        // Root children are split between left and right
        childDirection = index < half ? 'right' : 'left';
      }

      const result = convertToFlowNodes(
        child,
        level + 1,
        node.id,
        childDirection,
        index,
        level === 0 ? (index < half ? half : node.children!.length - half) : node.children!.length
      );
      nodes.push(...result.nodes);
      edges.push(...result.edges);
    });
  }

  return { nodes, edges };
};

const MindMapNodeComponent: React.FC<{ data: { label: string; level: number; direction: string } }> = ({ data }) => {
  const isRoot = data.level === 0;
  const isBranch = data.level === 1;
  const colorIndex = data.level; // Use level or some other logic

  return (
    <div className={cn(
      "relative group transition-all duration-300",
      isRoot ? "scale-110" : "scale-100"
    )}>
      {/* Handles */}
      {data.level > 0 && (
        <Handle
          type="target"
          position={data.direction === 'left' ? Position.Right : Position.Left}
          className="w-2 h-2 !bg-slate-400 border-none opacity-0 group-hover:opacity-100"
        />
      )}

      <div
        className={cn(
          "px-4 py-3 rounded-2xl shadow-lg border-2 border-white/20 backdrop-blur-sm flex items-center gap-3 min-w-[140px] max-w-[220px]",
          isRoot ? "bg-gradient-to-br from-cyan-400 to-cyan-600 ring-4 ring-cyan-100 dark:ring-cyan-900/30" :
            isBranch ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" :
              "bg-slate-50 dark:bg-slate-900 border-transparent py-2 px-3 min-w-[120px]"
        )}
      >
        {isBranch && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-primary shrink-0">
            {getIconForLabel(data.label)}
          </div>
        )}

        <span className={cn(
          "text-sm font-semibold tracking-tight",
          isRoot ? "text-white text-base" :
            isBranch ? "text-slate-800 dark:text-slate-100" :
              "text-slate-600 dark:text-slate-400 font-medium"
        )}>
          {data.label}
        </span>
      </div>

      {data.level < 2 && (
        <Handle
          type="source"
          position={data.level === 0 ? Position.Right : (data.direction === 'left' ? Position.Left : Position.Right)}
          className="w-2 h-2 !bg-slate-400 border-none opacity-0 group-hover:opacity-100"
          id="right"
        />
      )}

      {data.level === 0 && (
        <Handle
          type="source"
          position={Position.Left}
          className="w-2 h-2 !bg-slate-400 border-none opacity-0 group-hover:opacity-100"
          id="left"
        />
      )}
    </div>
  );
};

const nodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

const InteractiveMindMap: React.FC<InteractiveMindMapProps> = ({ data, language, className }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return convertToFlowNodes(data);
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className={cn('w-full h-[600px] bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative', className)} dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        minZoom={0.2}
        maxZoom={1.5}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1"
          showInteractive={false}
        />
        <Background
          variant={BackgroundVariant.Lines}
          gap={40}
          size={1}
          color="rgba(0,0,0,0.03)"
          className="dark:opacity-[0.03]"
        />
      </ReactFlow>

      {/* Legend or Title overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {language === 'ar' ? 'نمط الخريطة الذهنية المركزية' : 'Central Mind Map View'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMindMap;
