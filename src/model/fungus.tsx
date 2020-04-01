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


export class Fungus implements IFungus {
    name: string;
    spots: Spots;
    color: Color;
    latlng: LatLng;
    isHidden: boolean;
    isSelected: boolean;

    constructor(name: string, spots: Spots, color: Color, latlng: LatLng) {
        this.name = name;
        this.spots = spots;
        this.color = color;
        this.latlng = new LatLng(latlng['_latitude'], latlng['_longitude']);
        this.isHidden = false;
        this.isSelected = false;
    }

}