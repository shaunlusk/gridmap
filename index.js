import AStarNode from './src/AStarNode';
import AStarPathFinder from './src/AStarPathFinder';
import Coordinates from './src/Coordinates';
import DefaultGridCellFactory from './src/DefaultGridCellFactory';
import Direction from './src/Direction';
import GridCell from './src/GridCell';
import GridMap from './src/GridMap';
import GridMapNeighborProvider from './src/GridMapNeighborProvider';
import GridMapNeighborProviderFactory from './src/GridMapNeighborProviderFactory';
import IGridCellFactory from './src/IGridCellFactory';
import IHeuristicProvider from './src/IHeuristicProvider';
import INeighborProvider from './src/INeighborProvider';
import INeighborProviderFactory from './src/INeighborProviderFactory';

if (typeof window !== 'undefined' && window) {
  window.SL = window.SL || {};
  window.SL.AStarNode = AStarNode;
  window.SL.AStarPathFinder = AStarPathFinder;
  window.SL.Coordinates = Coordinates;
  window.SL.DefaultGridCellFactory = DefaultGridCellFactory;
  window.SL.Direction = Direction;
  window.SL.GridCell = GridCell;
  window.SL.GridMap = GridMap;
  window.SL.GridMapNeighborProvider = GridMapNeighborProvider;
  window.SL.GridMapNeighborProviderFactory =  GridMapNeighborProviderFactory;
  window.SL.IGridCellFactory =  IGridCellFactory;
  window.SL.IHeuristicProvider = IHeuristicProvider;
  window.SL.INeighborProvider = INeighborProvider;
  window.SL.INeighborProviderFactory = INeighborProviderFactory;
}