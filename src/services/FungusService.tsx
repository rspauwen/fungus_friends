import { Fungus } from "../model/fungus";
import { toast } from "react-toastify";


const FUNGI_ENDPOINT = 'https://fungus-friends.firebaseapp.com/api/v1/fungi';


const FungusService = {
    async fetchFungi(): Promise<Array<Fungus>> {
        try {
            const response = await fetch(FUNGI_ENDPOINT);
            const jsonResponse = await response.json();

            if (Object.keys(jsonResponse.fungi).length == 0) {
                return null;
            }

            return Object.keys(jsonResponse.fungi).map((f) => {
                return new Fungus(f,
                    jsonResponse.fungi[f].name,
                    jsonResponse.fungi[f].spots,
                    jsonResponse.fungi[f].color,
                    jsonResponse.fungi[f].latlng,
                    jsonResponse.fungi[f].custom
                );
            }).sort((a, b) => a.name.localeCompare(b.name));
        } catch (e) {
            console.log(e);
            return null;
        };
    },

    async addFungus(fungus: Fungus): Promise<boolean> {
        try {
            const fungusBody = {
                color: fungus.color,
                lat: fungus.latlng.lat,
                lng: fungus.latlng.lng,
                name: fungus.name,
                spots: fungus.spots,
                custom: true
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fungusBody })
            };

            const response = await fetch(FUNGI_ENDPOINT, requestOptions);

            if (response.status == 201) {
                toast.success(`Fungus "${fungus.name}" has been added!`);
                return true;
            }
        } catch (e) {
            console.log(e);
        };

        toast.error("Oops, failed to add fungus!");
        return false;
    },

    async deleteFungus(fungus: Fungus): Promise<boolean> {
        try {
            const response = await fetch(`${FUNGI_ENDPOINT}/${fungus.id}`, { method: 'delete' });

            if (response.status == 204) {
                toast.success(`Fungus "${fungus.name}" has been deleted!`);
                return true;
            }
        } catch (e) {
            console.log(e);
        };

        toast.error("Oops, failed to delete fungus!");
        return false;
    }
};

export default FungusService;
