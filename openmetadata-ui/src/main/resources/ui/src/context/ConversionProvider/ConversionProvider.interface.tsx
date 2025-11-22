/*
 *  Copyright 2023 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import { LoadingState } from 'Models';
import { Dispatch, DragEvent, ReactNode, SetStateAction } from 'react';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodeProps,
  ReactFlowInstance,
} from 'reactflow';
import { LineageConfig } from '../../components/Entity/EntityLineage/EntityLineage.interface';
import { ExploreQuickFilterField } from '../../components/Explore/ExplorePage.interface';
import { EntityLineageResponse } from '../../components/Lineage/Lineage.interface';
import { SourceType } from '../../components/SearchedData/SearchedData.interface';
import { EntityType } from '../../enums/entity.enum';
import { LineageDirection } from '../../generated/api/lineage/lineageDirection';

export interface ConversionProviderProps {
  children: ReactNode;
}

export interface ConversionContextType {
  reactFlowInstance?: ReactFlowInstance;
  nodes: Node[];
  edges: Edge[];
  tracedNodes: string[];
  columnsHavingLineage: string[];
  tracedColumns: string[];
  lineageConfig: LineageConfig;
  zoomValue: number;
  isDrawerOpen: boolean;
  loading: boolean;
  init: boolean;
  status: LoadingState;
  isEditMode: boolean;
  entityLineage: EntityLineageResponse;
  selectedNode: SourceType;
  selectedColumn: string;
  expandAllColumns: boolean;
  entityFqn: string;
  onCloseDrawer: () => void;
  toggleColumnView: () => void;
  onInitReactFlow: (reactFlowInstance: ReactFlowInstance) => void;
  onPaneClick: () => void;
  onNodeClick: (node: Node) => void;
  onEdgeClick: (edge: Edge) => void;
  onColumnClick: (node: string) => void;
  onLineageEditClick: () => void;
  onZoomUpdate: (value: number) => void;
  onLineageConfigUpdate: (config: LineageConfig) => void;
  selectedQuickFilters: ExploreQuickFilterField[];
  setSelectedQuickFilters: Dispatch<SetStateAction<ExploreQuickFilterField[]>>;
  onDrawerClose: () => void;
  onNodeDrop: (event: DragEvent, reactFlowBounds: DOMRect) => void;
  onNodeCollapse: (node: Node | NodeProps, direction: LineageDirection) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  loadChildNodesHandler: (
    node: SourceType,
    direction: LineageDirection,
    depth: number
  ) => Promise<void>;
  removeNodeHandler: (node: Node | NodeProps) => void;
  onColumnEdgeRemove: () => void;
  onAddPipelineClick: () => void;
  onConnect: (connection: Edge | Connection) => void;
  updateEntityData: (entityType: EntityType, entity?: SourceType) => void;
  redraw: () => Promise<void>;
  updateEntityFqn: (entityFqn: string) => void;
}
