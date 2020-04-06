import { LatLng } from './latlng';

export enum Color {
    RED,
    GREEN,
    YEllOW,
    BLUE
}

export enum Spots {
    none,
    hidden,
    dotted,
    dashed,
    solid,
    double,
    groove,
    ridge,
    inset,
    outset,
}

interface IFungus {
    name: string;
    spots: Spots;
    color: Color;
    latlng: LatLng;
}

// TODO: stricter interfaces implementation

export class Fungus implements IFungus {
    id: string;
    name: string;
    spots: Spots;
    color: Color;
    latlng: LatLng;
    isCustom: boolean;
    isHidden: boolean;

    constructor(id, name, spots, color, latlng, isCustom = false) {
        this.id = id;
        this.name = name;
        this.spots = spots;
        this.color = color;
        this.latlng = new LatLng(latlng['_latitude'], latlng['_longitude']);
        this.isCustom = isCustom;
        this.isHidden = false;
    }

}