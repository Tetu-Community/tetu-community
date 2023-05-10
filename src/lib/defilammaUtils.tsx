import { equals } from "./stringUtils";
import axios from 'axios'

const CHUNCK_SIZE = 20;

export const getPrice = (LPPrices: any, address: string): number => {
    let prices = LPPrices;
    if (LPPrices?.data) {
        prices = LPPrices?.data;
    }

    for (const adr of Object.keys(prices)) {
        if (equals(adr, address)) {
            let price = prices[adr].usd;
            if (!price) {
                price = prices[adr].priceUSD;
            }

            return price;
        }
    }

    return 0;
};

export const getPricesFromContracts = async (addresses: string[]): Promise<any> => {

    // Remove duplicates
    let uniqueAddresses: any = {};
    for (const addr of addresses) {
        if (!uniqueAddresses[addr]) {
            uniqueAddresses[addr] = true;
        }
    }

    addresses = Object.keys(uniqueAddresses);

    let chunks = [addresses];
    if (addresses.length > CHUNCK_SIZE) {
        chunks = spliceIntoChunks(addresses, CHUNCK_SIZE);
    }

    const resp = {
        data: {}
    };

    for (const arr of chunks) {

        const str = arr.map((addr: string) => {
            if (addr.indexOf(":") === -1) {
                return "ethereum:" + addr;
            }

            return addr;
        }).join(",");

        const r = await axios.get(`https://coins.llama.fi/prices/current/${str}`);

        const res = removeKey(r.data.coins);

        resp.data = {
            ...resp.data,
            ...res
        };
    }

    return resp;
}

const removeKey = (data: any): any => {
    const response: any = {};
    for (const key of Object.keys(data)) {
        const d = data[key];
        d.priceUSD = d.price;
        d.usd = d.priceUSD;
        response[key.split(":")[1]] = d;
    }

    return response;
}

export const spliceIntoChunks = (arr: any[], chunkSize: number): any[] => {
    const res = [];
    while (arr.length > 0) {
        const chunk = arr.splice(0, chunkSize);
        res.push(chunk);
    }
    return res;
}