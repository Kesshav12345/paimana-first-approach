import React from 'react';
import type { StateDistributionItem } from './IndiaMap';
import { IndiaMap } from './IndiaMap';

interface IndiaRiskMapProps {
  states: StateDistributionItem[];
  selectedState?: string;
  onSelectState?: (stateName: string) => void;
}

export const IndiaRiskMap: React.FC<IndiaRiskMapProps> = (props) => {
  return <IndiaMap {...props} />;
};
