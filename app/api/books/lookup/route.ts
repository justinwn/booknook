import { NextResponse, type NextRequest } from "next/server";
import { isValidIsbn, lookupIsbn, normalizeIsbn } from "@/lib/books/providers";

/**
 * Runs server-side so the browser never deals with provider CORS or with
 * which provider answered. Responses are cached for a day — an ISBN's
 * metadata doesn't change.
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("isbn") ?? "";
  const isbn = normalizeIsbn(raw);

  if (!isbn) {
    return NextResponse.json({ error: "Enter an ISBN." }, { status: 400 });
  }
  if (!isValidIsbn(isbn)) {
    return NextResponse.json(
      { error: "That ISBN doesn't look right — check for a typo." },
      { status: 422 }
    );
  }

  try {
    const outcome = await lookupIsbn(isbn);

    if (outcome.status === "unreachable") {
      return NextResponse.json(
        { error: "Couldn't reach the book services just now. Try again in a moment." },
        { status: 503 }
      );
    }
    if (outcome.status === "not-found") {
      return NextResponse.json(
        { error: "No book found with that ISBN. Double-check the digits." },
        { status: 404 }
      );
    }

    return NextResponse.json(outcome.book, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the book service. Try again." }, { status: 502 });
  }
}
