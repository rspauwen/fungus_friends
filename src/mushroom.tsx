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

export interface Mushroom {
    name: string;
    spots: Spots;
    color: Color;
    latlng: [number, number];
}
