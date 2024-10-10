"use strict";
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
    public settings: any = {
        smallSize: 10,
        mediumSize: 20,
        largeSize: 30,
        extraLargeSize: 40
    };
}