import { searchProperties } from "@/lib/reellyApi";

export default async function TestPage() {
    const data = await searchProperties();

    return (
        <div>
            <h1>Test API</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}