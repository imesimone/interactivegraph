"use strict";

import "core-js/stable";
import "./../style/visual.less";

import powerbi from "powerbi-visuals-api";
import VisualObjectInstance = powerbi.VisualObjectInstance;
import IVisual = powerbi.extensibility.IVisual;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import DataView = powerbi.DataView;
import IVisualHost = powerbi.extensibility.IVisualHost;

import { VisualSettings } from "./settings";

import * as vis from "vis-network";

export class Visual implements IVisual {
    private target: HTMLElement;
    private network: vis.Network;
    private updateCount: number;
    private settings: VisualSettings;
    private host: IVisualHost;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.updateCount = 0;
        this.host = options.host;
    }

    public static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse<VisualSettings>(dataView);
    }

    public update(options: powerbi.extensibility.visual.VisualUpdateOptions) {
        const dataView: DataView = options.dataViews[0];
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);

        // Estrai i dati
        const nodes = this.getNodes(dataView);
        const edges = this.getEdges(dataView);

        // Configura il grafo
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };

        const optionsVis = {
            nodes: {
                shape: "dot",
                scaling: {
                    min: 10,
                    max: 40
                },
                font: {
                    size: 12,
                    face: "Tahoma"
                }
            },
            edges: {
                arrows: {
                    to: { enabled: true }
                },
                font: {
                    align: "middle"
                }
            },
            interaction: {
                hover: true,
                navigationButtons: true,
                keyboard: true
            },
            physics: {
                stabilization: false
            }
        };

        // Crea o aggiorna il grafo
        if (this.network) {
            this.network.setData(data);
        } else {
            this.network = new vis.Network(this.target, data, optionsVis);
        }
    }

    private getNodes(dataView: DataView): any[] {
        let categorical = dataView.categorical;
        let categories = categorical.categories;
        let values = categorical.values;

        let nodes = [];

        // Supponendo che i nomi dei nodi siano nella prima categoria
        let nodeNames = categories[0].values;

        // Estrai colori e dimensioni dai valori
        let nodeColors = values[0].values;
        let nodeSizes = values[1].values;

        for (let i = 0; i < nodeNames.length; i++) {
            nodes.push({
                id: i,
                label: nodeNames[i] as string,
                color: nodeColors[i] as string,
                size: this.mapSize(nodeSizes[i] as number)
            });
        }

        return nodes;
    }

    private getEdges(dataView: DataView): any[] {
        let categorical = dataView.categorical;
        let values = categorical.values;

        let edges = [];

        // Supponendo che i collegamenti siano nei valori successivi
        let sourceNodes = values[2].values;
        let targetNodes = values[3].values;
        let edgeLabels = values[4].values;

        for (let i = 0; i < sourceNodes.length; i++) {
            edges.push({
                from: sourceNodes[i],
                to: targetNodes[i],
                label: edgeLabels[i] as string
            });
        }

        return edges;
    }

    private mapSize(sizeValue: number): number {
        switch (sizeValue) {
            case 1:
                return this.settings.settings.smallSize;
            case 2:
                return this.settings.settings.mediumSize;
            case 3:
                return this.settings.settings.largeSize;
            case 4:
                return this.settings.settings.extraLargeSize;
            default:
                return this.settings.settings.mediumSize;
        }
    }
}