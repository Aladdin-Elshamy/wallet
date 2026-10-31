
let counter = 1;

function generateRandomTransaction(): Omit<Transcation,"note"> {
    const pastDays = Math.floor(Math.random() * 30);
    const dateObj = new Date(Date.now() - pastDays * 24 * 60 * 60 * 1000);
    const date = dateObj.toISOString().slice(0, 10);
    const cleanDate = date.replace(/-/g, "");

    const amount = (Math.random() * 500 + 5).toFixed(2);
    const refSuffix = Math.floor(1000 + Math.random() * 9000);
    const seq = String(counter++).padStart(4, "0");
    const reference = `${cleanDate}${refSuffix}${seq}`;

 

    return {
        date,
        amount,
        reference,

    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const countParam = searchParams.get("count");
    const count = countParam
        ? Math.max(1, parseInt(countParam, 10) || 1)
        : Math.floor(Math.random() * 8) + 1;

    const randomData: Omit<Transcation,"note">[] = Array.from({ length: count }, () =>
        generateRandomTransaction()
    );

    return Response.json({ data: randomData });
}