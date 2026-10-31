//source
export class HttpService {
    async getFeed() {
        try {
            const res = await fetch("/api/feed");
            if (!res.ok) {
                throw new Error("Failed to fetch data");
            }
            return res.json();
        } catch (error) {
            console.error("Error fetching feed:", error);
            return null;
        }
    }   
}   

export const httpService = new HttpService();