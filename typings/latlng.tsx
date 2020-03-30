interface ILatLng {
    lat: number;
    lng: number;

}

export class LatLng implements ILatLng {
    lat: number;
    lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    };

}