export async function onRequestGet(): Promise<Response> {
  return Response.json(
    { count: 127, accepting: true },
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
    }
  );
}
