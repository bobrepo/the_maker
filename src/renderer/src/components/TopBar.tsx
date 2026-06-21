import React from 'react';
import { useGraphStore } from '../store/useGraphStore';
import { GraphEngine } from '../engine/GraphEngine';

const TopBar = ({ setLogs }: { setLogs: (logs: string) => void }) => {
  const nodes = useGraphStore((state) => state.nodes);
  const edges = useGraphStore((state) => state.edges);
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);

  const handleRun = async () => {
    const { code, errors } = await GraphEngine.generateCode(nodes, edges);
    if (errors.length > 0) {
      setLogs(`Validation Errors:\n${errors.join('\n')}`);
      return;
    }

    setLogs(`Generated Code:\n${code}\n\nRunning...`);
    
    try {
      // @ts-ignore
      await window.electron.ipcRenderer.invoke('run-python', code);
    } catch (err: any) {
      setLogs(`Error running python: ${err.message}`);
    }
  };

  const handleBuild = async () => {
    const { code, errors } = await GraphEngine.generateCode(nodes, edges);
    if (errors.length > 0) {
      setLogs(`Validation Errors:\n${errors.join('\n')}`);
      return;
    }

    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('build-python', code);
      if (result.success) {
        setLogs(`Successfully exported to Desktop: ${result.filePath}`);
      } else {
        setLogs(`Export failed: ${result.error}`);
      }
    } catch (err: any) {
      setLogs(`Error exporting python: ${err.message}`);
    }
  };

  const handleSaveGraph = async () => {
    const graphData = {
      version: 1,
      nodes,
      edges
    };
    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('save-graph', graphData);
      if (result.success) {
        setLogs(`Graph saved to: ${result.filePath}`);
      }
    } catch (err: any) {
      setLogs(`Error saving graph: ${err.message}`);
    }
  };

  const handleLoadGraph = async () => {
    try {
      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('load-graph');
      if (result.success && result.graph) {
        if (result.graph.version === 1) {
          setNodes(result.graph.nodes);
          setEdges(result.graph.edges);
          setLogs('Graph loaded successfully.');
        } else {
          setLogs('Unsupported graph version.');
        }
      }
    } catch (err: any) {
      setLogs(`Error loading graph: ${err.message}`);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-6">
        <button
          onClick={handleRefresh}
          className="text-xs text-blue-400 hover:text-white transition-colors font-bold"
        >
          Refresh
        </button>
        <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          MSTT
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveGraph}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Save Graph
          </button>
          <button
            onClick={handleLoadGraph}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Load Graph
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleRun}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-1.5 rounded-full font-bold transition-colors flex items-center gap-2 text-sm"
        >
          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-1" />
          Run
        </button>
        <button
          onClick={handleBuild}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-1.5 rounded-full font-bold transition-colors text-sm"
        >
          Build
        </button>
      </div>

      <div className="w-32" /> {/* Spacer */}
    </div>
  );
};

export default TopBar;
