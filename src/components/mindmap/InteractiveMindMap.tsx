import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';

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
  'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))',
  'linear-gradient(135deg, #22c55e, #16a34a)',
  'linear-gradient(135deg, #3b82f6, #2563eb)',
  'linear-gradient(135deg, #f59e0b, #d97706)',
  'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  'linear-gradient(135deg, #ec4899, #db2777)',
];

const convertToFlowNodes = (
  node: MindMapNode,
  level: number = 0,
  parentId: string | null = null,
  position: { x: number; y: number } = { x: 0, y: 0 },
  siblingIndex: number = 0,
  totalSiblings: number = 1
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const horizontalSpacing = 280;
  const verticalSpacing = 100;

  // Calculate node position
  const nodeX = level * horizontalSpacing;
  const totalHeight = totalSiblings * verticalSpacing;
  const startY = -totalHeight / 2 + verticalSpacing / 2;
  const nodeY = startY + siblingIndex * verticalSpacing;

  const flowNode: Node = {
    id: node.id,
    position: { x: nodeX, y: nodeY },
    data: { 
      label: node.label,
      level,
    },
    type: 'mindMapNode',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: nodeColors[level % nodeColors.length],
      color: 'white',
      border: 'none',
      borderRadius: level === 0 ? '50%' : '12px',
      padding: level === 0 ? '24px' : '12px 20px',
      fontSize: level === 0 ? '16px' : '13px',
      fontWeight: level === 0 ? '700' : '500',
      minWidth: level === 0 ? '120px' : '80px',
      maxWidth: '200px',
      textAlign: 'center' as const,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
  };

  nodes.push(flowNode);

  if (parentId) {
    edges.push({
      id: `${parentId}-${node.id}`,
      source: parentId,
      target: node.id,
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: 'hsl(var(--primary)/0.5)', 
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--primary)/0.5)',
      },
    });
  }

  if (node.children && node.children.length > 0) {
    node.children.forEach((child, index) => {
      const result = convertToFlowNodes(
        child,
        level + 1,
        node.id,
        { x: nodeX + horizontalSpacing, y: 0 },
        index,
        node.children!.length
      );
      nodes.push(...result.nodes);
      edges.push(...result.edges);
    });
  }

  return { nodes, edges };
};

const MindMapNodeComponent: React.FC<{ data: { label: string; level: number } }> = ({ data }) => {
  return (
    <div className="flex items-center justify-center text-center">
      <span className="line-clamp-3">{data.label}</span>
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

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className={cn('w-full h-[500px] bg-background rounded-xl border border-border overflow-hidden', className)} dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls 
          className="bg-card border border-border rounded-lg shadow-lg"
          showInteractive={false}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--muted-foreground)/0.2)"
        />
      </ReactFlow>
    </div>
  );
};

export default InteractiveMindMap;
