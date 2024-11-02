import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const text = url.searchParams.get("text");

  const response = await fetch(`http://host.docker.internal:3000/places?text=${text}`, {
    next: {
      revalidate: 60   //fazendo cache, se não colocar, o cache vai ser eterno
    }
  });

  return NextResponse.json(await response.json());
}